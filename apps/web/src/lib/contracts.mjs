export const categories = ['medical','care','general','api'];
export const features = ['B01','J05','J06','N02','M08'];
export const states = ['documented','disputed','planned'];
export const normalize = value => value.normalize('NFKC').toLowerCase().trim();
function closed(input,allowed) {
  if (!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).some(k=>!allowed.includes(k))) throw new Error('入力項目を確認してください。');
}
function integer(value,fallback,min,max) {
  if(value===undefined || value==='') return fallback;
  const n=typeof value==='string' && /^\d+$/.test(value)?Number(value):value;
  if(typeof n!=='number' || !Number.isInteger(n) || n<min || n>max) throw new Error('件数・ページ番号が範囲外です。');
  return n;
}
function choice(v,allowed) { if(v===undefined || v==='') return ''; if(typeof v!=='string' || !allowed.includes(v)) throw new Error('条件が無効です。'); return v; }
export function validateSearch(input={}) {
  closed(input,['q','category','region','feature','state','page','limit']);
  const q=input.q??'';
  if(typeof q!=='string' || q.length>100) throw new Error('検索語は100文字以内で指定してください。');
  return {q:normalize(q),category:choice(input.category,categories),region:choice(input.region,['domestic','overseas']),feature:choice(input.feature,features),state:choice(input.state,states),page:integer(input.page,1,1,100),limit:integer(input.limit,20,1,50)};
}
export function validateId(id) {
  if(typeof id!=='string' || !/^OF-(JP(?:0[1-9]|1\d|2[0-8])|US(?:0[1-9]|1\d|2[0-2]))$/.test(id)) throw new Error('提供単位IDを確認してください。');
  return id;
}
export function validateIds(ids) {
  if(!Array.isArray(ids)||ids.length<2||ids.length>4||new Set(ids).size!==ids.length) throw new Error('異なる製品を2〜4件選択してください。');
  return ids.map(validateId);
}
export function validateEvidence(input) {
  closed(input,['id','criterion','page']); validateId(input.id);
  if(input.criterion && (typeof input.criterion!=='string' || !/^(?:[A-R]0[1-8]|[BGR]09)$/.test(input.criterion))) throw new Error('比較項目を確認してください。');
  return {id:input.id,criterion:input.criterion??'',page:integer(input.page,1,1,100)};
}
const object=(properties,required=[])=>({type:'object',properties,required,additionalProperties:false});
const id={type:'string',pattern:'^OF-(JP|US)[0-9]{2}$',description:'検索結果にある提供単位ID。'};
export const toolSchemas={
  search_shift_products:object({q:{type:'string',maxLength:100},category:{type:'string',enum:categories},region:{type:'string',enum:['domestic','overseas']},feature:{type:'string',enum:features},state:{type:'string',enum:states},page:{type:'integer',minimum:1,maximum:100},limit:{type:'integer',minimum:1,maximum:20}}),
  get_shift_product:object({id},['id']),
  compare_shift_products:object({ids:{type:'array',items:id,minItems:2,maxItems:4,uniqueItems:true}},['ids']),
  get_shift_evidence:object({id,criterion:{type:'string',pattern:'^(?:[A-R]0[1-8]|[BGR]09)$'},page:{type:'integer',minimum:1,maximum:100}},['id']),
  get_research_scope:object({})
};
