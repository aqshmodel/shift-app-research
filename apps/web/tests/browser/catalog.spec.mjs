import {test,expect} from '@playwright/test';
test('all 50 products are searchable, server rendered and have distinct detail metadata',async({request})=>{
 const res=await request.get('/api/search/?limit=50');expect(res.status()).toBe(200);const data=await res.json();expect(data.products.length).toBe(50);expect(new Set(data.products.map(x=>x.id)).size).toBe(50);
 const scope=await(await request.get('/api/scope/')).json();expect(data.as_of_date).toBe(scope.as_of_date);expect(data.snapshot_id).toBe(scope.snapshot_id);
 const [year,month,day]=scope.as_of_date.split('-').map(Number);const asOf=`${year}年${month}月${day}日`;
 const titles=new Set();for(const product of data.products){const r=await request.get('/products/'+product.slug+'/');expect(r.status()).toBe(200);const html=await r.text();expect(html).toContain(product.name.replace(/&/g,'&amp;'));expect(html).toContain(asOf+'現在');expect(product.as_of_date).toBe(scope.as_of_date);expect(html).toContain(product.official_url.replace(/&/g,'&amp;'));titles.add(html.match(/<title>(.*?)<\/title>/s)?.[1]);expect(html).toContain('https://shift.aqsh.co.jp/products/'+product.slug+'/');}
 expect(titles.size).toBe(50);
});
test('API input boundaries, nonmutation, evidence pagination and complete price conditions',async({request})=>{
 for(const path of ['/api/search/?limit=51','/api/search/?category=madeup','/api/search/?sql=select','/api/evidence/?id=OF-JP04&criterion=A99','/api/compare/?products=OF-JP01','/api/compare/?products=OF-JP01,OF-JP01'])expect((await request.get(path)).status()).toBe(400);
 expect((await request.post('/api/scope/',{data:{}})).status()).toBe(405);expect((await request.head('/api/scope/')).status()).toBe(200);expect((await request.get('/api/missing/')).status()).toBe(404);
 const e1=await (await request.get('/api/evidence/?id=OF-JP04&page=1')).json();const e2=await (await request.get('/api/evidence/?id=OF-JP04&page=2')).json();expect(e1.records.length).toBe(10);expect(e2.records.length).toBe(10);expect(e1.records.map(x=>x.id).some(id=>e2.records.some(x=>x.id===id))).toBe(false);expect(e1.records.every(x=>x.sources.length)).toBe(true);
 const p=await (await request.get('/api/products/OF-JP03/')).json();expect(p.prices.every(x=>'min_billable_units' in x.plan_conditions)).toBe(true);expect(p.independent_tests_performed).toBe(false);
 const injected=await (await request.get('/api/search/?q='+encodeURIComponent("' OR 1=1 --"))).json();expect(injected.total).toBe(0);
});
test('SEO routes, no fabricated reviews, operator phone omission, and real 404s',async({request})=>{
 const sitemap=await (await request.get('/sitemap.xml')).text();const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);expect(urls.length).toBe(62);expect(new Set(urls).size).toBe(62);expect(urls.some(x=>x.includes('?')||x.includes('/compare/'))).toBe(false);
 const phone=/019[-ー\s]?656[-ー\s]?8677|tel:|"telephone"/i;
 for(const path of ['/about/','/privacy/','/terms/']){const html=await(await request.get(path)).text();expect(html).not.toMatch(phone);expect(html).toContain('Aqsh');}
 expect((await request.get('/products/jp99/')).status()).toBe(404);expect((await request.get('/absent/')).status()).toBe(404);expect((await request.get('/categories/absent/')).status()).toBe(404);
 const html=await(await request.get('/products/?category=medical')).text();expect(html).toContain('noindex, follow');expect(html).not.toMatch(/aggregateRating|"Review"/);
});
test('normal UI search, filters, compare selection and mobile overflow',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/products/');await page.getByLabel('製品名・会社名・機能で検索').fill('Shiftmation');await page.getByRole('button',{name:'検索する'}).click();await expect(page.locator('.product-card')).toHaveCount(1);
 await page.goto('/products/');const add=page.locator('.compare-add');await add.nth(0).click();await add.nth(1).click();await expect(page.locator('#compare-go')).toHaveText('比較する →');await page.locator('#compare-go').click();await expect(page.locator('.comparison-table')).toBeVisible();
 await page.setViewportSize({width:390,height:844});for(const path of ['/','/products/','/products/jp04/','/compare/?products=OF-JP01,OF-US01']){await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
 expect(errors).toEqual([]);
});
test('search and comparison work without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(test.info().project.use.baseURL+'/products/?q=Shiftmation');await expect(page.locator('.product-card')).toHaveCount(1);await page.goto(test.info().project.use.baseURL+'/compare/?products=OF-JP01,OF-US01');await expect(page.locator('.comparison-table')).toBeVisible();await context.close();
});
test('planned care calculation and task assignment preserve capability scope',async({request})=>{
 const nafty=await(await request.get('/api/products/OF-JP04/')).json();expect(nafty.assessments.find(a=>a.id==='J06').status).toBe('planned');
 const air=await(await request.get('/api/products/OF-JP27/')).json();const assignment=air.assessments.find(a=>a.id==='B01');expect(assignment.status).toBe('unknown');expect(assignment.rationale).toContain('業務の自動割当');
 const results=await(await request.get('/api/search/?feature=B01&limit=50')).json();expect(results.products.some(p=>p.id==='OF-JP27')).toBe(false);
 const refs=await(await request.get('/references/form-9/')).text();expect(refs).toContain('D');expect(refs).toContain('E');expect(refs).toContain('B');expect(refs).toContain('実装');
});
