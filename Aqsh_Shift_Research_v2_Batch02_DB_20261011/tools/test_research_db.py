"""Regression tests for evidence history, offering scope and repeatable imports."""
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest
import zipfile

from research_db import ARCHIVE, BASE_NAME, DB, ROOT, connect, fingerprint, ingest, initialize, insert


class ResearchDBTests(unittest.TestCase):
    def setUp(self):
        self.c=connect(':memory:')
        src=connect(DB)
        src.backup(self.c)
        src.close()

    def tearDown(self):
        self.c.close()

    def add_resolution(self, offering, criterion, date='2026-10-11'):
        n=self.c.execute('SELECT MAX(resolution_order)+1 FROM assessment_resolutions').fetchone()[0]
        rid=f'TEST-R{n}'
        insert(self.c,'assessment_resolutions',dict(resolution_id=rid,offering_id=offering,criterion_id=criterion,
            as_of_date=date,decision='unresolved',rationale='test fixture',reviewer='test',resolution_order=n))
        return rid

    def test_batch_replay_and_changed_content_rejected(self):
        before=fingerprint(self.c)
        for batch in sorted((ROOT/'batches').glob('B*.json')):
            self.assertEqual(ingest(self.c,batch)['status'],'already_applied')
        self.assertEqual(fingerprint(self.c),before)
        with tempfile.TemporaryDirectory() as tmp:
            p=json.loads((ROOT/'batches/B03-20261011.json').read_text())
            p['findings'][0]['summary']='changed fixture'
            path=Path(tmp)/'changed.json'
            path.write_text(json.dumps(p))
            with self.assertRaises(ValueError): ingest(self.c,path)
        self.assertEqual(fingerprint(self.c),before)

    def test_same_day_order_does_not_depend_on_rowid(self):
        rid=self.add_resolution('OF-JP01','A01')
        self.assertEqual(self.c.execute("SELECT resolution_id FROM current_assessments WHERE offering_id='OF-JP01' AND criterion_id='A01'").fetchone()[0],rid)
        self.add_resolution('OF-JP01','A01','2020-01-01')
        self.assertEqual(self.c.execute("SELECT resolution_id FROM current_assessments WHERE offering_id='OF-JP01' AND criterion_id='A01'").fetchone()[0],rid)

    def test_two_offerings_of_one_product_are_separate(self):
        before=self.c.execute("SELECT finding FROM v_current40 WHERE offering_id='OF-JP01' AND criterion_id='B01'").fetchone()[0]
        insert(self.c,'offerings',dict(offering_id='OF-JP01-OTHER',product_id='JP01',edition='test',scope_note='fixture'))
        rid=self.add_resolution('OF-JP01-OTHER','B01')
        self.assertEqual(self.c.execute("SELECT COUNT(*) FROM v_current40 WHERE product_id='JP01'").fetchone()[0],80)
        self.assertEqual(self.c.execute("SELECT finding FROM v_current40 WHERE offering_id='OF-JP01' AND criterion_id='B01'").fetchone()[0],before)
        self.assertEqual(self.c.execute("SELECT resolution_id FROM v_current40 WHERE offering_id='OF-JP01-OTHER' AND criterion_id='B01'").fetchone()[0],rid)

    def test_scope_mismatch_is_rejected(self):
        rid=self.add_resolution('OF-JP01','A01')
        wrong=self.c.execute("SELECT observation_id FROM observations WHERE offering_id='OF-JP02' LIMIT 1").fetchone()[0]
        with self.assertRaises(sqlite3.IntegrityError):
            insert(self.c,'resolution_evidence',dict(resolution_id=rid,observation_id=wrong,role='accepted'))
        with self.assertRaises(sqlite3.IntegrityError):
            self.c.execute("UPDATE current_assessments SET resolution_id=? WHERE offering_id='OF-JP02' AND criterion_id='A01'",(rid,))

    def test_resolution_history_is_append_only(self):
        rid=self.add_resolution('OF-JP01','A01')
        with self.assertRaises(sqlite3.IntegrityError): self.c.execute('DELETE FROM assessment_resolutions WHERE resolution_id=?',(rid,))
        with self.assertRaises(sqlite3.IntegrityError): self.c.execute("UPDATE assessment_resolutions SET rationale='rewrite' WHERE resolution_id=?",(rid,))

    def test_unknown_price_cannot_be_zero(self):
        cid=self.c.execute("SELECT component_id FROM price_components WHERE amount_status='quote_required' LIMIT 1").fetchone()[0]
        with self.assertRaises(sqlite3.IntegrityError): self.c.execute("UPDATE price_components SET unit_amount_decimal='0' WHERE component_id=?",(cid,))
        self.assertIsNone(self.c.execute('SELECT unit_amount_decimal FROM price_components WHERE component_id=?',(cid,)).fetchone()[0])

    def test_original_observations_and_evidence_preserved(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'baseline.sqlite3'
            with zipfile.ZipFile(ARCHIVE) as z: path.write_bytes(z.read(BASE_NAME))
            base=connect(path)
            for table in ['observations','observation_evidence','source_revisions','assessment_resolutions','resolution_evidence','price_components']:
                names=[r['name'] for r in base.execute(f'PRAGMA table_info({table})')]
                pk=[r['name'] for r in base.execute(f'PRAGMA table_info({table})') if r['pk']]
                original=[dict(r) for r in base.execute(f'SELECT * FROM {table}')]
                current={tuple(r[k] for k in pk):dict(r) for r in self.c.execute(f'SELECT {",".join(names)} FROM {table}')}
                for row in original: self.assertEqual(current[tuple(row[k] for k in pk)],row)
            base.close()

    def test_full_rebuild_is_repeatable(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'rebuilt.sqlite3'
            initialize(path)
            with connect(path) as c:
                for batch in sorted((ROOT/'batches').glob('B*.json')):
                    ingest(c,batch)
                self.assertEqual(fingerprint(c),fingerprint(self.c))

    def test_classification_correction_preserves_source_and_rejects_old_scope(self):
        for correction in self.c.execute('SELECT * FROM classification_corrections'):
            old=self.c.execute('SELECT * FROM observations WHERE observation_id=?',(correction['original_observation_id'],)).fetchone()
            new=self.c.execute('SELECT * FROM observations WHERE observation_id=?',(correction['corrected_observation_id'],)).fetchone()
            self.assertNotEqual(old['criterion_id'],new['criterion_id'])
            self.assertEqual(new['supersedes_observation_id'],old['observation_id'])
            self.assertEqual(new['value_json'],old['value_json'])
            old_sources=[r[0] for r in self.c.execute('SELECT revision_id FROM observation_evidence WHERE observation_id=? ORDER BY revision_id',(old['observation_id'],))]
            new_sources=[r[0] for r in self.c.execute('SELECT revision_id FROM observation_evidence WHERE observation_id=? ORDER BY revision_id',(new['observation_id'],))]
            self.assertEqual(old_sources,new_sources)
            role=self.c.execute('SELECT e.role FROM current_assessments a JOIN resolution_evidence e USING(resolution_id) WHERE a.offering_id=? AND a.criterion_id=? AND e.observation_id=?',(old['offering_id'],old['criterion_id'],old['observation_id'])).fetchone()[0]
            self.assertEqual(role,'rejected')

    def test_service_logo_has_priority_over_company_logo(self):
        self.assertEqual(self.c.execute('SELECT COUNT(*) FROM v_preferred_brand_assets').fetchone()[0],50)
        row=dict(self.c.execute("SELECT * FROM brand_assets WHERE product_id='US15'").fetchone())
        row.update(asset_id='TEST-SERVICE-LOGO',logo_kind='service',brand_name='test',selection_rank=-100)
        insert(self.c,'brand_assets',row)
        self.assertEqual(self.c.execute("SELECT asset_id FROM v_preferred_brand_assets WHERE product_id='US15'").fetchone()[0],'TEST-SERVICE-LOGO')
        self.c.execute("UPDATE brand_assets SET verification_state='unavailable' WHERE asset_id='TEST-SERVICE-LOGO'")
        self.assertEqual(self.c.execute("SELECT logo_kind FROM v_preferred_brand_assets WHERE product_id='US15'").fetchone()[0],'company')

    def test_price_minimum_and_tax_currency_are_structured(self):
        rows=self.c.execute("SELECT pc.currency,pc.tax_status,pl.min_billable_units FROM price_components pc JOIN plans pl USING(plan_id) WHERE pc.component_id LIKE 'B04%' AND pl.offering_id='OF-US21' AND pl.plan_name LIKE '%年払い%'").fetchall()
        self.assertEqual(len(rows),2)
        self.assertTrue(all(tuple(r)==('AUD','exclusive',10) for r in rows))
        row=self.c.execute("SELECT unit_amount_decimal,max_quantity,tax_status FROM v_price_details WHERE product_id='JP13' AND charge_type='initial_setup' AND component_id LIKE 'B04%'").fetchone()
        self.assertEqual(tuple(row),('300000',30,'exclusive'))

    def test_ingest_error_rolls_back_every_table(self):
        before=fingerprint(self.c)
        with tempfile.TemporaryDirectory() as tmp:
            p=json.loads((ROOT/'batches/B03-20261011.json').read_text())
            p['batch_id']='INVALID-BATCH'
            p['findings'][0]['criterion']='NO-SUCH-CRITERION'
            path=Path(tmp)/'invalid.json'
            path.write_text(json.dumps(p))
            with self.assertRaises(sqlite3.IntegrityError): ingest(self.c,path)
        self.assertEqual(fingerprint(self.c),before)

    def regulation_fixture(self):
        p=json.loads((ROOT/'batches/B06-20261011.json').read_text())
        rule=dict(p['regulations'][0],regulation_id='TEST-REGULATION')
        return dict(batch_id='TEST-RULE-BATCH',as_of_date='2026-10-11',
            sources=[next(s for s in p['sources'] if s['key']==rule['source'])],
            findings=[],regulations=[rule])

    def test_reference_rule_has_provenance_without_vendor_support(self):
        comparison_sql='SELECT offering_id,criterion_id,finding,decision,documented_scope,resolution_id FROM v_current40 ORDER BY offering_id,criterion_id'
        before=[tuple(r) for r in self.c.execute(comparison_sql)]
        support_count=self.c.execute('SELECT COUNT(*) FROM regulation_support').fetchone()[0]
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'rule.json'
            path.write_text(json.dumps(self.regulation_fixture()))
            result=ingest(self.c,path)
        self.assertEqual(result['reference_regulations'],1)
        rule=self.c.execute("SELECT * FROM regulations WHERE regulation_id='TEST-REGULATION'").fetchone()
        self.assertEqual(rule['revision_id'],'TEST-RULE-BATCH-REV001')
        self.assertEqual(json.loads(rule['applicability_json'])['formula'],'(D-E)/B')
        self.assertFalse(json.loads(rule['applicability_json'])['vendor_implementation_verified'])
        self.assertEqual(self.c.execute('SELECT COUNT(*) FROM regulation_support').fetchone()[0],support_count)
        self.assertEqual([tuple(r) for r in self.c.execute(comparison_sql)],before)

    def test_invalid_regulation_source_rolls_back_batch(self):
        before=fingerprint(self.c)
        p=self.regulation_fixture()
        p['regulations'][0]['source']='missing-source'
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'invalid-rule.json'
            path.write_text(json.dumps(p))
            with self.assertRaises(KeyError): ingest(self.c,path)
        self.assertEqual(fingerprint(self.c),before)


if __name__=='__main__': unittest.main()
