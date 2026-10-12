"""Append research rows to an exact exported baseline and activate one snapshot.

No remote writes. Apply the generated file with D1's atomic file import, never
with the initial schema/import SQL. A stale baseline fails a CHECK constraint.
"""
import argparse
import hashlib
import json
import sqlite3
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
PKG=ROOT/'Aqsh_Shift_Research_v2_Batch02_DB_20261011'
sys.path.insert(0,str(PKG/'tools'))
from research_db import connect,dependency_order,ordered_rows,cols,ident,literal,dumps,tables

MUTABLE={'schema_info','research_tasks','current_assessments'}

def digest(c,names):
    h=hashlib.sha256()
    for name in sorted(names):
        h.update(name.encode())
        for row in ordered_rows(c,name):h.update(dumps(row).encode())
    return h.hexdigest()

def predicate(row,names):
    return ' AND '.join(ident(k)+' IS '+literal(row[k]) for k in names)

def guard(condition,snapshot):
    return 'INSERT INTO web_live(id,snapshot_id) SELECT CASE WHEN '+condition+' THEN 1 ELSE 0 END,'+literal(snapshot)+' ON CONFLICT(id) DO UPDATE SET snapshot_id=excluded.snapshot_id;'

def guards(conditions,snapshot):
    # D1 limits expression depth to 100. Several small guards still fail the
    # same atomic import without building one deeply nested AND expression.
    return [guard(' AND '.join(conditions[i:i+32]),snapshot) for i in range(0,len(conditions),32)]

def load_export(sql):
    # D1 exports create referenced tables in arbitrary order. This affects only
    # the offline copy; validate all references before enabling update checks.
    c=sqlite3.connect(':memory:');c.row_factory=sqlite3.Row
    c.executescript(sql)
    if c.execute('PRAGMA foreign_key_check').fetchall():raise ValueError('Export contains invalid foreign keys')
    c.execute('PRAGMA foreign_keys=ON')
    return c

def build(base,target,publication,manifest):
    names=tables(target)
    if set(names)-set(tables(base)):raise ValueError('Baseline schema is missing research tables')
    prior=dict(base.execute('SELECT s.* FROM web_snapshots s JOIN web_live l USING(snapshot_id) WHERE l.id=1').fetchone())
    prior_batch=base.execute("SELECT value FROM schema_info WHERE key='latest_batch'").fetchone()[0]
    target_batch=target.execute("SELECT value FROM schema_info WHERE key='latest_batch'").fetchone()[0]
    if digest(base,names)!=prior['research_sha256']:raise ValueError('Baseline research hash differs from its published snapshot')
    if digest(target,names)!=manifest['research_sha256']:raise ValueError('Target research hash differs from publication')
    if manifest['snapshot_id']==prior['snapshot_id']:raise ValueError('A new snapshot ID is required')
    if base.execute('SELECT 1 FROM web_snapshots WHERE snapshot_id=?',(manifest['snapshot_id'],)).fetchone():raise ValueError('Target snapshot already exists')
    initial=["(SELECT value FROM schema_info WHERE key='latest_batch')="+literal(prior_batch),
      '(SELECT snapshot_id FROM web_live WHERE id=1)='+literal(prior['snapshot_id']),
      '(SELECT research_sha256 FROM web_snapshots WHERE snapshot_id='+literal(prior['snapshot_id'])+')='+literal(prior['research_sha256']),
      'NOT EXISTS(SELECT 1 FROM web_snapshots WHERE snapshot_id='+literal(manifest['snapshot_id'])+')']
    final=[];changes=[];sql=[]
    for name in dependency_order(target):
        fields=cols(target,name)
        base_fields=cols(base,name)
        if fields!=base_fields:raise ValueError('Schema change needs its own migration: '+name)
        keys=[r['name'] for r in sorted(target.execute('PRAGMA table_info('+ident(name)+')'),key=lambda r:r['pk']) if r['pk']]
        if not keys:raise ValueError('Primary key required: '+name)
        old={tuple(r[k] for k in keys):r for r in ordered_rows(base,name)}
        new=ordered_rows(target,name);new_keys={tuple(r[k] for k in keys) for r in new}
        if set(old)-new_keys:raise ValueError('Research rows would be removed: '+name)
        initial.append('(SELECT count(*) FROM '+ident(name)+')='+str(len(old)))
        final.append('(SELECT count(*) FROM '+ident(name)+')='+str(len(new)))
        inserted=updated=0
        for row in new:
            previous=old.get(tuple(row[k] for k in keys))
            if previous is None:
                statement='INSERT INTO '+ident(name)+'('+','.join(map(ident,fields))+') VALUES('+','.join(literal(row[k]) for k in fields)+')'
                if name=='current_assessments':
                    # Resolution INSERT triggers may have created this derived
                    # row already; synchronize only the latest-assessment map.
                    statement+=' ON CONFLICT('+','.join(map(ident,keys))+') DO UPDATE SET '+','.join(ident(k)+'=excluded.'+ident(k) for k in fields if k not in keys)
                sql.append(statement+';')
                inserted+=1
            elif row!=previous:
                if name not in MUTABLE:raise ValueError('Immutable research row changed: '+name)
                changed=[k for k in fields if row[k]!=previous[k]]
                sql.append('UPDATE '+ident(name)+' SET '+','.join(ident(k)+'='+literal(row[k]) for k in changed)+' WHERE '+predicate(previous,fields)+';')
                # A concurrent change to a mutable row must abort the whole import.
                final.append('EXISTS(SELECT 1 FROM '+ident(name)+' WHERE '+predicate(row,keys+changed)+')')
                updated+=1
        changes.append(dict(table=name,baseline=len(old),target=len(new),inserted=inserted,updated=updated))
    statements=[*guards(initial,prior['snapshot_id']),*sql,
      *guards(final,prior['snapshot_id'])]
    statements.extend(publication.splitlines())
    statements.append(guard('(SELECT snapshot_id FROM web_live WHERE id=1)='+literal(manifest['snapshot_id'])+
      ' AND (SELECT content_sha256 FROM web_snapshots WHERE snapshot_id='+literal(manifest['snapshot_id'])+')='+literal(manifest['content_sha256']),manifest['snapshot_id']))
    content='-- Guarded research delta and public snapshot; D1 file import is atomic.\n'+'\n'.join(statements)+'\n'
    if any(len(s.encode())>100000 for s in statements):raise ValueError('Statement exceeds conservative D1 size limit')
    return content,dict(prior_batch=prior_batch,target_batch=target_batch,baseline_snapshot=prior['snapshot_id'],target_snapshot=manifest['snapshot_id'],baseline_research_sha256=prior['research_sha256'],target_research_sha256=manifest['research_sha256'],content_sha256=manifest['content_sha256'],tables=changes,statement_count=sum(s.rstrip().endswith(';') for s in statements),maximum_statement_bytes=max(len(s.encode()) for s in statements),sql_sha256=hashlib.sha256(content.encode()).hexdigest())

def main():
    p=argparse.ArgumentParser();p.add_argument('--baseline',type=Path,required=True);p.add_argument('--output',type=Path,required=True);args=p.parse_args()
    baseline_sql=args.baseline.read_text();base=load_export(baseline_sql)
    manifest=json.loads((ROOT/'apps/web/data/manifest.json').read_text())
    with connect() as target:
        content,report=build(base,target,(ROOT/'apps/web/data/publication.sql').read_text(),manifest)
        trial=load_export(baseline_sql)
        try:trial.executescript('BEGIN;\n'+content+'\nCOMMIT;')
        except Exception:trial.rollback();raise
        assert digest(trial,tables(target))==manifest['research_sha256']
        assert not trial.execute('PRAGMA foreign_key_check').fetchall()
        assert trial.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
        for name in ['web_snapshots','web_products','web_categories']:
            fields=cols(base,name);query='SELECT '+','.join(map(ident,fields))+' FROM '+ident(name)
            assert {tuple(r) for r in base.execute(query)}<={tuple(r) for r in trial.execute(query)},name
        assert trial.execute('SELECT snapshot_id FROM web_live WHERE id=1').fetchone()[0]==manifest['snapshot_id']
        report.update(local_sql_roundtrip='passed',prior_publication_rows_preserved=True,foreign_key_errors=0)
    args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(content)
    args.output.with_suffix('.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='tables'},ensure_ascii=False))

if __name__=='__main__':main()
