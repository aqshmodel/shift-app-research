import {test,expect} from '@playwright/test';
import {DETAIL_CONTENT_UPDATED} from '../../src/lib/publication-dates.mjs';

test('complete service history is in the initial HTML and opens without JavaScript',async({browser,request})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
 try{
  for(const [slug,id] of [['jp01','OF-JP01'],['us09','OF-US09']]){
   const api=await (await request.get('/api/evidence/?id='+id)).json();expect(api.limit).toBe(10);
   const url=new URL('/products/'+slug+'/',test.info().project.use.baseURL).href;
   const response=await page.goto(url);expect(response.status()).toBe(200);
   expect(await page.locator('.record').count()).toBe(api.total);
   const ids=await page.locator('.record').evaluateAll(nodes=>nodes.map(n=>n.dataset.observationId));expect(new Set(ids).size).toBe(api.total);
   const archive=page.locator('.record-archive');await expect(archive.locator('.record').first()).toBeHidden();
   await archive.locator('summary').click();await expect(archive.locator('.record').first()).toBeVisible();
   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://shift.aqsh.co.jp/products/'+slug+'/');
   expect(await page.locator('meta[name="robots"]').getAttribute('content')).not.toContain('noindex');
   const graph=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];
   expect(graph.find(n=>n['@type']==='WebPage').dateModified).toBe(DETAIL_CONTENT_UPDATED);
  }
 }finally{await context.close();}
});

test('all fifty canonical service URLs have verifiable modification dates in the sitemap',async({request})=>{
 const response=await request.get('/sitemap.xml');expect(response.status()).toBe(200);const xml=await response.text();
 const entries=[...xml.matchAll(/<url>(.*?)<\/url>/g)].map(m=>m[1]);expect(entries.length).toBe(62);
 const details=entries.filter(e=>/<loc>https:\/\/shift\.aqsh\.co\.jp\/products\/(jp|us)\d{2}\/<\/loc>/.test(e));expect(details.length).toBe(50);
 for(const entry of details){const date=entry.match(/<lastmod>(.*?)<\/lastmod>/)?.[1];expect(date).toBeTruthy();expect(date>=DETAIL_CONTENT_UPDATED).toBe(true);expect(Number.isNaN(Date.parse(date))).toBe(false);}
});
