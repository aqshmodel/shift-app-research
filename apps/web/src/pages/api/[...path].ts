import type { APIRoute } from 'astro';
import { scope,search,product,compare,evidence,compactAssessment } from '../../lib/data';
import { validateId } from '../../lib/contracts.mjs';
import { env } from 'cloudflare:workers';
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export const GET: APIRoute=async({request,params})=>{
 const path=(params.path??'').replace(/\/$/,'');const url=new URL(request.url);
 const limiter=(env as unknown as {PUBLIC_API_LIMITER?:{limit:(input:{key:string})=>Promise<{success:boolean}>}}).PUBLIC_API_LIMITER;
 const ip=request.headers.get('CF-Connecting-IP');
 if(limiter && ip){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('aqsh-shift-api:'+ip));const key=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');const result=await limiter.limit({key});if(!result.success){const response=json({error:'取得頻度が高いため、少し時間を置いて再試行してください。'},429);response.headers.set('Retry-After','60');return response;}}
 if(url.search.length>1500)return json({error:'入力が長すぎます。'},400);
 const input=Object.fromEntries(url.searchParams);
 try {
  if(path==='scope'){if(Object.keys(input).length) return json({error:'不要な入力です。'},400);return json(await scope());}
  if(path==='search') {return json({...await search(input),as_of_date:'2026-10-11',snapshot_id:(await scope()).snapshot_id});}
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
export const HEAD:APIRoute=async(context)=>{const response=await GET(context);return new Response(null,{status:response.status,headers:response.headers});};
export const ALL:APIRoute=()=>new Response(JSON.stringify({error:'GETのみ利用できます。'}),{status:405,headers:{Allow:'GET, HEAD','Content-Type':'application/json'}});
