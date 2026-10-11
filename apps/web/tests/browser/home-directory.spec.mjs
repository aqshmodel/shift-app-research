import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home server-renders DB services, bounded pages, facets and one D1 round trip', async ({request}) => {
  const expected = await (await request.get('/api/search/?limit=50')).json();
  const ids = [];
  for (let page = 1; page <= 5; page++) {
    const response = await request.get(page === 1 ? '/' : '/?page=' + page);
    expect(response.status()).toBe(200);
    expect(response.headers()['server-timing']).toContain('db_calls;desc="1"');
    const html = await response.text();
    ids.push(...[...html.matchAll(/class="compare-add"[^>]*data-id="([^"]+)"/g)].map(m => m[1]));
    expect(html).toContain('用途や機能から探せます。');
    if (page === 1) {expect(html).toContain('"@type":"ItemList"'); expect(html).not.toContain('noindex, follow');}
    else expect(html).toContain('noindex, follow');
  }
  expect(ids).toHaveLength(50); expect(new Set(ids).size).toBe(50);
  expect(ids.sort()).toEqual(expected.products.map(p => p.id).sort());
  expect((await request.get('/?feature=N99')).status()).toBe(400);
  const combined = await (await request.get('/?feature=B01&feature=J05')).text();
  const selected = [...combined.matchAll(/class="compare-add"[^>]*data-id="([^"]+)"/g)].map(m => m[1]);
  expect(selected.length).toBeGreaterThan(0);
  for (const id of selected) expect(expected.products.find(p => p.id === id).features.filter(f => ['B01','J05'].includes(f.id)).every(f => f.status === 'documented')).toBe(true);
});

test('name-free filters combine capabilities, remove conditions and restore browser history', async ({page, request}) => {
  const catalog = (await (await request.get('/api/search/?limit=50')).json()).products;
  await page.goto('/');
  await expect(page.locator('.product-card')).toHaveCount(12);
  await page.getByRole('radio', {name: '医療・看護', exact: true}).check();
  await expect(page).toHaveURL(/category=medical/);
  await page.getByRole('checkbox', {name: '勤務表の自動割当', exact: true}).check();
  await expect(page).toHaveURL(/feature=B01/);
  await page.getByRole('checkbox', {name: '様式9の計算方法', exact: true}).check();
  await expect(page).toHaveURL(/feature=B01&feature=J05/);
  const expected = catalog.filter(p => p.categories.includes('medical') && ['B01','J05'].every(id => p.features.some(f => f.id === id && f.status === 'documented')));
  await expect(page.locator('#directory-status')).toHaveText(expected.length + '件のサービス');
  await expect(page.locator('.product-card')).toHaveCount(Math.min(expected.length, 12));
  await page.getByRole('link', {name: '様式9の計算方法の条件を解除', exact: true}).click();
  await expect(page).not.toHaveURL(/feature=J05/);
  await expect(page.getByRole('checkbox', {name: '様式9の計算方法', exact: true})).not.toBeChecked();
  await page.goBack();
  await expect(page.getByRole('checkbox', {name: '様式9の計算方法', exact: true})).toBeChecked();
  await expect(page.locator('#directory-status')).toHaveText(expected.length + '件のサービス');
  await expect(page.getByLabel('製品名・会社名・機能で検索', {exact: false})).toHaveValue('');
});

test('pagination preserves compare selection and replacement cards retain working actions', async ({page}) => {
  await page.goto('/');
  await page.locator('.compare-add').first().click();
  await page.getByRole('link', {name: '2ページ目', exact: true}).click();
  await expect(page.locator('#home-results')).toHaveAttribute('data-page', '2');
  await expect(page.locator('#home-results-title')).toBeFocused();
  await expect(page.locator('#compare-selected button')).toHaveCount(1);
  await page.locator('.compare-add').first().click();
  await expect(page.locator('#compare-selected button')).toHaveCount(2);
  await page.locator('#compare-go').click();
  await expect(page.locator('.comparison-table')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#home-results')).toHaveAttribute('data-page', '2');
  await expect(page.locator('.compare-add').first()).toHaveAttribute('aria-pressed', 'true');
});

test('GET filtering works without JavaScript and treats planned care as outside documented filters', async ({browser, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  try {
    await page.goto(baseURL + '/');
    await expect(page.locator('.product-card')).toHaveCount(12);
    await expect(page.getByRole('checkbox', {name: '様式9の計算方法', exact: true})).toBeVisible();
    await page.getByRole('radio', {name: '医療・看護', exact: true}).check();
    await page.getByRole('checkbox', {name: '勤務表の自動割当', exact: true}).check();
    await page.getByRole('button', {name: '検索する'}).click();
    await expect(page).toHaveURL(/category=medical.*feature=B01/);
    await expect(page.locator('.product-card')).not.toHaveCount(0);
    await page.goto(baseURL + '/?feature=J06');
    await expect(page.locator('.compare-add[data-id="OF-JP04"]')).toHaveCount(0);
  } finally {await context.close();}
});

test('a failed refresh restores applied controls, and stale requests cannot overwrite newer filters', async ({page}) => {
  await page.goto('/');
  await page.route('**/?category=medical*', route => route.fulfill({status: 503, body: 'unavailable'}));
  await page.getByRole('radio', {name: '医療・看護', exact: true}).check();
  await expect(page.locator('#directory-error')).toBeVisible();
  await expect(page.getByRole('radio', {name: 'すべての用途', exact: true})).toBeChecked();
  await expect(page.locator('.product-card')).toHaveCount(12);
  await page.unroute('**/?category=medical*');
  let release; const delayed = new Promise(resolve => {release = resolve;});
  await page.route('**/?category=medical*', async route => {await delayed; await route.continue().catch(() => {});});
  await page.getByRole('radio', {name: '医療・看護', exact: true}).check();
  await page.getByRole('radio', {name: 'API・開発者向け', exact: true}).check();
  await expect(page).toHaveURL(/category=api/);
  release();
  await expect(page.getByRole('radio', {name: 'API・開発者向け', exact: true})).toBeChecked();
  await expect(page.locator('#home-results')).not.toHaveAttribute('data-total', '50');
  await expect(page.locator('[data-home-directory]')).not.toHaveAttribute('aria-busy', 'true');
});

test('mobile exposes context and services first, with accessible optional filters and no overflow', async ({page}) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width, height: 900}); await page.goto('/');
    if (width <= 800) {
      await expect(page.locator('#mobile-filters-toggle')).toBeVisible();
      await expect(page.locator('#additional-filters')).not.toBeVisible();
      await page.locator('#mobile-filters-toggle').click();
      await expect(page.locator('#additional-filters')).toBeVisible();
      await page.getByRole('checkbox', {name: '勤務表の自動割当', exact: true}).check();
      await expect(page).toHaveURL(/feature=B01/);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), String(width)).toBe(true);
  }
  const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(result.violations.map(v => ({id:v.id, nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  expect(errors).toEqual([]);
});

test('fragment navigation avoids a DB refetch and the featured FIKAIGO logo uses the original local SVG', async ({page, request}) => {
  const external = []; const fetches = [];
  page.on('request', r => {
    if (r.url().startsWith('https://www.fikaigo.com/')) external.push(r.url());
    if (r.resourceType() === 'fetch' && new URL(r.url()).pathname === '/') fetches.push(r.url());
  });
  await page.goto('/');
  await expect(page.locator('[data-home-directory]')).toHaveAttribute('data-enhanced', 'true');
  await page.goto('/#services');
  await expect(page.locator('#directory-status')).toHaveText('50件のサービス');
  const image = page.getByRole('img', {name: 'FIKAIGO ロゴ', exact: true});
  await expect(image).toHaveAttribute('src', '/brand/products/fikaigo.svg');
  await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(external).toEqual([]); expect(fetches).toEqual([]);
  const asset = await request.get('/brand/products/fikaigo.svg');
  expect(asset.status()).toBe(200); expect(asset.headers()['content-type']).toContain('image/svg+xml');
  const data = await (await request.get('/api/products/OF-JP03/')).json();
  expect(data.logo.url).toBe('https://www.fikaigo.com/hubfs/logo_fikaigo.svg');
});
