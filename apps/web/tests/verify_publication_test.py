"""Publication-verification boundary tests; all responses and files are local."""
from copy import deepcopy
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / 'apps/web/scripts/verify-publication.py'
spec = importlib.util.spec_from_file_location('publication_verifier', SCRIPT)
verifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verifier)
NODE = os.environ.get('NODE_BINARY', 'node')


def api_responses(expected):
    scope = deepcopy(expected['manifest']['scope'])
    products = [{**deepcopy(p['summary']), 'price_summary': deepcopy(expected['prices'][oid])}
        for oid, p in expected['products'].items()]
    responses = {'/api/scope/': scope, '/api/search/?limit=50': {
        'snapshot_id': scope['snapshot_id'], 'as_of_date': scope['as_of_date'],
        'products': products, 'total': len(products), 'has_more': False}}
    for oid, product in expected['products'].items():
        responses['/api/products/' + oid + '/'] = deepcopy(product['detail'])
    return responses


class VerifyPublication(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.expected = verifier.load_expected(node=NODE)

    def check(self, responses, expected=None):
        return verifier.verify_publication('http://local-fixture.invalid',
            expected or self.expected, lambda _base, path: deepcopy(responses[path]))

    def bad_manifest(self, mutate, message):
        with tempfile.TemporaryDirectory() as temp:
            manifest = deepcopy(self.expected['manifest'])
            mutate(manifest)
            path = Path(temp) / 'manifest.json'
            path.write_text(json.dumps(manifest))
            with self.assertRaisesRegex(ValueError, message):
                verifier.load_expected(path, node=NODE)

    def test_current_snapshot_uses_projection_prices_without_batch_report(self):
        self.assertEqual(len(self.expected['prices']), 50)
        self.assertEqual(set(self.expected['prices']['OF-US06']), {'label', 'note', 'kind'})
        self.assertNotIn('batch12', SCRIPT.read_text())
        self.assertNotIn('price_summaries.json', SCRIPT.read_text())

    def test_matching_current_api_checks_all_prices_and_details(self):
        result = self.check(api_responses(self.expected))
        self.assertEqual(result['snapshot_id'], self.expected['manifest']['snapshot_id'])
        self.assertEqual(result['price_summaries_matched'], 50)
        self.assertEqual(result['product_details_matched'], 50)
        self.assertTrue(result['local_projection_content_hash_verified'])

    def test_selected_future_snapshot_and_changed_price_follow_automatically(self):
        with tempfile.TemporaryDirectory() as temp:
            manifest = deepcopy(self.expected['manifest'])
            old_sid = manifest['snapshot_id']
            sid = 'LOCAL-FUTURE-TEST-pub2'
            db = sqlite3.connect(':memory:')
            db.row_factory = sqlite3.Row
            db.executescript((verifier.WEB / 'migrations/0001_publication.sql').read_text())
            db.executescript((verifier.WEB / 'data/publication.sql').read_text().replace(old_sid, sid))
            row = db.execute("SELECT detail_json FROM web_products WHERE offering_id='OF-US08'").fetchone()
            detail = json.loads(row[0])
            # Synthetic fixture only; no current or historical evidence is edited.
            detail['prices'] = [{'current_evidence_role': 'accepted', 'amount_status': 'known',
                'unit_amount_decimal': '6', 'currency': 'USD', 'charge_type': 'subscription',
                'recurrence_months': 1, 'billable_unit': 'staff_month', 'requirement': 'required',
                'plan_name': 'Synthetic future fixture', 'tax_status': 'unknown',
                'conditions': {}, 'plan_conditions': {}}]
            db.execute("UPDATE web_products SET detail_json=? WHERE offering_id='OF-US08'", (json.dumps(detail, ensure_ascii=False),))
            payload = verifier.publication_payload(db, sid)
            digest = hashlib.sha256(json.dumps(payload, ensure_ascii=False,
                separators=(',', ':'), sort_keys=True).encode()).hexdigest()
            scope = {**payload['scope'], 'content_sha256': digest}
            db.execute('UPDATE web_snapshots SET content_sha256=?,scope_json=?',
                (digest, json.dumps(scope, ensure_ascii=False)))
            manifest.update(snapshot_id=sid, content_sha256=digest, scope=scope)
            manifest_path, sql_path = Path(temp) / 'manifest.json', Path(temp) / 'publication.sql'
            manifest_path.write_text(json.dumps(manifest))
            sql_path.write_text('\n'.join(line for line in db.iterdump() if line.startswith('INSERT INTO')))
            db.close()
            expected = verifier.load_expected(manifest_path, sql_path, NODE)
            self.assertEqual(expected['prices']['OF-US08']['label'], '月額USD 6 / 人')
            result = self.check(api_responses(expected), expected)
            self.assertEqual(result['snapshot_id'], sid)

    def test_manifest_wrong_snapshot_rejected_before_api(self):
        self.bad_manifest(lambda m: m.update(snapshot_id='B12-20261012-pub2'), 'snapshot is absent')

    def test_manifest_wrong_research_hash_rejected(self):
        self.bad_manifest(lambda m: m.update(research_sha256='0' * 64), 'research_sha256')

    def test_manifest_wrong_content_hash_rejected(self):
        self.bad_manifest(lambda m: m.update(content_sha256='0' * 64), 'content_sha256')

    def test_manifest_wrong_scope_rejected(self):
        self.bad_manifest(lambda m: m['scope'].update(document_observations=1), 'Manifest scope')

    def test_manifest_wrong_counts_rejected(self):
        for field in ['products', 'category_memberships']:
            with self.subTest(field=field):
                self.bad_manifest(lambda m: m.update({field: 1}), 'count mismatch')

    def test_sql_content_tampering_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'publication.sql'
            sql = (verifier.WEB / 'data/publication.sql').read_text()
            self.assertIn('Nursegrid Manager', sql)
            path.write_text(sql.replace('Nursegrid Manager', 'Tampered product'))
            with self.assertRaisesRegex(ValueError, 'content hash mismatch'):
                verifier.load_expected(publication_path=path, node=NODE)

    def test_stale_remote_scope_rejected(self):
        responses = api_responses(self.expected)
        responses['/api/scope/']['snapshot_id'] = 'B12-20261012-pub2'
        with self.assertRaisesRegex(ValueError, 'Scope differs'):
            self.check(responses)

    def test_wrong_search_snapshot_or_date_rejected(self):
        for field in ['snapshot_id', 'as_of_date']:
            with self.subTest(field=field):
                responses = api_responses(self.expected)
                responses['/api/search/?limit=50'][field] = 'wrong'
                with self.assertRaisesRegex(ValueError, 'Search'):
                    self.check(responses)

    def test_stale_price_label_rejected(self):
        responses = api_responses(self.expected)
        ukg = next(p for p in responses['/api/search/?limit=50']['products'] if p['id'] == 'OF-US06')
        ukg['price_summary']['label'] += ' (stale fixture)'
        with self.assertRaisesRegex(ValueError, 'price summary differs: OF-US06'):
            self.check(responses)

    def test_duplicate_missing_or_unknown_product_rejected(self):
        for kind in ['duplicate', 'missing', 'unknown']:
            with self.subTest(kind=kind):
                responses = api_responses(self.expected)
                products = responses['/api/search/?limit=50']['products']
                if kind == 'duplicate': products[0] = deepcopy(products[1])
                if kind == 'missing': products.pop()
                if kind == 'unknown': products[0]['id'] = 'OF-US99'
                with self.assertRaisesRegex(ValueError, 'count or duplicate|product IDs'):
                    self.check(responses)

    def test_raw_price_change_outside_old_six_details_rejected(self):
        responses = api_responses(self.expected)
        responses['/api/products/OF-US08/']['prices'][0]['currency'] = 'JPY'
        with self.assertRaisesRegex(ValueError, 'Detail mismatch: OF-US08 / prices'):
            self.check(responses)

    def test_wrong_detail_snapshot_rejected(self):
        responses = api_responses(self.expected)
        responses['/api/products/OF-US08/']['snapshot_id'] = 'B12-20261012-pub2'
        with self.assertRaisesRegex(ValueError, 'Detail mismatch: OF-US08 / snapshot_id'):
            self.check(responses)

    def test_wrong_detail_assessment_rejected(self):
        responses = api_responses(self.expected)
        responses['/api/products/OF-US08/']['assessments'][0]['status'] = 'unsupported'
        with self.assertRaisesRegex(ValueError, 'Detail assessment mismatch: OF-US08'):
            self.check(responses)

    def test_fetch_requires_no_store_without_real_network(self):
        response = io.BytesIO(b'{}')
        response.status = 200
        response.headers = {'Cache-Control': 'public'}
        with patch.object(verifier.urllib.request, 'urlopen', return_value=response):
            with self.assertRaisesRegex(ValueError, 'lacks no-store'):
                verifier.fetch('http://local-fixture.invalid', '/api/scope/')

    def test_failure_preserves_existing_output_report(self):
        responses = api_responses(self.expected)
        responses['/api/scope/']['snapshot_id'] = 'wrong'
        with tempfile.TemporaryDirectory() as temp:
            output = Path(temp) / 'report.json'
            output.write_text('previous report')
            args = ['verify-publication.py', '--base', 'http://local-fixture.invalid',
                '--output', str(output), '--node', NODE]
            with patch.object(sys, 'argv', args), patch.object(verifier, 'fetch',
                side_effect=lambda _base, path: deepcopy(responses[path])), patch('sys.stderr', new_callable=io.StringIO):
                with self.assertRaises(SystemExit) as result:
                    verifier.main()
                self.assertEqual(result.exception.code, 1)
            self.assertEqual(output.read_text(), 'previous report')

    def test_optimized_python_still_rejects_local_mismatch_before_network(self):
        with tempfile.TemporaryDirectory() as temp:
            manifest = deepcopy(self.expected['manifest'])
            manifest['snapshot_id'] = 'wrong'
            path = Path(temp) / 'manifest.json'
            path.write_text(json.dumps(manifest))
            output = Path(temp) / 'report.json'
            result = subprocess.run([sys.executable, '-O', str(SCRIPT),
                '--manifest', str(path), '--base', 'http://127.0.0.1:9',
                '--output', str(output), '--node', NODE], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('snapshot is absent', result.stderr)
            self.assertFalse(output.exists())


if __name__ == '__main__':
    unittest.main()
