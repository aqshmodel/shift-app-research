import {test} from 'node:test';
import assert from 'node:assert/strict';
import {guardPublicRequest, validatePublicRequest} from '../src/lib/cost-guard.mjs';
const deployed={ENVIRONMENT:'production',D1_ACCESS_MODE:'normal'};
const request=(path='/',method='GET')=>new Request('https://shift.aqsh.co.jp'+path,{method,headers:{'CF-Connecting-IP':'192.0.2.1'}});
test('invalid inputs reject before limiter or D1 dispatch',async()=>{
 for(const path of ['/?q='+'a'.repeat(101),'/?page=101','/?feature=BAD','/products/?page=999','/compare/?products=OF-JP01,OF-JP01','/api/search/?limit=51','/api/evidence/?id=OF-JP01&page=101','/api/evidence/?id=OF-JP01&criterion=A99','/api/search/?q=x&q=y','/?x='+'a'.repeat(1501)]){
  let calls=0;const response=await guardPublicRequest(request(path),{...deployed,PUBLIC_API_LIMITER:{limit:async()=>{calls++;throw Error();}}});
  assert.equal(response.status,400,path);assert.equal(calls,0,path);
 }
});
test('all public SSR/API paths share one limiter and no UA bypass',async()=>{
 for(const path of ['/','/products/','/products/jp01/','/compare/','/categories/medical/','/webmcp/','/methodology/','/references/form-9/','/sitemap.xml','/api/search/']){
  let calls=0;const response=await guardPublicRequest(request(path),{...deployed,PUBLIC_API_LIMITER:{limit:async()=>{calls++;return {success:false};}}});
  assert.equal(response.status,429,path);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.equal(calls,1);
 }
});
test('missing limiter/IP, thrown limiter and invalid mode fail closed in deployed environments',async()=>{
 for(const env of [deployed,{...deployed,PUBLIC_API_LIMITER:{limit:async()=>{throw Error('offline');}}},{...deployed,D1_ACCESS_MODE:undefined},{...deployed,D1_ACCESS_MODE:'typo'}])assert.equal((await guardPublicRequest(request(),env)).status,503);
 assert.equal((await guardPublicRequest(new Request('https://shift.aqsh.co.jp/'),{...deployed,PUBLIC_API_LIMITER:{}})).status,503);
 assert.equal(await guardPublicRequest(request(),{ENVIRONMENT:'development'}),null);
});
test('pause and recovery gate dispatch with no database operation or retry',async()=>{
 let db=0,limits=0;const env={...deployed,PUBLIC_API_LIMITER:{limit:async()=>{limits++;return {success:true};}}};
 async function dispatch(mode){const blocked=await guardPublicRequest(request(),{...env,D1_ACCESS_MODE:mode});if(blocked)return blocked;db++;return new Response('ok');}
 assert.equal((await dispatch('paused')).status,503);assert.equal(db,0);assert.equal(limits,0);
 assert.equal((await guardPublicRequest(request('/healthz'),{...env,D1_ACCESS_MODE:'paused'})).status,200);assert.equal(db,0);
 assert.equal((await guardPublicRequest(request('/healthz/'),{...env,D1_ACCESS_MODE:'paused'})).status,200);assert.equal(db,0);
 assert.equal((await dispatch('normal')).status,200);assert.equal(db,1);assert.equal(limits,1);
});
test('valid filters, tracking parameters and bounded four-product comparison remain available',()=>{
 for(const path of ['/?category=medical&feature=B01&feature=N02&utm_source=google','/api/search/?q=シフト&limit=50','/compare/?products=OF-JP01&products=OF-JP02&products=&products=','/api/compare/?products=OF-JP01,OF-JP02,OF-JP03,OF-JP04'])assert.doesNotThrow(()=>validatePublicRequest(new URL('https://shift.aqsh.co.jp'+path)));
});
