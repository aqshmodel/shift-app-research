import {test, expect} from '@playwright/test';

test('all products omit unconfirmed feature rows while retaining documented, planned and disputed information', async ({request}) => {
  const catalog = await (await request.get('/api/search/?limit=50')).json();
  for (const product of catalog.products) {
    const data = await (await request.get(`/api/products/${product.id}/`)).json();
    const response = await request.get(`/products/${product.slug}/`);
    const html = await response.text();
    const shown = [...html.matchAll(/data-criterion="([A-Z]\d{2})"/g)].map(match => match[1]);
    const expected = data.assessments.filter(a => a.status !== 'unknown').map(a => a.id);
    expect(new Set(shown), product.name).toEqual(new Set(expected));
    expect(shown.length, product.name).toBe(expected.length);
    expect(html, product.name).not.toContain('根拠');
    expect(html, product.name).not.toContain('data-state="unknown"');
    expect(html, product.name).not.toMatch(/<details|<summary/);
    expect(response.headers()['server-timing']).toContain('db_calls;desc="2"');
  }
  for (const path of ['/', '/products/', '/about/', '/methodology/', '/webmcp/', '/terms/', '/references/form-9/']) {
    expect(await (await request.get(path)).text(), path).not.toContain('根拠');
  }
});

test('feature explanations and notes are readable without opening controls or running JavaScript', async ({browser, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
  const page = await context.newPage();
  await page.goto(baseURL + '/products/jp04/#features');
  await expect(page.locator('#features h2')).toHaveText('機能と利用条件');
  await expect(page.locator('.feature-item').first().locator('.finding').first()).toBeVisible();
  await expect(page.locator('.feature-item').first().locator('.source-links')).toBeVisible();
  const toc = page.getByRole('navigation', {name: '機能の目次'});
  await toc.getByRole('link', {name: '医療・介護の帳票', exact: true}).click();
  await expect(page.locator('#features-medical-care-title')).toBeInViewport();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({width, height: 900});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), String(width)).toBe(true);
  }
  await context.close();
});

test('comparison omits wholly unconfirmed rows and keeps missing information distinct from lack of support', async ({page, request}) => {
  const products = 'OF-JP04,OF-JP27';
  const data = await (await request.get('/api/compare/?products=' + products)).json();
  // AI still receives unconfirmed records, including the narrower task-assignment scope.
  expect(data.products[1].assessments.find(a => a.id === 'B01').status).toBe('unknown');
  await page.goto('/compare/?products=' + products);
  const expected = [...new Set(data.criteria)].filter(id => data.products.some(p => p.assessments.some(a => a.id === id && a.status !== 'unknown')));
  expect(await page.locator('tr[data-criterion]').evaluateAll(rows => rows.map(row => row.dataset.criterion))).toEqual(expected);
  await expect(page.locator('.state-unknown')).toHaveCount(0);
  await expect(page.locator('tr[data-criterion="B01"] .comparison-empty')).toContainText('公開資料の記載は未確認です。');
  await expect(page.locator('tr[data-criterion="J06"] .state-planned')).toBeVisible();
  await page.getByLabel('違いのある項目だけ').check();
  for (const row of await page.locator('tr[data-different="false"]').all()) await expect(row).toBeHidden();
  await page.getByLabel('違いのある項目だけ').uncheck();
  await expect(page.locator('.comparison-table')).toBeVisible();
});
