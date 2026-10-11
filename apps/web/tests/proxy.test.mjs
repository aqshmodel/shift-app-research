import {test} from 'node:test';
import assert from 'node:assert/strict';
import {onRequest} from '../../domain-proxy/functions/[[path]].js';
test('custom domain forwards fixed-origin paths and preserves Worker headers',async()=>{
 let forwarded;const response=await onRequest({request:new Request('https://shift.aqsh.co.jp/api/search/?q=night'),env:{RESEARCH:{fetch:async r=>{forwarded=r;return new Response('data',{headers:{'Content-Security-Policy':"default-src 'self'"}});}}}});
 assert.equal(forwarded.url,'https://shift.aqsh.co.jp/api/search/?q=night');assert.equal(await response.text(),'data');assert.equal(response.headers.get('X-Robots-Tag'),null);assert.ok(response.headers.has('Content-Security-Policy'));
});
test('Pages preview cannot be indexed and does not publish a sitemap in robots',async()=>{
 const env={RESEARCH:{fetch:async()=>new Response('html')}};
 const preview=await onRequest({request:new Request('https://aqsh-shift.pages.dev/'),env});assert.equal(preview.headers.get('X-Robots-Tag'),'noindex, nofollow');
 const robots=await onRequest({request:new Request('https://aqsh-shift.pages.dev/robots.txt'),env});assert.match(await robots.text(),/Disallow: \/\n/);
 const denied=await onRequest({request:new Request('https://shift.aqsh.co.jp/',{method:'POST'}),env});assert.equal(denied.status,405);
});
