import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createResearchRepository} from '../src/lib/repository.ts';

function fixture() {
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(readFileSync(new URL('../../../Aqsh_Shift_Research_v2_Batch02_DB_20261011/d1/import.sql',import.meta.url),'utf8'));
 sqlite.exec(readFileSync(new URL('../migrations/0001_publication.sql',import.meta.url),'utf8'));
 sqlite.exec(readFileSync(new URL('../data/publication.sql',import.meta.url),'utf8'));
 const sql=[];
 function prepare(query,values=[]) {
  return {bind:(...args)=>prepare(query,args),first:async()=>{sql.push(query);return sqlite.prepare(query).get(...values)??null;},
   all:async()=>{sql.push(query);return {results:sqlite.prepare(query).all(...values)};}};
 }
 const db={prepare,batch:async statements=>{sqlite.exec('BEGIN');try{const rows=await Promise.all(statements.map(s=>s.all()));sqlite.exec('COMMIT');return rows;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
 return {sqlite,sql,repo:createResearchRepository(db),db};
}

test('detail and evidence reuse the product read, preserve paged sources, and need two DB round trips',async()=>{
 const {sqlite,repo,sql}=fixture();try{
  const p=await repo.productBySlug('jp04');const records=await repo.evidence({id:p.id});
  assert.equal(p.name,'Nafty');assert.equal(records.records.length,10);assert(records.records.every(r=>r.sources.length));
  assert.equal(records.snapshot_id,p.snapshot_id);assert.equal(repo.metrics().calls,2);
  assert.equal(sql.filter(s=>s.includes('detail_json')).length,1);
  const next=await repo.evidence({id:p.id,page:2});assert(!records.records.some(r=>next.records.some(n=>n.id===r.id)));
 }finally{sqlite.close();}
});

test('search and four-product comparison share one catalog and preserve selection order',async()=>{
 const {sqlite,repo,sql}=fixture();try{
  const all=await repo.search({limit:50});assert.equal(all.total,50);assert.equal(repo.metrics().calls,1);
  const ids=['OF-US01','OF-JP04','OF-US09','OF-JP01'];const compared=await repo.compare(ids);
  assert.deepEqual(compared.products.map(p=>p.id),ids);assert.equal(repo.metrics().calls,2);
  assert.equal(sql.filter(s=>s.includes('detail_json')).length,1);
  assert.equal((await repo.scope()).snapshot_id,compared.snapshot_id);
  const air=await repo.search({feature:'B01',limit:50});assert(!air.products.some(p=>p.id==='OF-JP27'));
  assert.equal(repo.metrics().calls,2);
  await assert.rejects(()=>repo.compare(['OF-JP01','OF-JP01']));
 }finally{sqlite.close();}
});

test('request snapshots remain consistent during activation and a new request sees the new version',async()=>{
 const {sqlite,repo,db}=fixture();try{
  const original=await repo.scope();
  sqlite.exec("INSERT INTO web_snapshots SELECT 'test-next',as_of_date,research_sha256,content_sha256,json_set(scope_json,'$.snapshot_id','test-next') FROM web_snapshots WHERE snapshot_id=(SELECT snapshot_id FROM web_live WHERE id=1)");
  sqlite.exec("INSERT INTO web_products SELECT 'test-next',offering_id,slug,search_text,json_set(summary_json,'$.snapshot_id','test-next'),json_set(detail_json,'$.snapshot_id','test-next') FROM web_products WHERE snapshot_id=(SELECT snapshot_id FROM web_live WHERE id=1)");
  sqlite.exec("UPDATE web_live SET snapshot_id='test-next' WHERE id=1");
  assert.equal((await repo.product('OF-JP04')).snapshot_id,original.snapshot_id);
  const fresh=createResearchRepository(db);assert.equal((await fresh.product('OF-JP04')).snapshot_id,'test-next');
  assert.equal((await fresh.scope()).snapshot_id,'test-next');
 }finally{sqlite.close();}
});

test('D1 and missing publication failures reject cleanly without orphaned promises',async()=>{
 const failing={prepare:()=>({bind(){return this;},first:async()=>{throw new Error('D1 unavailable');}}),batch:async()=>{throw new Error('D1 unavailable');}};
 await assert.rejects(()=>createResearchRepository(failing).catalog(),/D1 unavailable/);
 await assert.rejects(()=>createResearchRepository(failing).productBySlug('jp04'),/D1 unavailable/);
 const missing={prepare:()=>({bind(){return this;},first:async()=>null}),batch:async()=>[{results:[]},{results:[]}]};
 await assert.rejects(()=>createResearchRepository(missing).catalog(),/Published snapshot unavailable/);
 await assert.rejects(()=>createResearchRepository(missing).productBySlug('jp04'),/Published snapshot unavailable/);
 await new Promise(resolve=>setImmediate(resolve));
});
