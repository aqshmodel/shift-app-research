import importlib.util,json,sqlite3,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('publication_sql',Path(__file__).resolve().parents[1]/'scripts/publication_sql.py');sql=importlib.util.module_from_spec(spec);spec.loader.exec_module(sql)
class BoundedPublicationSQL(unittest.TestCase):
 def setUp(self):
  self.db=sqlite3.connect(':memory:');self.db.execute('CREATE TABLE web_products(snapshot_id TEXT,offering_id TEXT,slug TEXT,search_text TEXT,summary_json TEXT,detail_json TEXT,PRIMARY KEY(snapshot_id,offering_id),UNIQUE(snapshot_id,slug))')
  self.args=('new','OF-US10','us10',"日本語'search"*10000,json.dumps({'id':'OF-US10'}),json.dumps({'text':"介護'技能"*20000},ensure_ascii=False))
 def run_parts(self,parts):
  for part in parts:self.db.execute(part)
 def test_small_row_uses_one_insert(self):
  parts=sql.product_statements('new','OF-US10','us10','small','{}','{}');self.assertEqual(len(parts),1);self.run_parts(parts);self.assertEqual(self.db.execute('select slug from web_products').fetchone()[0],'us10')
 def test_large_unicode_and_quotes_roundtrip_with_bounded_statements(self):
  parts=sql.product_statements(*self.args);self.assertGreater(len(parts),1);self.assertTrue(all(len(s.encode())<=100000 for s in parts));self.run_parts(parts);self.assertEqual(self.db.execute('select * from web_products').fetchone(),self.args)
 def test_replay_preserves_completed_row_and_previous_snapshot(self):
  self.run_parts(sql.product_statements('old','OF-US10','us10','old','{}','{}'));parts=sql.product_statements(*self.args);self.run_parts(parts);before=list(self.db.execute('select * from web_products order by snapshot_id'));self.run_parts(parts);self.assertEqual(before,list(self.db.execute('select * from web_products order by snapshot_id')))
 def test_interrupted_assembly_is_not_ready_and_resumes(self):
  parts=sql.product_statements(*self.args);self.run_parts(parts[:-1]);ready='select count(*) from web_products where '+sql.complete_product_filter('new');self.assertEqual(self.db.execute(ready).fetchone()[0],0);self.run_parts(parts);self.assertEqual(self.db.execute(ready).fetchone()[0],1);self.assertEqual(self.db.execute('select * from web_products').fetchone(),self.args)
 def test_existing_completed_row_cannot_be_changed_by_staged_updates(self):
  self.db.execute('insert into web_products values(?,?,?,?,?,?)',('new','OF-US10','us10','existing','{}','{}'));self.run_parts(sql.product_statements(*self.args));self.assertEqual(self.db.execute('select search_text from web_products').fetchone()[0],'existing')
if __name__=='__main__':unittest.main()
