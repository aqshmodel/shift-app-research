import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const origin='https://shift.aqsh.co.jp';
const code=await readFile(new URL('../../src/lib/analytics.mjs',import.meta.url),'utf8');
const fixture=`<!doctype html><html lang="ja"><head><meta property="og:title" content="サービスを探せます | Aqsh"><script type="module" src="/analytics.js"></script></head><body><main><form id="product-search"><input name="q" aria-label="検索語"><button>検索</button></form><button class="compare-add" data-id="OF-JP04">比較に追加</button><a data-vendor-id="OF-JP04" href="#">公式ページ</a></main><footer><button id="analytics-settings" hidden>アクセス解析の設定</button></footer><aside id="analytics-consent" data-measurement-id="G-TESTONLY01" hidden><strong>アクセス解析へのご協力</strong><p id="analytics-choice"></p><button id="analytics-deny">同意しません</button><button id="analytics-allow">同意します</button><button id="analytics-close" hidden>閉じる</button></aside></body></html>`;
async function harness(page,host=origin) {
 const calls=[];
 await page.route('**/*',async route=>{
  const url=route.request().url();
  if(url.startsWith('https://www.googletagmanager.com/')) { calls.push(url);return route.fulfill({contentType:'application/javascript',body:'window.testTagLoaded=true;'}); }
  if(url.startsWith(host+'/analytics.js')) return route.fulfill({contentType:'application/javascript',body:code+'\ninitializeAnalytics();'});
  if(url.startsWith(host+'/')) return route.fulfill({contentType:'text/html; charset=utf-8',body:fixture,headers:{'Content-Security-Policy':"default-src 'self'; script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://*.google-analytics.com; style-src 'unsafe-inline'"}});
  await route.abort();
 });
 return calls;
}

test('opt-in loads one tag, sanitized events omit raw query, and withdrawal stops future collection',async({page})=>{
 const calls=await harness(page);
 await page.goto(origin+'/products/?q=private%40example.com#private-data');
 await expect(page.locator('#analytics-consent')).toBeVisible();expect(calls).toEqual([]);
 await page.getByRole('button',{name:'同意します',exact:true}).click();
 await expect.poll(()=>calls.length).toBe(1);
 await page.getByRole('button',{name:'比較に追加',exact:true}).click();
 await page.getByRole('link',{name:'公式ページ',exact:true}).click();
 const layer=await page.evaluate(()=>window.dataLayer.map(item=>Array.from(item)));
 const serialized=JSON.stringify(layer);expect(serialized).not.toMatch(/private|example\.com|q=/);
 expect(layer.filter(x=>x[0]==='event'&&x[1]==='page_view')).toHaveLength(1);
 expect(layer.filter(x=>x[0]==='event').map(x=>x[1])).toEqual(['page_view','compare_select','vendor_click']);
 expect(layer.find(x=>x[0]==='config')[2]).toMatchObject({cookie_domain:'shift.aqsh.co.jp',send_page_view:false,allow_google_signals:false});
 await page.context().addCookies([{name:'_ga',value:'test',domain:'shift.aqsh.co.jp',path:'/',secure:true}]);
 await page.getByRole('button',{name:'アクセス解析の設定',exact:true}).click();
 await page.getByRole('button',{name:'同意しません',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('aqsh-shift-analytics-v1')).state)).toBe('denied');
 await page.reload();await expect(page.locator('#analytics-consent')).toBeHidden();
 expect(calls).toHaveLength(1);expect((await page.context().cookies()).filter(c=>c.name.startsWith('_ga'))).toEqual([]);
});

test('refusal survives navigation and preview hosts cannot load a Google tag',async({page})=>{
 const calls=await harness(page);
 await page.goto(origin+'/');await page.getByRole('button',{name:'同意しません',exact:true}).click();
 await page.goto(origin+'/products/');await expect(page.locator('#analytics-consent')).toBeHidden();
 expect(calls).toEqual([]);
 await page.unroute('**/*');const previewCalls=await harness(page,'https://aqsh-shift.pages.dev');
 await page.goto('https://aqsh-shift.pages.dev/');await expect(page.locator('#analytics-consent')).toBeHidden();
 await expect(page.locator('#analytics-settings')).toBeHidden();expect(previewCalls).toEqual([]);
});

test('a page restored from history respects consent withdrawn on another page',async({page})=>{
 const calls=await harness(page);
 await page.goto(origin+'/');await page.getByRole('button',{name:'同意します',exact:true}).click();
 await expect.poll(()=>calls.length).toBe(1);
 await Promise.all([page.waitForEvent('load'),page.evaluate(()=>{
  localStorage.setItem('aqsh-shift-analytics-v1',JSON.stringify({state:'denied',at:Date.now()}));
  window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
 })]);
 await expect.poll(()=>page.evaluate(()=>window['ga-disable-G-TESTONLY01'])).toBe(true);
 await expect(page.locator('#analytics-consent')).toBeHidden();expect(calls).toHaveLength(1);
});
