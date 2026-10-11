"""One-time import into an empty local/staging/production D1. Never resets data."""
import argparse,json,os,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];WEB=ROOT/'apps/web';PKG=ROOT/'Aqsh_Shift_Research_v2_Batch02_DB_20261011'
p=argparse.ArgumentParser();p.add_argument('target',choices=['local','staging','production']);args=p.parse_args()
base=['npx','wrangler','d1','execute','DB','--local' if args.target=='local' else '--remote']
if args.target=='staging':base+=['--env','staging']
def run(extra):
 r=subprocess.run(base+extra,cwd=WEB,text=True,capture_output=True)
 if r.returncode:raise SystemExit(r.stderr+'\n'+r.stdout[-2500:])
 return r.stdout
raw=run(['--command',"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'",'--json'])
rows=json.loads(raw)[0]['results']
if rows:raise SystemExit('Refusing initial import: database contains application tables. Use versioned migrations/updates.')
for file in [PKG/'d1/import.sql',WEB/'migrations/0001_publication.sql',WEB/'data/publication.sql']:
 run(['--file',str(file),'--yes']);print('Applied '+file.name,flush=True)
print(run(['--command',"SELECT s.snapshot_id,s.research_sha256,s.content_sha256,(SELECT count(*) FROM web_products WHERE snapshot_id=s.snapshot_id) AS products FROM web_snapshots s JOIN web_live l USING(snapshot_id)",'--json']))
