import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createResearchRepository} from '../src/lib/repository.ts';
import {evidenceQuery} from '../src/lib/evidence-query.mjs';

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
  assert.equal(sql.filter(s=>s.startsWith('SELECT offering_id,detail_json')).length,1);
  assert.equal((await repo.scope()).snapshot_id,compared.snapshot_id);
  const air=await repo.search({feature:'B01',limit:50});assert(!air.products.some(p=>p.id==='OF-JP27'));
  assert.equal(repo.metrics().calls,2);
  await assert.rejects(()=>repo.compare(['OF-JP01','OF-JP01']));
 }finally{sqlite.close();}
});

test('all cards have a price summary with billing units, required charges and unknown-price labels',async()=>{
 const {sqlite,repo}=fixture();try{
  const products=await repo.catalog();
  assert.equal(products.length,50);
  assert(products.every(p=>p.price_summary?.label), 'Every service needs a visible price or an unknown-price label');
  const price=id=>products.find(p=>p.id===id).price_summary;
  assert.equal(price('OF-JP27').label,'月額330円 / 人');
  assert.match(price('OF-JP27').note,/税込/);
  assert.match(price('OF-JP27').note,/最低月額990円/);
  assert.equal(price('OF-JP03').label,'年額8,400円 / 人');
  assert.match(price('OF-JP03').note,/年契約/);
  assert.match(price('OF-JP03').note,/前払い/);
  assert.equal(price('OF-JP04').label,'月額5,000円 / 部署 ＋ 500円 / 人');
  assert.equal(price('OF-JP20').label,'個別見積もり');
  assert.equal(price('OF-JP07').label,'非公開');
  assert.equal(price('OF-JP18').label,'個別見積もり');
  assert.equal(price('OF-US19').label,'個別見積もり');
  assert.match(price('OF-JP13').note,/初期費用300,000円/);
  assert.equal(price('OF-JP24').label,'無料プランあり');
  assert.match(price('OF-JP24').note,/6人/);
  assert.equal(price('OF-US21').label,'月額AUD 8 / 人');
  assert.match(price('OF-US21').note,/最低3人/);
  assert.equal(repo.metrics().calls,1);
  assert(products.every(p=>!('prices' in p)), 'The catalog should expose the compact summary, not full price records');
 }finally{sqlite.close();}
});

test('card pricing reads the request snapshot even when publication changes before catalog loading',async()=>{
 const {sqlite,repo,db}=fixture();try{
  await repo.scope();
  sqlite.exec("INSERT INTO web_snapshots SELECT 'price-next',as_of_date,research_sha256,content_sha256,json_set(scope_json,'$.snapshot_id','price-next') FROM web_snapshots WHERE snapshot_id=(SELECT snapshot_id FROM web_live WHERE id=1)");
  sqlite.exec("INSERT INTO web_products SELECT 'price-next',offering_id,slug,search_text,json_set(summary_json,'$.snapshot_id','price-next'),json_set(detail_json,'$.snapshot_id','price-next') FROM web_products WHERE snapshot_id=(SELECT snapshot_id FROM web_live WHERE id=1)");
  sqlite.exec("UPDATE web_products SET detail_json=json_set(detail_json,'$.prices[0].unit_amount_decimal','999') WHERE snapshot_id='price-next' AND offering_id='OF-JP27'");
  sqlite.exec("UPDATE web_live SET snapshot_id='price-next' WHERE id=1");
  const old=(await repo.catalog()).find(p=>p.id==='OF-JP27');
  const fresh=(await createResearchRepository(db).catalog()).find(p=>p.id==='OF-JP27');
  assert.equal(old.price_summary.label,'月額330円 / 人');
  assert.equal(fresh.price_summary.label,'月額999円 / 人');
  assert.equal(repo.metrics().calls,2);
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

test('HTML history includes every research record while the public API stays paginated',async()=>{
 const {sqlite,repo}=fixture();try{
  await repo.productBySlug('jp04');
  const page=await repo.evidence({id:'OF-JP04'});
  const next=await repo.evidence({id:'OF-JP04',page:2});
  const all=await repo.evidence({id:'OF-JP04'},{all:true});
  const expected=sqlite.prepare("SELECT DISTINCT observation_id FROM v_current_observations WHERE offering_id=? AND record_category='document_observation'").all('OF-JP04').map(r=>r.observation_id).sort();
  assert.equal(page.records.length,10);assert.equal(next.records.length,10);
  assert.equal(page.records.some(r=>next.records.some(n=>n.id===r.id)),false);
  assert.equal(Object.hasOwn(page,'modified_on'),false);
  assert.deepEqual(all.records.map(r=>r.id).sort(),expected);
  assert.equal(all.total,expected.length);assert.equal(page.total,expected.length);assert.equal(all.has_more,false);
  assert.equal(all.records.some(r=>r.id==='B02-O00015'),false);
  assert.equal(all.records.every(r=>r.sources.length&&r.evidence_role),true);
  assert.deepEqual(all.records.slice(0,10).map(r=>r.id),page.records.map(r=>r.id));
  assert.match(all.modified_on,/^\d{4}-\d{2}-\d{2}$/);
 }finally{sqlite.close();}
});

test('sitemap modification dates follow one service change without refreshing unrelated services',async()=>{
 const {sqlite,repo,db}=fixture();try{
  const before=await repo.modificationDates();assert.equal(Object.keys(before).length,50);
  const row=sqlite.prepare('SELECT u.update_id,t.offering_id FROM research_task_updates u JOIN research_tasks t USING(task_id) ORDER BY u.update_id LIMIT 1').get();
  sqlite.prepare('UPDATE research_task_updates SET recorded_on=? WHERE update_id=?').run('2026-10-15',row.update_id);
  assert.deepEqual(await repo.modificationDates(),before);
  const after=await createResearchRepository(db).modificationDates();assert.equal(after[row.offering_id],'2026-10-15');
  for(const id of Object.keys(before))if(id!==row.offering_id)assert.equal(after[id],before[id]);
 }finally{sqlite.close();}
});

test('request call and SQL budgets stop before dispatch, including batch SQL and paused reads',async()=>{
 const {sqlite,db,sql}=fixture();try{
  const paused=createResearchRepository(db,{paused:true});await assert.rejects(()=>paused.catalog(),/paused/);assert.equal(sql.length,0);
  const sqlLimited=createResearchRepository(db,{maxQueries:1});await assert.rejects(()=>sqlLimited.catalog(),/budget/);assert.equal(sql.length,0);
  const limited=createResearchRepository(db,{maxCalls:1});await limited.scope();
  await assert.rejects(()=>limited.product('OF-JP01'),/budget/);assert.equal(sql.length,1);
  await assert.rejects(()=>createResearchRepository(db).search({q:'x'.repeat(101)}));
  await assert.rejects(()=>createResearchRepository(db).evidence({id:'OF-JP01',page:101}));assert.equal(sql.length,1);
 }finally{sqlite.close();}
});

test('HEAD reads only scope and indexed existence and preserves missing-resource status',async()=>{
 const {sqlite,db,sql}=fixture();try{
  const head=(route,input={})=>createResearchRepository(db).headStatus(route,input);
  assert.equal(await head('search',{}),200);assert.equal(sql.length,1);
  assert.equal(await head('products/OF-JP01'),200);
  sqlite.exec("DELETE FROM web_products WHERE offering_id='OF-JP01'");
  assert.equal(await head('products/OF-JP01'),404);assert.equal(await head('evidence',{id:'OF-JP01'}),404);
  assert.equal(await head('compare',{products:'OF-JP01,OF-JP02'}),400);
  await assert.rejects(()=>head('evidence',{id:'OF-JP02',criterion:'A99'}),/比較項目/);
  assert(!sql.some(q=>q.includes('detail_json')||q.includes('v_current_observations')||q.includes('summary_json')));
 }finally{sqlite.close();}
});

test('fulfilled snapshot cache rereads live pointer and handles activation and rollback without mixed data',async()=>{
 const {sqlite,db}=fixture();const cache=new Map();try{
  const first=createResearchRepository(db,{catalogCache:cache});const products=await first.catalog();const original=(await first.scope()).snapshot_id;
  const warm=createResearchRepository(db,{catalogCache:cache});assert.deepEqual(await warm.catalog(),products);assert.equal(warm.metrics().queries,1);
  sqlite.exec("INSERT INTO web_snapshots SELECT 'cache-next',as_of_date,research_sha256,content_sha256,json_set(scope_json,'$.snapshot_id','cache-next') FROM web_snapshots WHERE snapshot_id=(SELECT snapshot_id FROM web_live WHERE id=1)");
  sqlite.exec("INSERT INTO web_products SELECT 'cache-next',offering_id,slug,search_text,json_set(summary_json,'$.snapshot_id','cache-next'),json_set(detail_json,'$.snapshot_id','cache-next') FROM web_products WHERE snapshot_id=(SELECT snapshot_id FROM web_live WHERE id=1)");
  sqlite.exec("UPDATE web_live SET snapshot_id='cache-next' WHERE id=1");
  assert((await createResearchRepository(db,{catalogCache:cache}).catalog()).every(p=>p.snapshot_id==='cache-next'));
  sqlite.prepare('UPDATE web_live SET snapshot_id=? WHERE id=1').run(original);
  assert((await createResearchRepository(db,{catalogCache:cache}).catalog()).every(p=>p.snapshot_id===original));
  await assert.rejects(()=>createResearchRepository(db,{catalogCache:cache,paused:true}).catalog(),/paused/);
 }finally{sqlite.close();}
});

test('optimized evidence matches eligible view across all 50 offerings, every criterion and paged history',()=>{
 const {sqlite}=fixture();try{
  const fields='observation_id,criterion_id,label_ja,value_state,summary_ja,unknown_reason,limitations,applicability_json,verification_stage,evidence_id,locator,paraphrase,canonical_url,title,retrieved_on,current_evidence_role';
  for(const {offering_id:id} of sqlite.prepare('SELECT DISTINCT offering_id FROM web_products').all()){
   for(const criterion of ['',...sqlite.prepare("SELECT DISTINCT criterion_id FROM observations WHERE offering_id=? AND record_category='document_observation'").all(id).map(r=>r.criterion_id)]){
    for(const offset of [0,10,30]){
     const args=criterion?[id,criterion,10,offset]:[id,10,offset];
     const old=`SELECT ${fields} FROM v_current_observations WHERE observation_id IN (SELECT DISTINCT observation_id FROM v_current_observations WHERE record_category='document_observation' AND offering_id=? ${criterion?'AND criterion_id=?':''} ORDER BY observation_id DESC LIMIT ? OFFSET ?) ORDER BY observation_id DESC,evidence_id`;
     assert.deepEqual(sqlite.prepare(evidenceQuery(Boolean(criterion))).all(...args),sqlite.prepare(old).all(...args),id+':'+criterion+':'+offset);
    }
   }
  }
 }finally{sqlite.close();}
});


test('full HTML history respects pause, SQL budgets and a thousand-record ceiling',async()=>{
 const {sqlite,db,sql}=fixture();try{
  await assert.rejects(()=>createResearchRepository(db,{paused:true}).evidence({id:'OF-JP04'},{all:true}),/paused/);
  await assert.rejects(()=>createResearchRepository(db,{paused:true}).modificationDates(),/paused/);
  assert.equal(sql.length,0);
  const limited=createResearchRepository(db,{maxQueries:2});await limited.productBySlug('jp04');
  await assert.rejects(()=>limited.evidence({id:'OF-JP04'},{all:true}),/budget/);assert.equal(sql.length,1);
  const oversized={...db,batch:async statements=>{
   const rows=await db.batch(statements);rows[0].results[0].n=1001;return rows;
  }};
  const bounded=createResearchRepository(oversized);await bounded.productBySlug('jp04');
  await assert.rejects(()=>bounded.evidence({id:'OF-JP04'},{all:true}),/HTML history size exceeds budget/);
 }finally{sqlite.close();}
});
