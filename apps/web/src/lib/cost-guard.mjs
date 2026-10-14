import {validateSearch, validateIds, validateId, validateEvidence, categories} from './contracts.mjs';
import {readDirectoryFilters} from './home-directory.mjs';

const tracking = /^(utm_(source|medium|campaign|id|term|content)|gclid|fbclid)$/;
export function contentParams(params) {
  return new URLSearchParams([...params].filter(([key]) => !tracking.test(key)));
}
const exact = (params, allowed) => {
  if ([...params.keys()].some(k => !allowed.includes(k)) ||
      [...new Set(params.keys())].some(k => params.getAll(k).length > 1)) throw new Error('入力項目を確認してください。');
};
export function validatePublicRequest(url) {
  if (url.search.length > 1500 || url.pathname.length > 200) throw new Error('入力が長すぎます。');
  const path = url.pathname.replace(/\/$/, '') || '/';
  const params = contentParams(url.searchParams);
  const input = Object.fromEntries(params);
  if (path.startsWith('/api/')) {
    const route = path.slice(5);
    exact(params, route === 'search' ? ['q','category','region','feature','state','page','limit'] :
      route === 'evidence' ? ['id','criterion','page'] : route === 'compare' ? ['products'] : []);
    if (route === 'scope') return {route, input};
    if (route === 'search') {validateSearch(input); return {route,input};}
    if (route === 'evidence') {validateEvidence(input); return {route,input};}
    if (route === 'compare') {validateIds((input.products ?? '').split(',')); return {route,input};}
    if (route.startsWith('products/')) {validateId(route.slice(9)); return {route,input};}
    return {status:404};
  }
  if (path === '/') readDirectoryFilters(params);
  else if (path === '/products') {exact(params,['q','category','region','feature','state','page','limit']);validateSearch(input);}
  else if (path === '/compare') {
    if ([...params.keys()].some(k => k !== 'products')) throw new Error('入力項目を確認してください。');
    const ids=params.getAll('products').flatMap(v=>v.split(',')).filter(Boolean);
    if(ids.length) validateIds(ids);
  } else if (path.startsWith('/categories/')) {
    if(!categories.includes(path.slice(12))) return {status:404};
    exact(params,[]);
  } else if (path.startsWith('/products/')) {
    if(!/^(jp(?:0[1-9]|1\d|2[0-8])|us(?:0[1-9]|1\d|2[0-2]))$/.test(path.slice(10))) return {status:404};
    exact(params,[]);
  }
  return {input};
}

export function safetyResponse(status, message, method='GET', api=true) {
  const body=api?JSON.stringify({error:message}):`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>シフト管理・作成サービス比較</title><main><h1>${message}</h1><p><a href="/">トップページへ戻る</a></p></main></html>`;
  return new Response(method === 'HEAD' ? null : body, {status,headers:{
    'Content-Type':api?'application/json; charset=utf-8':'text/html; charset=utf-8', 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
    'Server-Timing':'db_calls;desc="0", db_queries;desc="0"',
    'X-Robots-Tag':'noindex, nofollow',...(status===429||status===503?{'Retry-After':'60'}:{})}});
}

// This runs once in middleware, before any page or API handler can open D1.
export async function guardPublicRequest(request, env) {
  const url=new URL(request.url);
  const respond=(status,message)=>safetyResponse(status,message,request.method,url.pathname.startsWith('/api/'));
  if(url.pathname.replace(/\/$/,'')==='/healthz' && ['GET','HEAD'].includes(request.method)) return new Response(
    request.method==='HEAD'?null:JSON.stringify({status:'ok',d1_access:env.D1_ACCESS_MODE==='normal'?'normal':'paused'}),
    {headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
  if(!['GET','HEAD'].includes(request.method)) return new Response(null,{status:405,headers:{Allow:'GET, HEAD','Cache-Control':'no-store'}});
  try {const result=validatePublicRequest(url);if(result.status)return respond(result.status,'ページが見つかりません。');}
  catch {return respond(400,'入力・検索条件を確認してください。');}
  const deployed=env.ENVIRONMENT!=='development';
  // Explicit normal is required after deploy; a missing or misspelled setting fails closed.
  if((deployed && env.D1_ACCESS_MODE!=='normal') || env.D1_ACCESS_MODE==='paused')
    return respond(503,'現在、情報の取得を一時停止しています。時間を置いて再試行してください。');
  const limiter=env.PUBLIC_API_LIMITER, ip=request.headers.get('CF-Connecting-IP');
  if(!limiter || !ip) return deployed?respond(503,'アクセス制御を確認しています。'):null;
  try {
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('aqsh-shift-public:'+ip));
    const key=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    if(!(await limiter.limit({key})).success) return respond(429,'取得頻度が高いため、少し時間を置いて再試行してください。');
  } catch {return respond(503,'アクセス制御を確認しています。');}
  return null;
}
