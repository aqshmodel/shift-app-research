"""Read-only checks against one locally selected immutable publication."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import urllib.request

ROOT = Path(__file__).resolve().parents[3]
WEB = ROOT / 'apps/web'
PRICE_SCRIPT = """
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const {summarizePrice} = await import(pathToFileURL(process.argv[1]).href);
const details = JSON.parse(readFileSync(0, 'utf8'));
process.stdout.write(JSON.stringify(Object.fromEntries(details.map(p =>
  [p.id, summarizePrice(p.prices, p.assessments.find(a => a.id === 'P01'))]))));
"""


def require(condition, message):
    # Verification must also fail when Python is run with -O.
    if not condition:
        raise ValueError(message)


def fetch(base, path):
    req = urllib.request.Request(base.rstrip('/') + path, headers={'User-Agent': 'Aqsh-publication-verification/1.0'})
    with urllib.request.urlopen(req, timeout=30) as response:
        require(response.status == 200, 'HTTP status differs: ' + path)
        require('no-store' in response.headers.get('Cache-Control', ''), 'Cache-Control lacks no-store: ' + path)
        return json.load(response)


def publication_payload(db, snapshot_id):
    # The builder hashes products and memberships in SQL insertion order.
    scope = json.loads(db.execute('SELECT scope_json FROM web_snapshots WHERE snapshot_id=?', (snapshot_id,)).fetchone()[0])
    scope.pop('content_sha256', None)
    products = [{'id': row['offering_id'], 'slug': row['slug'], 'search': row['search_text'],
        'summary': json.loads(row['summary_json']), 'detail': json.loads(row['detail_json'])}
        for row in db.execute('SELECT * FROM web_products WHERE snapshot_id=? ORDER BY rowid', (snapshot_id,))]
    membership = [{'category': row['category_id'], 'id': row['offering_id'],
        'provenance': json.loads(row['provenance_json'])}
        for row in db.execute('SELECT * FROM web_categories WHERE snapshot_id=? ORDER BY rowid', (snapshot_id,))]
    return {'scope': scope, 'products': products, 'membership': membership}


def load_expected(manifest_path=WEB / 'data/manifest.json', publication_path=WEB / 'data/publication.sql', node='node'):
    manifest = json.loads(manifest_path.read_text())
    with sqlite3.connect(':memory:') as db:
        db.row_factory = sqlite3.Row
        db.executescript((WEB / 'migrations/0001_publication.sql').read_text())
        db.executescript(publication_path.read_text())
        sid = manifest['snapshot_id']
        row = db.execute('SELECT * FROM web_snapshots WHERE snapshot_id=?', (sid,)).fetchone()
        require(row is not None, 'Manifest snapshot is absent from publication SQL')
        live = db.execute('SELECT snapshot_id FROM web_live WHERE id=1').fetchone()
        require(live is not None and live[0] == sid, 'Publication SQL live snapshot differs from manifest')
        scope = json.loads(row['scope_json'])
        require(scope == manifest['scope'], 'Manifest scope differs from publication SQL')
        for field in ['snapshot_id', 'research_sha256', 'content_sha256']:
            require(manifest[field] == scope[field] == row[field], 'Manifest/SQL mismatch: ' + field)
        require(row['as_of_date'] == scope['as_of_date'], 'Manifest/SQL date mismatch')
        payload = publication_payload(db, sid)
        raw = json.dumps(payload, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode()
        require(hashlib.sha256(raw).hexdigest() == manifest['content_sha256'], 'Publication content hash mismatch')
        require(len(payload['products']) == manifest['products'] == scope['offerings'], 'Manifest product count mismatch')
        require(len(payload['membership']) == manifest['category_memberships'], 'Manifest category count mismatch')
        require(0 < manifest['products'] <= 50, 'Catalog exceeds the supported single-page verification limit')
        products = {p['id']: p for p in payload['products']}
        require(len(products) == len(payload['products']), 'Duplicate local product IDs')
        for oid, product in products.items():
            for value in [product['summary'], product['detail']]:
                require(value['id'] == oid and value['snapshot_id'] == sid and value['as_of_date'] == scope['as_of_date'], 'Local product identity/version/date mismatch: ' + oid)
        details = [p['detail'] for p in payload['products']]
    result = subprocess.run([node, '--input-type=module', '-e', PRICE_SCRIPT, str(WEB / 'src/lib/price-summary.mjs')],
        input=json.dumps(details, ensure_ascii=False), text=True, capture_output=True, timeout=30)
    require(result.returncode == 0, 'Price summary generation failed: ' + result.stderr.strip())
    prices = json.loads(result.stdout)
    require(set(prices) == set(products), 'Price summary product IDs differ')
    return {'manifest': manifest, 'products': products, 'prices': prices,
        'manifest_path': str(manifest_path), 'publication_path': str(publication_path)}


def verify_publication(base, expected, fetcher=None):
    fetcher = fetcher or fetch
    manifest, local_products, prices = expected['manifest'], expected['products'], expected['prices']
    scope = fetcher(base, '/api/scope/')
    require(scope == manifest['scope'], 'Scope differs from selected local publication')
    search = fetcher(base, '/api/search/?limit=50')
    require(search['snapshot_id'] == manifest['snapshot_id'], 'Search snapshot differs')
    require(search['as_of_date'] == scope['as_of_date'], 'Search date differs')
    products = {p['id']: p for p in search['products']}
    require(len(products) == len(search['products']) == search['total'] == manifest['products'], 'Search count or duplicate IDs differ')
    require(not search['has_more'], 'Search catalog is incomplete')
    require(set(products) == set(local_products), 'Search product IDs differ')
    for oid, local in local_products.items():
        require(products[oid] == {**local['summary'], 'price_summary': prices[oid]}, 'Search product or price summary differs: ' + oid)
    details = []
    for oid, product in local_products.items():
        local = product['detail']
        deployed = fetcher(base, '/api/products/' + oid + '/')
        for field in ['id', 'snapshot_id', 'as_of_date', 'prices', 'open_questions', 'offering', 'record_count']:
            require(deployed[field] == local[field], 'Detail mismatch: ' + oid + ' / ' + field)
        require([(a['id'], a['status']) for a in deployed['assessments']] == [(a['id'], a['status']) for a in local['assessments']], 'Detail assessment mismatch: ' + oid)
        details.append({'id': oid, 'price': products[oid]['price_summary'], 'price_components': len(deployed['prices']), 'record_count': deployed['record_count']})
    return {'checked_at': datetime.now(timezone.utc).isoformat(), 'base': base, 'status': 'passed',
        'snapshot_id': manifest['snapshot_id'], 'research_sha256': manifest['research_sha256'],
        'content_sha256': manifest['content_sha256'], 'scope_matches': True,
        'local_projection_content_hash_verified': True, 'expected_manifest': expected['manifest_path'],
        'expected_publication': expected['publication_path'], 'price_summaries_matched': len(prices),
        'product_details_matched': len(details), 'details': details}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', required=True)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--manifest', type=Path, default=WEB / 'data/manifest.json')
    parser.add_argument('--publication', type=Path, default=WEB / 'data/publication.sql')
    parser.add_argument('--node', default=os.environ.get('NODE_BINARY', 'node'))
    args = parser.parse_args()
    try:
        expected = load_expected(args.manifest, args.publication, args.node)
        report = verify_publication(args.base, expected)
    except (ValueError, KeyError, OSError, sqlite3.Error, subprocess.TimeoutExpired) as error:
        parser.exit(1, 'Publication verification failed: ' + str(error) + '\n')
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k != 'details'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
