import { env } from 'cloudflare:workers';
import { validateSearch, validateIds, validateId, validateEvidence } from './contracts.mjs';
type Database = {prepare:(sql:string)=>{bind:(...args:unknown[])=>any;first:()=>Promise<any>;all:()=>Promise<any>}};
const db=()=> (env as unknown as {DB:Database}).DB;
export async function scope() {
  const row=await db().prepare('SELECT scope_json FROM web_snapshots WHERE snapshot_id=(SELECT snapshot_id FROM web_live WHERE id=1)').first();
  if(!row) throw new Error('Published snapshot unavailable');
  return JSON.parse(row.scope_json);
}
export async function catalog() {
  const {results}=await db().prepare('SELECT summary_json,search_text FROM web_products WHERE snapshot_id=(SELECT snapshot_id FROM web_live WHERE id=1) ORDER BY slug').all();
  return results.map((r:any)=>({...JSON.parse(r.summary_json),search_text:r.search_text}));
}
export async function search(input:Record<string,unknown>={}) {
  const filters=validateSearch(input); const list=await catalog();
  const matches=list.filter((p:any)=> (!filters.q || p.search_text.includes(filters.q)) && (!filters.category || p.categories.includes(filters.category)) && (!filters.region || p.region===filters.region) && (!filters.feature || p.features.some((f:any)=>f.id===filters.feature && (filters.state ? f.status===filters.state : f.status==='documented'))) && (!filters.state || filters.feature || p.features.some((f:any)=>f.status===filters.state)));
  matches.sort((a:any,b:any)=>a.name.localeCompare(b.name,'ja'));
  const start=(filters.page-1)*filters.limit;
  return {filters,total:matches.length,page:filters.page,limit:filters.limit,has_more:start+filters.limit<matches.length,products:matches.slice(start,start+filters.limit).map(({search_text,...p}:any)=>p)};
}
export async function product(id:string) {
  validateId(id);
  const row=await db().prepare('SELECT detail_json FROM web_products WHERE snapshot_id=(SELECT snapshot_id FROM web_live WHERE id=1) AND offering_id=?').bind(id).first();
  return row ? JSON.parse(row.detail_json) : null;
}
export async function productBySlug(slug:string) {
  if(!/^(jp|us)\d{2}$/.test(slug)) return null;
  const row=await db().prepare('SELECT detail_json FROM web_products WHERE snapshot_id=(SELECT snapshot_id FROM web_live WHERE id=1) AND slug=?').bind(slug).first();
  return row ? JSON.parse(row.detail_json) : null;
}
export const compactAssessment=(a:any)=>({...a,findings_total:a.findings.length,findings_truncated:a.findings.length>2,findings:a.findings.slice(0,2).map((f:any)=>({...f,summary:f.summary?.slice(0,900),summary_truncated:(f.summary?.length||0)>900,sources_total:f.sources.length,sources:f.sources.slice(0,3)}))});
export async function compare(ids:string[]) {
  validateIds(ids); const items=await Promise.all(ids.map(product));
  if(items.some(p=>!p)) throw new Error('製品が見つかりません。');
  const meta=await scope();const keys=[...meta.criteria.map((x:any)=>x.criterion_id),'J05','N02'];
  return {products:items.map(p=>({...p,assessments:p.assessments.filter((a:any)=>keys.includes(a.id)).map(compactAssessment),evidence_url:'/api/evidence/?id='+p.id,detail_url:'https://shift.aqsh.co.jp/products/'+p.slug+'/'})),criteria:keys,as_of_date:meta.as_of_date,snapshot_id:meta.snapshot_id,limitations:meta.limitations};
}
export async function evidence(input:Record<string,unknown>) {
  const v=validateEvidence(input);const limit=10;
  const condition='offering_id=?'+(v.criterion?' AND criterion_id=?':'');const args=v.criterion?[v.id,v.criterion]:[v.id];
  const exists=await product(v.id); if(!exists)return null;
  if(v.criterion){const valid=await db().prepare('SELECT criterion_id FROM criteria WHERE criterion_id=?').bind(v.criterion).first();if(!valid) throw new Error('比較項目がありません。');}
  const count=await db().prepare('SELECT count(DISTINCT observation_id) AS n FROM observations WHERE record_category=\'document_observation\' AND '+condition).bind(...args).first();
  const {results}=await db().prepare('SELECT * FROM v_current_observations WHERE observation_id IN (SELECT observation_id FROM observations WHERE record_category=\'document_observation\' AND '+condition+' ORDER BY observation_id DESC LIMIT ? OFFSET ?) ORDER BY observation_id DESC,evidence_id').bind(...args,limit,(v.page-1)*limit).all();
  const records:Record<string,any>={};
  for(const x of results){records[x.observation_id]??={id:x.observation_id,criterion:x.criterion_id,label:x.label_ja,summary:x.paraphrase||x.summary_ja||x.unknown_reason,state:x.value_state,scope:JSON.parse(x.applicability_json||'{}'),limitations:x.limitations,verification:x.verification_stage,evidence_role:x.current_evidence_role,sources:[]};records[x.observation_id].sources.push({url:x.canonical_url,title:x.title,locator:x.locator,retrieved_on:x.retrieved_on});}
  return {id:v.id,criterion:v.criterion,page:v.page,limit,total:count.n,has_more:v.page*limit<count.n,records:Object.values(records),as_of_date:exists.as_of_date,snapshot_id:exists.snapshot_id};
}
