import {test,expect} from '@playwright/test';
async function call(page,name,input,options={}) {return page.evaluate(async({name,input,options})=>{const tools=await document.modelContext.getTools();const result=await document.modelContext.executeTool(tools.find(t=>t.name===name),input,options);return typeof result==='string'?JSON.parse(result):result;},{name,input,options});}
test('five native tools return source-backed data and update visible UI',async({page,request})=>{
 await page.goto('/');await page.waitForFunction(()=>document.documentElement.dataset.webmcp==='ready');const tools=await page.evaluate(async()=>(await document.modelContext.getTools()).map(t=>({name:t.name,annotations:t.annotations,schema:t.inputSchema})));
 expect(tools.length).toBe(5);expect(tools.every(t=>t.annotations.readOnlyHint&&t.annotations.untrustedContentHint)).toBe(true);
 const publishedScope=await(await request.get('/api/scope/')).json();const scope=await call(page,'get_research_scope',{});expect(scope).toEqual(publishedScope);expect(scope.products).toBe(50);expect(scope.document_observations).toBeGreaterThan(0);await expect(page.locator('#agent-result')).toBeVisible();await expect(page.locator('#agent-content')).toContainText(String(scope.document_observations));
 const result=await call(page,'search_shift_products',{q:'Shiftmation',limit:10});expect(result.total).toBe(1);expect(result.products[0].id).toBe('OF-JP01');await expect(page.locator('#q')).toHaveValue('shiftmation');
 const detail=await call(page,'get_shift_product',{id:'OF-JP01'});expect(detail.assessments.some(a=>a.id==='B01'&&a.findings.some(f=>f.sources.length))).toBe(true);expect(detail.independent_tests_performed).toBe(false);await expect(page.locator('#agent-content')).toContainText('Shiftmation');
 const comparison=await call(page,'compare_shift_products',{ids:['OF-JP04','OF-US01']});expect(comparison.products.length).toBe(2);await expect(page.locator('#compare-selected button')).toHaveCount(2);
 const evidence=await call(page,'get_shift_evidence',{id:'OF-JP19',criterion:'J05'});expect(evidence.records.length).toBeGreaterThan(0);expect(evidence.records.every(r=>r.sources.length&&r.evidence_role)).toBe(true);await expect(page.locator('#agent-content')).toContainText(evidence.records[0].summary);
});
test('native cancellation prevents delayed results and page lifecycle removes tools',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>document.documentElement.dataset.webmcp==='ready');
 await page.route('**/api/search/**',async route=>{await new Promise(r=>setTimeout(r,500));await route.continue();});
 const result=await page.evaluate(async()=>{const tool=(await document.modelContext.getTools()).find(t=>t.name==='search_shift_products');const controller=new AbortController();const pending=document.modelContext.executeTool(tool,{q:'Night'}, {signal:controller.signal}).then(()=>false,e=>e.name==='AbortError');controller.abort();return pending;});expect(result).toBe(true);
 await expect(page.locator('#agent-result')).toBeHidden();
 const count=await page.evaluate(async()=>{dispatchEvent(new PageTransitionEvent('pagehide'));return (await document.modelContext.getTools()).length;});expect(count).toBe(0);
});
test('unsupported WebMCP leaves the normal UI operational',async({browser})=>{
 const context=await browser.newContext();await context.addInitScript(()=>Object.defineProperty(document,'modelContext',{value:undefined}));const page=await context.newPage();await page.goto(test.info().project.use.baseURL+'/products/?q=Shiftmation');await expect(page.locator('.product-card')).toHaveCount(1);expect(await page.evaluate(()=>document.documentElement.dataset.webmcp)).toBe('unavailable');await context.close();
});
