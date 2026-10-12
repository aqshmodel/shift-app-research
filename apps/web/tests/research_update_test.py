import importlib.util
import sqlite3
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location('research_update',Path(__file__).resolve().parents[1]/'scripts/build-research-update.py')
update=importlib.util.module_from_spec(spec);spec.loader.exec_module(update)

SCHEMA='''
CREATE TABLE schema_info(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE sources(id TEXT PRIMARY KEY);
CREATE TABLE records(id TEXT PRIMARY KEY,source_id TEXT REFERENCES sources(id),parent TEXT REFERENCES records(id),note TEXT);
CREATE TABLE research_batches(id TEXT PRIMARY KEY,prior TEXT REFERENCES research_batches(id));
CREATE TABLE research_tasks(id TEXT PRIMARY KEY,state TEXT,note TEXT);
CREATE TABLE current_assessments(offering_id TEXT,criterion_id TEXT,resolution_id TEXT REFERENCES records(id),PRIMARY KEY(offering_id,criterion_id));
INSERT INTO schema_info VALUES('latest_batch','B07');
INSERT INTO sources VALUES('s1');
INSERT INTO records VALUES('r1','s1',NULL,'prior');
INSERT INTO research_batches VALUES('B07',NULL);
INSERT INTO research_tasks VALUES('t1','not_started',NULL);
INSERT INTO current_assessments VALUES('p1','c1','r1');
'''
WEB='''
CREATE TABLE web_snapshots(snapshot_id TEXT PRIMARY KEY,research_sha256 TEXT,content_sha256 TEXT);
CREATE TABLE web_live(id INTEGER PRIMARY KEY CHECK(id=1),snapshot_id TEXT REFERENCES web_snapshots(snapshot_id));
CREATE TABLE web_products(snapshot_id TEXT REFERENCES web_snapshots(snapshot_id),id TEXT,PRIMARY KEY(snapshot_id,id));
CREATE TABLE web_categories(snapshot_id TEXT REFERENCES web_snapshots(snapshot_id),id TEXT,PRIMARY KEY(snapshot_id,id));
'''

class ResearchUpdate(unittest.TestCase):
    def fixture(self):
        base=update.connect(':memory:');base.executescript(SCHEMA)
        target=update.connect(':memory:');target.executescript(SCHEMA)
        oldhash=update.digest(base,update.tables(target));base.executescript(WEB)
        base.execute('INSERT INTO web_snapshots VALUES(?,?,?)',('B07-pub2',oldhash,'old-content'))
        base.executescript("INSERT INTO web_live VALUES(1,'B07-pub2');INSERT INTO web_products VALUES('B07-pub2','p1');INSERT INTO web_categories VALUES('B07-pub2','care');")
        target.executescript("INSERT INTO sources VALUES('s2');INSERT INTO records VALUES('r2','s2','r1','new');INSERT INTO research_batches VALUES('B12','B07');UPDATE schema_info SET value='B12';UPDATE research_tasks SET state='in_progress';UPDATE current_assessments SET resolution_id='r2';INSERT INTO current_assessments VALUES('p2','c1','r2');")
        return base,target

    def script(self,base,target):
        manifest=dict(snapshot_id='B12-pub2',research_sha256=update.digest(target,update.tables(target)),content_sha256='new-content')
        publication="INSERT INTO web_snapshots VALUES('B12-pub2',"+update.literal(manifest['research_sha256'])+",'new-content');\nINSERT INTO web_products VALUES('B12-pub2','p1');\nINSERT INTO web_categories VALUES('B12-pub2','care');\nUPDATE web_live SET snapshot_id='B12-pub2' WHERE id=1;"
        return update.build(base,target,publication,manifest)[0]

    def apply(self,base,sql):
        try:base.executescript('BEGIN;\n'+sql+'\nCOMMIT;')
        except Exception:base.rollback();raise

    def test_append_preserves_history_and_old_publication(self):
        base,target=self.fixture();sql=self.script(base,target);self.apply(base,sql)
        self.assertEqual(update.digest(base,update.tables(target)),update.digest(target,update.tables(target)))
        self.assertEqual(base.execute('SELECT snapshot_id FROM web_live').fetchone()[0],'B12-pub2')
        self.assertEqual(base.execute("SELECT count(*) FROM web_products WHERE snapshot_id='B07-pub2'").fetchone()[0],1)
        self.assertEqual(base.execute("SELECT note FROM records WHERE id='r1'").fetchone()[0],'prior')

    def test_immutable_change_or_removal_rejected(self):
        for command in ["UPDATE records SET note='rewritten' WHERE id='r1'","DELETE FROM research_tasks WHERE id='t1'"]:
            base,target=self.fixture()
            target.execute(command)
            with self.assertRaisesRegex(ValueError,'Immutable|removed'):self.script(base,target)

    def test_stale_live_snapshot_aborts_before_research_writes(self):
        base,target=self.fixture();sql=self.script(base,target)
        base.execute("INSERT INTO web_snapshots VALUES('other','other','other')");base.execute("UPDATE web_live SET snapshot_id='other'");base.commit()
        before=update.digest(base,update.tables(target))
        with self.assertRaises(sqlite3.IntegrityError):self.apply(base,sql)
        self.assertEqual(update.digest(base,update.tables(target)),before)
        self.assertEqual(base.execute('SELECT snapshot_id FROM web_live').fetchone()[0],'other')

    def test_many_mutable_updates_fit_d1_expression_depth(self):
        base,target=self.fixture()
        for n in range(200):
            base.execute('INSERT INTO research_tasks VALUES(?,?,NULL)',('extra'+str(n),'not_started'))
            target.execute('INSERT INTO research_tasks VALUES(?,?,NULL)',('extra'+str(n),'in_progress'))
        base.execute('UPDATE web_snapshots SET research_sha256=?',(update.digest(base,update.tables(target)),));base.commit()
        sql=self.script(base,target)
        base.setlimit(sqlite3.SQLITE_LIMIT_EXPR_DEPTH,100)
        self.apply(base,sql)
        self.assertEqual(update.digest(base,update.tables(target)),update.digest(target,update.tables(target)))

    def test_concurrent_task_edit_rolls_back_every_append(self):
        base,target=self.fixture();sql=self.script(base,target)
        base.execute("UPDATE research_tasks SET note='concurrent edit'");base.commit()
        before=update.digest(base,update.tables(target))
        with self.assertRaises(sqlite3.IntegrityError):self.apply(base,sql)
        self.assertEqual(update.digest(base,update.tables(target)),before)
        self.assertEqual(base.execute('SELECT count(*) FROM records').fetchone()[0],1)

    def test_resolution_trigger_can_create_derived_assessment_first(self):
        base,target=self.fixture()
        base.executescript("CREATE TRIGGER derive AFTER INSERT ON records WHEN NEW.id='r2' BEGIN INSERT INTO current_assessments VALUES('p2','c1','r2');END;")
        self.apply(base,self.script(base,target))
        self.assertEqual(update.digest(base,update.tables(target)),update.digest(target,update.tables(target)))

    def test_failed_activation_rolls_back_research_and_publication(self):
        base,target=self.fixture();sql=self.script(base,target)
        sql=sql.replace("UPDATE web_live SET snapshot_id='B12-pub2' WHERE id=1;",'')
        before=update.digest(base,update.tables(target))
        with self.assertRaises(sqlite3.IntegrityError):self.apply(base,sql)
        self.assertEqual(update.digest(base,update.tables(target)),before)
        self.assertEqual(base.execute('SELECT count(*) FROM web_snapshots').fetchone()[0],1)

if __name__=='__main__':unittest.main()
