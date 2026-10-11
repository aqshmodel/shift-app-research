import json, sqlite3, sys, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
PKG=ROOT/'Aqsh_Shift_Research_v2_Batch02_DB_20261011'
sys.path.insert(0,str(PKG/'tools'))
from research_db import fingerprint,tables,ordered_rows
class Publication(unittest.TestCase):
 def setUp(self):
  self.db=sqlite3.connect(':memory:');self.db.row_factory=sqlite3.Row
  self.db.executescript((PKG/'d1/import.sql').read_text())
  self.original={t:list(ordered_rows(self.db,t)) for t in tables(self.db)}
  self.db.executescript((ROOT/'apps/web/migrations/0001_publication.sql').read_text())
  self.sql=(ROOT/'apps/web/data/publication.sql').read_text()
  self.db.executescript(self.sql)
 def test_original_preserved_and_idempotent(self):
  # fingerprint includes every research table; projection tables are outside it.
  self.assertEqual(self.original,{t:list(ordered_rows(self.db,t)) for t in self.original})
  self.db.executescript(self.sql)
  self.assertEqual(self.db.execute('select count(*) from web_products').fetchone()[0],50)
  self.assertEqual(list(self.db.execute('pragma foreign_key_check')),[])
 def test_projection_keeps_prices_and_sources(self):
  details=[json.loads(x[0]) for x in self.db.execute('select detail_json from web_products')]
  self.assertEqual(sum(len(x['prices']) for x in details),88)
  for d in details:
   self.assertTrue(d['official_url'].startswith('https://'));self.assertTrue(d['logo']['url'].startswith(('https://','data:image/svg+xml;base64,')))
   self.assertEqual(d['as_of_date'],'2026-10-11')
   self.assertFalse(d['independent_tests_performed'])
   for a in d['assessments']:
    for f in a['findings']:
     self.assertTrue(f['sources']);self.assertNotEqual(f['evidence_role'],'rejected')
   for p in d['prices']:
    self.assertIn('min_billable_units',p['plan_conditions'])
 def test_partial_snapshot_cannot_replace_live(self):
  live=self.db.execute('select snapshot_id from web_live').fetchone()[0]
  self.db.executescript(self.sql.replace(live,'partial-v2').replace("INSERT OR IGNORE INTO web_products", "INSERT OR IGNORE INTO web_products" ).rsplit('INSERT INTO web_live',1)[0])
  self.db.execute("delete from web_products where snapshot_id='partial-v2' and offering_id='OF-JP01'")
  self.db.executescript('INSERT INTO web_live'+self.sql.rsplit('INSERT INTO web_live',1)[1].replace(live,'partial-v2'))
  self.assertEqual(self.db.execute('select snapshot_id from web_live').fetchone()[0],live)
 def test_reusing_version_with_different_content_cannot_publish(self):
  self.db.execute('delete from web_live')
  manifest=json.loads((ROOT/'apps/web/data/manifest.json').read_text())
  changed=self.sql.replace(manifest['content_sha256'],'f'*64)
  self.db.executescript(changed)
  self.assertEqual(self.db.execute('select count(*) from web_live').fetchone()[0],0)
if __name__=='__main__':unittest.main()
