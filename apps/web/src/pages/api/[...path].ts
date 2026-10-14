import type { APIRoute } from 'astro';
import {getResearch,compactAssessment} from '../../lib/data';
import { validateId } from '../../lib/contracts.mjs';
import {validatePublicRequest, contentParams} from '../../lib/cost-guard.mjs';
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export const GET: APIRoute=async({request,params,locals})=>{
 const {scope,search,product,compare,evidence}=getResearch(locals);
 const path=(params.path??'').replace(/\/$/,'');const url=new URL(request.url);
 if(url.search.length>1500)return json({error:'入力が長すぎます。'},400);
 const input=Object.fromEntries(contentParams(url.searchParams));
 try {
  const validated=validatePublicRequest(url);if(validated.status)return json({error:'APIが見つかりません。'},validated.status);
  if(path==='scope'){if(Object.keys(input).length) return json({error:'不要な入力です。'},400);return json(await scope());}
  if(path==='search') {const result=await search(input);const current=await scope();return json({...result,as_of_date:current.as_of_date,snapshot_id:current.snapshot_id});}
  if(path.startsWith('products/')){
   if(Object.keys(input).length)return json({error:'不要な入力です。'},400);
   const id=validateId(path.slice(9));const p=await product(id);if(!p)return json({error:'製品が見つかりません。'},404);
   return json({...p,assessments:p.assessments.map(compactAssessment),evidence_url:`/api/evidence/?id=${id}`,detail_url:`https://shift.aqsh.co.jp/products/${p.slug}/`});
  }
  if(path==='compare') {if(Object.keys(input).some(k=>k!=='products')||!input.products)throw new Error('比較する製品を指定してください。');return json(await compare(input.products.split(',')));}
  if(path==='evidence'){const result=await evidence(input);return result?json(result):json({error:'製品が見つかりません。'},404);}
  return json({error:'APIが見つかりません。'},404);
 }catch(error){
  const message=error instanceof Error?error.message:'';
  if(/入力|検索語|条件|件数|ページ番号|提供単位|比較|異なる製品|製品が/.test(message))return json({error:message},400);
  return json({error:'情報を取得できませんでした。時間を置いて再試行してください。'},503);
 }
};
export const HEAD:APIRoute=async({request,locals})=>{
 try {
  const result=validatePublicRequest(new URL(request.url));
  const status=result.status??await getResearch(locals).headStatus(result.route!,result.input!);
  return new Response(null,{status,headers:json(null).headers});
 }catch(error){
  const message=error instanceof Error?error.message:'';
  const status=/入力|検索語|条件|件数|ページ番号|提供単位|比較|異なる製品/.test(message)?400:503;
  return new Response(null,{status,headers:json(null).headers});
 }
};
export const ALL:APIRoute=()=>new Response(JSON.stringify({error:'GETのみ利用できます。'}),{status:405,headers:{Allow:'GET, HEAD','Content-Type':'application/json'}});
