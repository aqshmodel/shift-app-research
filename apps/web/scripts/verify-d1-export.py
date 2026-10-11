"""Compare all 39 research tables against a downloaded D1 SQL export."""
import argparse,hashlib,json,sqlite3,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];PKG=ROOT/'Aqsh_Shift_Research_v2_Batch02_DB_20261011';sys.path.insert(0,str(PKG/'tools'))
from research_db import connect,tables,ordered_rows,dumps
p=argparse.ArgumentParser();p.add_argument('sql');p.add_argument('--output');args=p.parse_args()
c=sqlite3.connect(':memory:');c.row_factory=sqlite3.Row;c.executescript(Path(args.sql).read_text());h=hashlib.sha256();counts={}
with connect() as original:
 for table in tables(original):
  a=list(ordered_rows(original,table));b=list(ordered_rows(c,table))
  if a!=b:raise SystemExit('Mismatch: '+table)
  h.update(table.encode())
  for row in b:h.update(dumps(row).encode())
  counts[table]=len(b)
result=dict(equal=True,research_sha256=h.hexdigest(),research_tables=len(counts),counts=counts,foreign_key_errors=len(list(c.execute('pragma foreign_key_check'))),integrity=c.execute('pragma integrity_check').fetchone()[0],snapshot=dict(c.execute('select s.* from web_snapshots s join web_live l using(snapshot_id)').fetchone()))
result['snapshot'].pop('scope_json')
text=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
if args.output:Path(args.output).write_text(text)
print(text)
