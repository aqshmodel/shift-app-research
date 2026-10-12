#!/usr/bin/env python3
"""Offline authoring DB, repeatable batch ingestion and D1-safe SQL export.

Python stdlib only. Original rows/IDs are preserved in archive and in the new DB.
No network, account creation or remote D1 writes happen here.
"""
from __future__ import annotations

import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import tempfile
import unicodedata
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / 'research.sqlite3'
ARCHIVE = ROOT / 'archive/batch02-original.zip'
BASE_NAME = 'Aqsh_Shift_Research_v2_Batch02_20261011.sqlite3'
BASE_BATCH = 'B01-20261011'
REVIEWER = 'Aqsh調査支援 / 公開一次資料レビュー'


def dumps(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def connect(path=DB):
    c = sqlite3.connect(path)
    c.row_factory = sqlite3.Row
    c.execute('PRAGMA foreign_keys=ON')
    return c


def ident(value):
    return '"' + value.replace('"', '""') + '"'


def tables(c):
    return [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")]


def cols(c, table):
    # table_info excludes generated columns, which must not be inserted.
    return [r['name'] for r in c.execute(f'PRAGMA table_info({ident(table)})')]


def insert(c, table, values):
    names = list(values)
    c.execute(f'INSERT INTO {ident(table)} ({",".join(map(ident,names))}) VALUES ({",".join("?" for _ in names)})', list(values.values()))


def normalized_url(url):
    s = urlsplit(url)
    # Only known tracking/language UI parameters are removed; semantic query params remain.
    query = [(k, v) for k, v in parse_qsl(s.query, keep_blank_values=True)
             if not k.lower().startswith('utm_') and k.lower() not in {'hslang', 'gclid', 'fbclid'}]
    path = s.path.rstrip('/') or '/'
    return urlunsplit((s.scheme.lower(), s.netloc.lower(), path, urlencode(sorted(query)), ''))


def document(c, url):
    normalized = normalized_url(url)
    key = 'DOC-' + hashlib.sha256(normalized.encode()).hexdigest()[:24]
    c.execute('INSERT OR IGNORE INTO source_documents(document_id,normalized_url) VALUES (?,?)', (key, normalized))
    assert c.execute('SELECT normalized_url FROM source_documents WHERE document_id=?', (key,)).fetchone()[0] == normalized
    return key


def dependency_order(c, omitted=()):
    pending = set(tables(c)) - set(omitted)
    done = set(omitted)
    order = []
    while pending:
        ready = sorted(t for t in pending if all(r['table'] == t or r['table'] in done
                       for r in c.execute(f'PRAGMA foreign_key_list({ident(t)})')))
        if not ready:
            raise ValueError(f'cyclic table dependencies: {sorted(pending)}')
        order.extend(ready)
        done.update(ready)
        pending.difference_update(ready)
    return order


def ordered_rows(c, table):
    names = cols(c, table)
    pk = [r['name'] for r in sorted(c.execute(f'PRAGMA table_info({ident(table)})'), key=lambda r: r['pk']) if r['pk']]
    rows = [dict(r) for r in c.execute(f'SELECT {",".join(map(ident,names))} FROM {ident(table)} ORDER BY {",".join(map(ident,pk or names))}')]
    self_fks = [r for r in c.execute(f'PRAGMA foreign_key_list({ident(table)})') if r['table'] == table]
    if not self_fks:
        return rows
    # Parent products, superseded observations and prior batches must precede dependents.
    result, remaining, done = [], rows, set()
    while remaining:
        ready = [r for r in remaining if all(r[f['from']] is None or (f['to'], r[f['from']]) in done for f in self_fks)]
        if not ready:
            raise ValueError(f'cyclic/missing self reference: {table}')
        result.extend(ready)
        for r in ready:
            done.update((f['to'], r[f['to']]) for f in self_fks)
        remaining = [r for r in remaining if r not in ready]
    return result


EXTRA = {
    'products': "market_region TEXT NOT NULL DEFAULT 'unknown' CHECK(market_region IN ('domestic','overseas','unknown'))",
    'sources': 'document_id TEXT NOT NULL REFERENCES source_documents(document_id)',
    'source_revisions': 'retrieval_url TEXT, title_at_retrieval TEXT',
    'observations': "batch_id TEXT NOT NULL REFERENCES research_batches(batch_id), record_category TEXT NOT NULL CHECK(record_category IN ('document_observation','price_component_observation','coverage_placeholder')), summary_ja TEXT GENERATED ALWAYS AS (json_extract(value_json,'$.summary_ja')) VIRTUAL",
    'assessment_resolutions': 'batch_id TEXT REFERENCES research_batches(batch_id), resolution_order INTEGER NOT NULL CHECK(resolution_order>0 AND resolution_order<9007199254740992)',
    'research_tasks': "priority INTEGER NOT NULL DEFAULT 3 CHECK(priority BETWEEN 1 AND 3), required_method TEXT NOT NULL DEFAULT 'unknown' CHECK(required_method IN ('unknown','public_document','vendor_document','vendor_quote','demo','synthetic_test','independent_source')), last_checked_on TEXT",
    'research_batches': 'ingest_sha256 TEXT CHECK(ingest_sha256 IS NULL OR length(ingest_sha256)=64), method_note TEXT'
}


def initialize(path):
    if path.exists():
        raise ValueError(f'destination exists: {path}')
    with tempfile.TemporaryDirectory() as tmp:
        with zipfile.ZipFile(ARCHIVE) as z:
            base_path = Path(tmp) / BASE_NAME
            base_path.write_bytes(z.read(BASE_NAME))
        base = connect(base_path)
        build_path = Path(tmp) / 'build.sqlite3'
        c = connect(build_path)
        models = (ROOT / 'tools/model.sql').read_text()
        first_end = models.index(';') + 1
        c.executescript(models[:first_end])  # source_documents before sources
        for r in base.execute("SELECT name,sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid"):
            sql = r['sql']
            if r['name'] in EXTRA:
                before, _, after = sql.partition('(')
                sql = before + '(\n ' + EXTRA[r['name']] + ',\n ' + after
            c.execute(sql)
        c.executescript(models[first_end:])
        original_resolution_order = {r[1]: r[0] for r in base.execute('SELECT rowid,resolution_id FROM assessment_resolutions')}
        base_tables = set(tables(base))
        for t in dependency_order(c, {'current_assessments', 'product_aliases', 'source_documents'}):
            if t not in base_tables:
                continue
            for row in ordered_rows(base, t):
                if t == 'products':
                    row['market_region'] = 'domestic' if row['product_id'].startswith('JP') else 'overseas'
                elif t == 'sources':
                    row['document_id'] = document(c, row['canonical_url'])
                elif t == 'source_revisions':
                    source = base.execute('SELECT * FROM sources WHERE source_id=?', (row['source_id'],)).fetchone()
                    row.update(retrieval_url=source['canonical_url'], title_at_retrieval=source['title'])
                elif t == 'observations':
                    metadata = json.loads(row['applicability_json'])
                    row['batch_id'] = metadata.get('research_batch', BASE_BATCH)
                    row['record_category'] = metadata.get('record_category', 'coverage_placeholder')
                elif t == 'assessment_resolutions':
                    row['resolution_order'] = original_resolution_order[row['resolution_id']]
                    row['batch_id'] = 'B02-20261011' if row['resolution_id'].startswith('B02-') else BASE_BATCH
                insert(c, t, row)
        for p in c.execute('SELECT * FROM products').fetchall():
            for alias in [p['canonical_name'], *json.loads(p['aliases_json'])]:
                if isinstance(alias, str) and alias.strip():
                    c.execute('INSERT OR IGNORE INTO product_aliases VALUES (?,?,?)', (p['product_id'], alias, unicodedata.normalize('NFKC', alias).casefold()))
        c.executemany('INSERT OR REPLACE INTO schema_info VALUES (?,?)', [
            ('version', '3.1'), ('schema_target', 'Cloudflare D1 / SQLite'),
            ('scope', '公開一次資料の履歴と提供単位別の最新評価。独立性能試験は未実施。'),
            ('price_storage', 'Decimal文字列とISO通貨。未知額はNULL。年契約月額相当は条件JSONに明記。'),
            ('resolution_selection', '提供単位×設問。as_of_date→resolution_order。rowid不使用。'),
            ('region_policy', 'domestic/overseasは元調査区分。US識別子は国コードではない。')])
        c.commit()
        assert c.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
        assert not c.execute('PRAGMA foreign_key_check').fetchall()
        c.close()
        base.close()
        path.write_bytes(build_path.read_bytes())


def source_revision(c, source, batch, number):
    did = document(c, source['url'])
    row = c.execute('SELECT source_id FROM sources WHERE document_id=? ORDER BY source_id LIMIT 1', (did,)).fetchone()
    sid = row[0] if row else f'{batch}-SRC{number:03}'
    if not row:
        insert(c, 'sources', dict(source_id=sid, source_type='official_web', publisher=source['publisher'],
                                 canonical_url=source['url'], title=source['title'], access_scope='public',
                                 reuse_permission='未確認。本文転載せず要約・URLを保存。', document_id=did))
    rid = f'{batch}-REV{number:03}'
    insert(c, 'source_revisions', dict(revision_id=rid, source_id=sid, published_on=source.get('published_on'),
        updated_on=source.get('updated_on'), retrieved_on=source['retrieved_on'], version_label=source.get('version_label'),
        scope_note=source.get('scope_note', '公式ページ本文の取得。原文全文・画像・添付書類は保存していない。'),
        retrieval_url=source['url'], title_at_retrieval=source['title']))
    archive=source.get('archive_path')
    insert(c, 'source_method_attributes', dict(revision_id=rid, origin_kind=source.get('method','public_web_body'), web_reference=source.get('reference'),
        full_text_archived=int(bool(archive)), scope_note=source.get('method_note','本文の該当箇所を確認して要約。検索抜粋のみの記載は採用しない。')))
    if archive:
        path=(ROOT/archive).resolve()
        if not path.is_relative_to(ROOT):
            raise ValueError('archive path must stay in package')
        insert(c,'source_archives',dict(revision_id=rid,relative_path=archive,
            sha256=hashlib.sha256(path.read_bytes()).hexdigest(),media_type='application/pdf',page_count=source.get('page_count')))
    return rid


def migrate(c):
    """Upgrade v3.0 locally without rewriting observations or resolution history."""
    if c.execute("SELECT value FROM schema_info WHERE key='version'").fetchone()[0]=='3.1':
        return
    if c.in_transaction:
        raise ValueError('migration must start outside another transaction')
    model=(ROOT/'tools/model.sql').read_text()
    selected=[]
    for name in ('classification_corrections','source_archives','brand_assets'):
        selected.append(re.search(r'CREATE TABLE '+name+r' \(.*?\n\);',model,re.S)[0])
    selected.append(re.search(r'CREATE INDEX brand_assets_selection.*?;',model,re.S)[0])
    for name in ('v_preferred_brand_assets','v_assessments','v_price_details'):
        selected.append('DROP VIEW IF EXISTS '+name+';')
        selected.append(re.search(r'CREATE VIEW '+name+r' AS\n.*?;',model,re.S)[0])
    # executescript commits an open transaction, so use explicit transactional SQL.
    try:
        c.executescript('BEGIN;\n'+'\n'.join(selected)+"\nUPDATE schema_info SET value='3.1' WHERE key='version';\nCOMMIT;")
    except Exception:
        c.rollback()
        raise


def ingest(c, path):
    raw = path.read_bytes()
    p = json.loads(raw)
    batch = p['batch_id']
    checksum = hashlib.sha256(raw).hexdigest()
    policy_version=p.get('resolution_policy_version',1)
    if policy_version not in (1,2):
        raise ValueError('unsupported resolution policy version')
    existing = c.execute('SELECT ingest_sha256 FROM research_batches WHERE batch_id=?', (batch,)).fetchone()
    if existing:
        if existing[0] != checksum:
            raise ValueError('same batch ID has different content; create a new batch ID')
        return {'batch_id': batch, 'status': 'already_applied'}
    with c:
        latest = c.execute("SELECT value FROM schema_info WHERE key='latest_batch'").fetchone()
        insert(c, 'research_batches', dict(batch_id=batch, as_of_date=p['as_of_date'],
            description=p.get('description', '公開一次資料追加調査'), prior_batch=p.get('prior_batch', latest[0] if latest else None),
            ingest_sha256=checksum, method_note=p.get('method', 'public primary-source documents; no independent test')))
        revisions = {s['key']: source_revision(c, s, batch, i) for i, s in enumerate(p['sources'], 1)}
        # Reference rules have their own provenance; they do not prove vendor support.
        for rule in p.get('regulations', []):
            if not isinstance(rule['applicability'], dict):
                raise ValueError('regulation applicability must be an object')
            insert(c, 'regulations', dict(regulation_id=rule['regulation_id'], title=rule['title'],
                authority_type=rule['authority_type'], jurisdiction=rule['jurisdiction'],
                applicability_json=dumps(rule['applicability']), version_label=rule.get('version_label'),
                effective_from=rule.get('effective_from'), effective_to=rule.get('effective_to'),
                revision_id=revisions[rule['source']]))
        grouped = defaultdict(list)
        rejected = defaultdict(set)
        correction_notes = defaultdict(list)
        for i, f in enumerate(p['findings'], 1):
            offering = f.get('offering', 'OF-' + f['product'])
            assert c.execute('SELECT 1 FROM offerings WHERE offering_id=? AND product_id=?', (offering, f['product'])).fetchone()
            oid = f'{batch}-OBS{i:04}'
            state = f.get('state', 'known')
            known = state == 'known'
            value = dumps({'summary_ja': f['summary']}) if known else None
            insert(c, 'observations', dict(observation_id=oid, offering_id=offering, criterion_id=f['criterion'],
                value_state=state, value_json=value, support_status=f.get('support', 'limited') if known else 'unknown',
                delivery_mode=f.get('delivery', 'unknown'), verification_stage='documented', assertion_kind=f.get('assertion', 'source_statement'),
                applicability_json=dumps({'research_batch': batch, 'record_category': 'document_observation',
                    'scope': f.get('scope', 'プラン・地域・版の留保は本文・limitations参照')}),
                limitations=f['limitations'], unknown_reason=None if known else f['summary'], recorded_on=p['as_of_date'],
                reviewed_by=REVIEWER, batch_id=batch, record_category='document_observation'))
            insert(c, 'observation_evidence', dict(observation_id=oid, revision_id=revisions[f['source']],
                evidence_id=f'{batch}-EV{i:04}', locator=f['locator'], paraphrase=f['summary'],
                stance='supports' if known else 'context', method='official_page_body_review', checked_on=p['as_of_date']))
            grouped[(offering, f['criterion'])].append((oid, state))
        for i, correction in enumerate(p.get('reclassifications',[]),1):
            old=c.execute('SELECT * FROM observations WHERE observation_id=?',(correction['observation_id'],)).fetchone()
            if old is None or old['criterion_id']==correction['criterion']:
                raise ValueError('missing observation or unchanged classification')
            oid=f'{batch}-CORR{i:03}'
            row={k:old[k] for k in cols(c,'observations')}
            row.update(observation_id=oid,criterion_id=correction['criterion'],batch_id=batch,
                supersedes_observation_id=old['observation_id'],recorded_on=p['as_of_date'],reviewed_by=REVIEWER,
                applicability_json=dumps({'research_batch':batch,'record_category':row['record_category'],
                    'review_method':'editorial_reclassification','rationale':correction['rationale']}))
            if correction.get('limitations'):
                row['limitations']=correction['limitations']
            insert(c,'observations',row)
            for j,e in enumerate(c.execute('SELECT * FROM observation_evidence WHERE observation_id=? ORDER BY evidence_id',(old['observation_id'],)).fetchall(),1):
                value=dict(e)
                value.update(observation_id=oid,evidence_id=f'{batch}-CORR{i:03}-EV{j}',
                    method='editorial_reclassification',checked_on=p['as_of_date'])
                insert(c,'observation_evidence',value)
            oldkey=(old['offering_id'],old['criterion_id'])
            newkey=(old['offering_id'],correction['criterion'])
            grouped[oldkey]  # Refresh the old cell even without new facts there.
            grouped[newkey].append((oid,row['value_state']))
            rejected[oldkey].add(old['observation_id'])
            correction_notes[oldkey].append(correction['rationale'])
            correction_notes[newkey].append(correction['rationale'])
            insert(c,'classification_corrections',dict(correction_id=f'{batch}-CC{i:03}',batch_id=batch,
                original_observation_id=old['observation_id'],corrected_observation_id=oid,
                rationale=correction['rationale'],recorded_on=p['as_of_date']))
        sequence = c.execute('SELECT COALESCE(MAX(resolution_order),0) FROM assessment_resolutions').fetchone()[0]
        for i, ((offering, criterion), obs) in enumerate(sorted(grouped.items()), 1):
            prior = c.execute('SELECT * FROM v_latest_resolutions WHERE offering_id=? AND criterion_id=?', (offering, criterion)).fetchone()
            prior_evidence = c.execute('SELECT observation_id,role FROM resolution_evidence WHERE resolution_id=?', (prior['resolution_id'],)).fetchall() if prior else []
            # v1 remains replayable for immutable historical batches. New batches
            # use v2 so a classification exclusion survives later observations.
            if policy_version==2:
                rejected[(offering,criterion)].update(e['observation_id'] for e in prior_evidence if e['role']=='rejected')
            has_known = any(state == 'known' for _, state in obs)
            disputed = any(state == 'disputed' for _, state in obs)
            retain = not has_known and not disputed and prior and prior['decision'] == 'accepted' and (
                not rejected[(offering,criterion)] or any(e['role']=='accepted' and e['observation_id'] not in rejected[(offering,criterion)] for e in prior_evidence))
            decision = 'unresolved' if disputed else 'accepted' if has_known or retain else 'unresolved'
            rationale = '公開資料に記載された範囲を採用。部分確認を含む。実動作・性能・契約適用は未確認。' if has_known else '今回の確認範囲では設問全体を確定できない。非対応とは判断しない。'
            if disputed:
                rationale = '公開資料に相反する記述があり未確定。地域・プラン・版・算式の照合が必要。'
            if retain:
                rationale = '今回の未確認だけでは過去の採用根拠を否定しない。以前の根拠を維持し追加留保を記録。'
            if correction_notes[(offering,criterion)]:
                rationale+=' 分類訂正：'+' / '.join(correction_notes[(offering,criterion)])
            rid = f'{batch}-RES{i:04}'
            insert(c, 'assessment_resolutions', dict(resolution_id=rid, offering_id=offering, criterion_id=criterion,
                as_of_date=p['as_of_date'], decision=decision, rationale=rationale, reviewer=REVIEWER,
                batch_id=batch, resolution_order=sequence+i))
            for oid, state in obs:
                role = 'conflicting' if state == 'disputed' else 'accepted' if state == 'known' else 'context'
                insert(c, 'resolution_evidence', dict(resolution_id=rid, observation_id=oid, role=role))
            for e in prior_evidence:
                role = 'rejected' if e['observation_id'] in rejected[(offering,criterion)] else e['role'] if retain else 'context'
                insert(c, 'resolution_evidence', dict(resolution_id=rid, observation_id=e['observation_id'], role=role))
            for oid in rejected[(offering,criterion)]:
                c.execute('INSERT OR IGNORE INTO resolution_evidence VALUES (?,?,?)',(rid,oid,'rejected'))
            # A broad research task is not completed merely because one document was found.
            for task in c.execute("SELECT task_id FROM research_tasks WHERE offering_id=? AND criterion_id=? AND task_state='not_started'", (offering, criterion)).fetchall():
                c.execute("UPDATE research_tasks SET task_state='in_progress',last_checked_on=? WHERE task_id=?", (p['as_of_date'], task[0]))
        changed_products={f['product'] for f in p['findings']}
        changed_products.update(c.execute('SELECT product_id FROM offerings WHERE offering_id=?',(offering,)).fetchone()[0] for offering,_ in grouped)
        for product in sorted(changed_products):
            insert(c, 'batch_product_membership', dict(batch_id=batch, product_id=product, action='enriched'))
        for i, price in enumerate(p.get('prices', []), 1):
            plid = f'{batch}-PLAN{i:03}'
            oid = next(oid for (off, crit), obs in grouped.items() if off == 'OF-'+price['product'] and crit == price['criterion']
                       for oid, state in obs if state == 'known' and c.execute('SELECT 1 FROM observation_evidence WHERE observation_id=? AND revision_id=?', (oid,revisions[price['source']])).fetchone())
            insert(c, 'plans', dict(plan_id=plid, offering_id='OF-'+price['product'], plan_name=price['plan'],
                commitment_months=price['commitment_months'], billing_period_months=price['billing_period_months'],
                prepayment=price['prepayment'], min_billable_units=price.get('min_billable_units'), valid_from=p['as_of_date'], terms_note=price['conditions']['notes']))
            insert(c, 'price_components', dict(component_id=f'{batch}-PRICE{i:03}', plan_id=plid,
                component_name=price['plan'], charge_type=price['charge_type'], currency=price['currency'], tax_status=price['tax_status'],
                amount_status=price.get('amount_status', 'known'), unit_amount_decimal=price['amount'], billable_unit=price['billable_unit'],
                quantity_definition=price.get('quantity_definition','料金ページのemployee定義。管理者・休職者・最低人数は未確認。'),
                min_quantity=price.get('min_quantity'),max_quantity=price.get('max_quantity'),
                recurrence_months=price['recurrence_months'], requirement=price['requirement'], price_observation_id=oid,
                valid_from=p['as_of_date'], conditions_json=dumps(price['conditions'])))
        for i,asset in enumerate(p.get('logos',[]),1):
            if not asset['url'].startswith(('https://','http://','data:image/svg+xml;base64,')):
                raise ValueError('unsafe logo URL')
            insert(c,'brand_assets',dict(asset_id=f'{batch}-LOGO{i:03}',product_id=asset['product'],batch_id=batch,
                revision_id=revisions[asset['source']],logo_kind=asset['kind'],brand_name=asset['brand_name'],
                asset_url=asset['url'],source_page_url=asset['page'],locator=asset['locator'],
                verification_state=asset.get('verification_state','verified'),verified_on=p['as_of_date'],
                selection_rank=asset.get('selection_rank',0),media_type=asset.get('content_type'),
                http_status=asset.get('http_status'),notes=asset['note']))
        for i, check in enumerate(p.get('retrieval_checks', []), 1):
            insert(c, 'retrieval_checks', dict(check_id=f'{batch}-CHECK{i:03}', batch_id=batch, product_id=check['product'],
                url=check['url'], result=check['result'], notes=check['notes'], checked_on=p['as_of_date']))
        for i, task in enumerate(p.get('followups', []), 1):
            insert(c, 'research_tasks', dict(task_id=f'{batch}-TASK{i:03}', offering_id='OF-'+task['product'], criterion_id=task['criterion'],
                task_state='in_progress', question=task['question'], evidence_needed=task['method'], owner='未割当',
                priority=task['priority'], required_method=task['method'], last_checked_on=p['as_of_date']))
        for task in p.get('task_updates', []):
            c.execute('UPDATE research_tasks SET task_state=?,priority=?,required_method=?,last_checked_on=? WHERE task_id=?',
                (task.get('state','in_progress'),task.get('priority',1),task['method'],p['as_of_date'],task['task_id']))
            if c.execute('SELECT changes()').fetchone()[0] != 1:
                raise ValueError(f"missing task: {task['task_id']}")
            insert(c, 'research_task_updates', dict(update_id=batch+'-'+task['task_id'], task_id=task['task_id'],
                batch_id=batch,note=task['note'],recorded_on=p['as_of_date']))
        c.execute("INSERT OR REPLACE INTO schema_info VALUES ('latest_batch',?)", (batch,))
    return {'batch_id':batch,'status':'applied','new_document_findings':len(p['findings']),
        'classification_corrections':len(p.get('reclassifications',[])),
        'observations':len(p['findings'])+len(p.get('reclassifications',[])),
        'logos':len(p.get('logos',[])),'source_revisions':len(p['sources']),'resolutions':len(grouped),
        'reference_regulations':len(p.get('regulations',[]))}


def literal(value):
    if value is None:
        return 'NULL'
    if isinstance(value, str):
        if '\x00' in value:
            raise ValueError('NUL cannot be safely dumped as a SQL string')
        return "'" + value.replace("'", "''") + "'"
    if isinstance(value, bytes):
        return "X'" + value.hex() + "'"
    return str(value)


def export(c):
    out = ROOT / 'd1'
    out.mkdir(exist_ok=True)
    # All DDL first; triggers then maintain derived current pointers during inserts.
    ddl = []
    for kind in ['table','index','trigger','view']:
        ddl.extend(r[0]+';' for r in c.execute('SELECT sql FROM sqlite_master WHERE type=? AND sql IS NOT NULL AND name NOT LIKE \'sqlite_%\' ORDER BY name', (kind,)))
    schema = '\n\n'.join(ddl) + '\n'
    data = []
    for table in dependency_order(c, {'current_assessments'}):
        names = cols(c, table)
        for row in ordered_rows(c, table):
            sql = f'INSERT INTO {ident(table)} ({",".join(map(ident,names))}) VALUES ({",".join(literal(row[n]) for n in names)});'
            if len(sql.encode()) >= 100000:
                raise ValueError(f'D1 statement too large: {table}')
            data.append(sql)
    (out/'schema.sql').write_text(schema,encoding='utf-8')
    (out/'import.sql').write_text('-- Import into an EMPTY D1 database. No explicit transactions or foreign_keys=OFF.\n'+schema+'\n'+'\n'.join(data)+'\n',encoding='utf-8')
    return {'insert_statements':len(data),'max_insert_bytes':max(map(lambda s:len(s.encode()),data)), 'sql_bytes':(out/'import.sql').stat().st_size}


def fingerprint(c):
    h=hashlib.sha256()
    for table in tables(c):
        h.update(table.encode())
        for row in ordered_rows(c,table):
            h.update(dumps(row).encode())
    return h.hexdigest()


def stats(c):
    counts={t:c.execute(f'SELECT COUNT(*) FROM {ident(t)}').fetchone()[0] for t in tables(c)}
    return dict(tables=counts, products=counts['products'], offerings=counts['offerings'],
        document_observations=c.execute("SELECT COUNT(*) FROM observations WHERE record_category='document_observation'").fetchone()[0],
        document_states=dict(c.execute("SELECT value_state,COUNT(*) FROM observations WHERE record_category='document_observation' GROUP BY value_state")),
        common_slots=c.execute('SELECT COUNT(*) FROM v_current40').fetchone()[0],
        documented_common_scopes=c.execute('SELECT COALESCE(SUM(documented_scope),0) FROM v_current40').fetchone()[0],
        research_documents=c.execute("SELECT COUNT(DISTINCT s.document_id) FROM observations o JOIN observation_evidence e USING(observation_id) JOIN source_revisions r USING(revision_id) JOIN sources s USING(source_id) WHERE o.record_category='document_observation'").fetchone()[0],
        benchmark_runs=counts['benchmark_runs'],
        preferred_logos=dict(c.execute('SELECT logo_kind,COUNT(*) FROM v_preferred_brand_assets GROUP BY logo_kind')),
        latest_batch=c.execute("SELECT value FROM schema_info WHERE key='latest_batch'").fetchone()[0])


def viewer(c):
    template=(ROOT/'tools/viewer.template.html').read_text()
    data={k:[dict(r) for r in c.execute(sql)] for k,sql in {
        'products':"SELECT v.*,(SELECT COUNT(*) FROM observations o WHERE o.offering_id=v.offering_id AND o.batch_id=(SELECT value FROM schema_info WHERE key='latest_batch')) AS latest_batch_count,b.asset_url AS logo_url,b.logo_kind,b.brand_name,b.source_page_url AS logo_source_page,b.notes AS logo_notes FROM v_product_coverage v LEFT JOIN v_preferred_brand_assets b USING(product_id) ORDER BY product_id,offering_id",
        'observations':"SELECT * FROM v_observations_with_sources WHERE record_category='document_observation' ORDER BY product_id,criterion_id,batch_id DESC,observation_id,evidence_id",
        'prices':'SELECT * FROM v_price_details ORDER BY product_id,plan_id,component_id',
        'common':'SELECT * FROM v_current40 ORDER BY offering_id,criterion_id',
        'regulations':'SELECT g.*,r.retrieval_url,r.retrieved_on,r.title_at_retrieval FROM regulations g JOIN source_revisions r USING(revision_id) ORDER BY g.regulation_id',
        'criteria':"SELECT * FROM criteria WHERE research_stage='L1_common' ORDER BY criterion_id"}.items()}
    data['counts']=stats(c)
    as_of_date=c.execute('SELECT as_of_date FROM research_batches WHERE batch_id=?', (data['counts']['latest_batch'],)).fetchone()[0]
    year,month,day=map(int,as_of_date.split('-'))
    as_of_label=f'{year}年{month}月{day}日'
    grouped={}
    for row in data['observations']:
        key=row['observation_id']
        if key not in grouped:
            grouped[key]={**row,'evidence':[]}
        if row['evidence_id']:
            grouped[key]['evidence'].append({k:row[k] for k in ['canonical_url','title','locator','retrieved_on','evidence_id']})
    data['observations']=list(grouped.values())
    payload=dumps(data).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
    output=template.replace('__DATASET__',payload).replace('__DOCUMENT_COUNT__',str(data['counts']['document_observations'])).replace('__BATCH_LABEL__',data['counts']['latest_batch'].split('-')[0].replace('B0','Batch')).replace('__AS_OF_LABEL__',as_of_label)
    (ROOT/'comparison.html').write_text(output,encoding='utf-8')


def verify(c):
    assert c.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
    assert not c.execute('PRAGMA foreign_key_check').fetchall()
    assert not c.execute("SELECT 1 FROM observations o JOIN research_batches b USING(batch_id) WHERE b.ingest_sha256 IS NOT NULL AND NOT EXISTS(SELECT 1 FROM observation_evidence e WHERE e.observation_id=o.observation_id)").fetchall()
    for row in c.execute('SELECT * FROM source_archives'):
        assert hashlib.sha256((ROOT/row['relative_path']).read_bytes()).hexdigest()==row['sha256']
    assert not c.execute("SELECT 1 FROM price_components WHERE amount_status<>'known' AND unit_amount_decimal IS NOT NULL").fetchall()
    assert not c.execute('SELECT 1 FROM resolution_evidence e JOIN assessment_resolutions r USING(resolution_id) JOIN observations o USING(observation_id) WHERE r.offering_id<>o.offering_id OR r.criterion_id<>o.criterion_id').fetchall()
    expected=c.execute('SELECT COUNT(*) FROM offerings').fetchone()[0]*c.execute("SELECT COUNT(*) FROM criteria WHERE research_stage='L1_common'").fetchone()[0]
    assert c.execute('SELECT COUNT(*) FROM v_current40').fetchone()[0]==expected
    assert not c.execute('SELECT 1 FROM current_assessments a JOIN assessment_resolutions x USING(resolution_id) JOIN assessment_resolutions y ON y.offering_id=a.offering_id AND y.criterion_id=a.criterion_id WHERE y.as_of_date>x.as_of_date OR (y.as_of_date=x.as_of_date AND y.resolution_order>x.resolution_order)').fetchall()
    sql=(ROOT/'d1/import.sql').read_text()
    assert not re.search(r'\bBEGIN\s+TRANSACTION\b|PRAGMA\s+foreign_keys\s*=\s*OFF|\bCOMMIT\s*;',sql,re.I)
    fresh=connect(':memory:')
    fresh.executescript(sql)
    assert not fresh.execute('PRAGMA foreign_key_check').fetchall()
    assert fingerprint(c)==fingerprint(fresh)
    assert [tuple(r) for r in c.execute('SELECT * FROM v_current40 ORDER BY offering_id,criterion_id')]==[tuple(r) for r in fresh.execute('SELECT * FROM v_current40 ORDER BY offering_id,criterion_id')]
    fresh.close()
    return {'integrity_check':'ok','foreign_key_errors':0,'sql_roundtrip_equal':True,'data_sha256':fingerprint(c),**stats(c)}


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('action',choices=['init','migrate','ingest','export','verify','viewer','stats'])
    parser.add_argument('--db',type=Path,default=DB)
    parser.add_argument('--batch',type=Path)
    args=parser.parse_args()
    if args.action=='init':
        initialize(args.db)
        print(args.db)
        return
    with connect(args.db) as c:
        if args.action=='ingest' and args.batch is None:
            parser.error('ingest requires --batch')
        action={'migrate':lambda:migrate(c),'ingest':lambda:ingest(c,args.batch),'export':lambda:export(c),'verify':lambda:verify(c),'viewer':lambda:viewer(c),'stats':lambda:stats(c)}[args.action]
        print(json.dumps(action(),ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()
