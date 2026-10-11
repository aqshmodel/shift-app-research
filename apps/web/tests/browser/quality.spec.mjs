import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('new branding, lining numerals, polite copy and reduced-motion rendering',async({page})=>{
 await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 await expect(page).toHaveTitle(/Aqsh シフトづくりサービス比較/);
 await expect(page.getByRole('heading',{name:'AIと相談しながら探せます。',exact:true})).toBeVisible();
 const font=await page.locator('.research-number strong').evaluate(el=>({family:getComputedStyle(el).fontFamily,numeric:getComputedStyle(el).fontVariantNumeric,loaded:document.fonts.check('500 72px Manrope')}));
 expect(font.family).toContain('Manrope');expect(font.numeric).toContain('lining-nums');expect(font.numeric).toContain('tabular-nums');expect(font.loaded).toBe(true);
 await page.emulateMedia({reducedMotion:'reduce'});expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});

test('WCAG AA automated checks cover home, catalog, detail and comparison',async({page})=>{
 for(const path of ['/','/products/','/products/jp04/','/compare/?products=OF-JP01,OF-US01','/webmcp/']){
  await page.goto(path);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})),path).toEqual([]);
 }
});

test('320, 390, 768 and 1440 pixel layouts keep controls and pages in view',async({page})=>{
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const path of ['/','/products/','/products/jp04/','/compare/?products=OF-JP01,OF-US01']){
   await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width}: ${path}`).toBe(true);
  }
 }
});

test('native search navigation restores its usable button and decorative markup after back',async({page})=>{
 await page.goto('/');
 await page.getByLabel('製品名・会社名・機能で検索').fill('Shiftmation');
 await page.getByRole('button',{name:'検索する'}).click();
 await expect(page.locator('.product-card')).toHaveCount(1);
 await page.goBack();
 const button=page.getByRole('button',{name:'検索する'});
 await expect(button).toBeEnabled();await expect(button).not.toHaveAttribute('aria-busy','true');
 await expect(button.locator('[aria-hidden="true"]')).toHaveText('→');
});

test('deployed D1 request batching exposes the intended round-trip counts',async({request})=>{
 for(const [path,calls] of [['/api/search/?limit=50',1],['/products/jp04/',2],['/compare/?products=OF-JP01,OF-US01',2]]){
  const response=await request.get(path);expect(response.status()).toBe(200);
  expect(response.headers()['server-timing']).toContain(`db_calls;desc="${calls}"`);
 }
});
