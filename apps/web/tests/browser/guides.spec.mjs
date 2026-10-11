import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const categories=['medical','care','general','api'];
test('selection guides are crawlable, evidence-linked, and use one D1 round trip',async({request})=>{
 for(const category of categories){
  const path=`/categories/${category}/`;const response=await request.get(path);const html=await response.text();
  expect(response.status()).toBe(200);expect(response.headers()['server-timing']).toContain('db_calls;desc="1"');
  expect(html).toContain('rel="canonical" href="https://shift.aqsh.co.jp'+path+'"');
  expect(html).toContain('index, follow');expect(html).toContain('class="guide-steps"');
  expect(html).toContain('販売元へ聞く質問です。');expect(html).toContain('2026年10月11日');
  const scripts=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));
  const collection=scripts.flatMap(s=>s['@graph']||[]).find(s=>s['@type']==='CollectionPage');
  expect(collection.dateModified).toBe('2026-10-11');expect(collection.mainEntity.itemListElement.length).toBeGreaterThan(0);
  expect(html).not.toMatch(/aggregateRating|"Review"|"FAQPage"/);
 }
 const xml=await(await request.get('/sitemap.xml')).text();expect([...xml.matchAll(/<loc>/g)]).toHaveLength(62);
 expect([...xml.matchAll(/<lastmod>2026-10-11<\/lastmod>/g)]).toHaveLength(4);
});

test('guide navigation, FAQs and service links work on mobile without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();
 for(const category of categories){
  await page.goto(baseURL+`/categories/${category}/`);
  await page.getByRole('navigation',{name:'選び方の目次'}).getByRole('link',{name:'よくある質問',exact:true}).click();
  const faq=page.locator('.guide-faq details').first();await faq.locator('summary').click();await expect(faq.locator('p')).toBeVisible();
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),category+':'+width).toBe(true);
  }
  await page.getByRole('navigation',{name:'選び方の目次'}).getByRole('link',{name:'対象サービス',exact:true}).click();
  await expect(page.locator('#products-title')).toBeInViewport();expect(await page.locator('.product-card').count()).toBeGreaterThan(0);
  await page.locator('.guide-example-links').first().getByRole('link',{name:'調査記録を見る'}).click();await expect(page).toHaveURL(/\/products\/[^/]+\/$/);
 }
 await context.close();
});

test('guide interfaces meet automated WCAG AA checks',async({page})=>{
 for(const category of categories){
  await page.goto(`/categories/${category}/`);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),category).toEqual([]);
 }
});
