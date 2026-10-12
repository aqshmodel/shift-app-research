import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const kinds = ['published', 'free', 'quote', 'unpublished'];
const cardIds = html => [...html.matchAll(/class="compare-add"[^>]*data-id="([^"]+)"/g)].map(m => m[1]);
const catalog = async request => (await (await request.get('/api/search/?limit=50')).json()).products;

test('pricing groups server-render the correct services, facet counts and bounded pagination', async ({request}) => {
  const products = await catalog(request);
  for (const kind of kinds) {
    const expected = products.filter(p => p.price_summary.kind === kind);
    expect(expected.length).toBeGreaterThan(0);
    const found = [];
    for (let page = 1; page <= Math.ceil(expected.length / 12); page++) {
      const response = await request.get(`/?price=${kind}&page=${page}`);
      expect(response.status()).toBe(200);
      expect(response.headers()['server-timing']).toContain('db_calls;desc="1"');
      const html = await response.text();
      found.push(...cardIds(html));
      expect(html).toMatch(new RegExp(`<span(?=[^>]*data-facet="price:${kind}")(?=[^>]*aria-hidden="true")[^>]*>\\s*${expected.length}\\s*</span>`));
      expect(html).toContain('noindex, follow');
    }
    expect(found.sort()).toEqual(expected.map(p => p.id).sort());
  }
  for (const query of ['price=0', 'price=free&price=quote']) expect((await request.get('/?' + query)).status()).toBe(400);
  for (const path of ['/', '/products/', '/categories/care/']) {
    const html = await (await request.get(path)).text();
    for (const card of html.matchAll(/<article class="product-card"[\s\S]*?<\/article>/g)) {
      const logo = card[0].match(/<a(?=[^>]*class="product-logo")[^>]*href="([^"]+)"/);
      const name = card[0].match(/<h3\b[^>]*>\s*<a\b[^>]*href="([^"]+)"/);
      expect(logo?.[1]).toBe(name?.[1]);
      expect(logo?.[1]).toMatch(/^\/products\/[^/]+\/$/);
    }
  }
});

test('pricing combines with feature and category filters and survives chips, history and pagination', async ({page, request}) => {
  const products = await catalog(request);
  await page.goto('/#services');
  await page.getByRole('radio', {name:'有料・料金公開', exact:true}).check();
  await expect(page).toHaveURL(/price=published/);
  await page.getByRole('radio', {name:'医療・看護', exact:true}).check();
  await expect(page).toHaveURL(/category=medical/);
  await page.getByRole('checkbox', {name:'勤務表の自動割当', exact:true}).check();
  await expect(page).toHaveURL(/feature=B01/);
  const expected = products.filter(p => p.price_summary.kind === 'published' && p.categories.includes('medical') && p.features.some(f => f.id === 'B01' && f.status === 'documented'));
  expect(expected.length).toBeGreaterThan(0);
  await expect(page.locator('#directory-status')).toHaveText(expected.length + '件のサービス');
  const ids = await page.locator('.compare-add').evaluateAll(nodes => nodes.map(n => n.dataset.id));
  expect(ids.every(id => expected.some(p => p.id === id))).toBe(true);
  await page.getByRole('link', {name:'有料・料金公開の条件を解除', exact:true}).click();
  await expect(page).not.toHaveURL(/price=/);
  await expect(page.getByRole('radio', {name:'すべての料金', exact:true})).toBeChecked();
  await page.goBack();
  await expect(page.getByRole('radio', {name:'有料・料金公開', exact:true})).toBeChecked();
  await expect(page.locator('#directory-status')).toHaveText(expected.length + '件のサービス');
  await page.goto('/?price=unpublished#services');
  await page.locator('.compare-add').first().click();
  await page.getByRole('link', {name:'2ページ目', exact:true}).click();
  await expect(page).toHaveURL(/price=unpublished&page=2/);
  await expect(page.locator('#compare-selected button')).toHaveCount(1);
  const hiddenIds = await page.locator('.compare-add').evaluateAll(nodes => nodes.map(n => n.dataset.id));
  expect(hiddenIds.every(id => products.find(p => p.id === id).price_summary.kind === 'unpublished')).toBe(true);
});

test('GET pricing works without JavaScript and logo and service name both open the detail price', async ({browser, baseURL, request}) => {
  const products = await catalog(request);
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  try {
    await page.goto(baseURL + '/');
    await page.getByRole('radio', {name:'無料プランあり', exact:true}).check();
    await page.getByRole('button', {name:'検索する'}).click();
    await expect(page).toHaveURL(/price=free/);
    await expect(page.locator('.product-card')).toHaveCount(products.filter(p => p.price_summary.kind === 'free').length);
    for (const selector of ['a.product-logo', 'h3 a']) {
      const card = page.locator('.product-card').first();
      const label = await card.locator('.card-price strong').textContent();
      const href = await card.locator(selector).getAttribute('href');
      await card.locator(selector).click();
      await expect(page).toHaveURL(baseURL + href);
      await expect(page.locator('.detail-heading .detail-price strong')).toHaveText(label);
      await page.goBack();
      await expect(page.getByRole('radio', {name:'無料プランあり', exact:true})).toBeChecked();
    }
  } finally {await context.close();}
});

test('detail hero repeats pricing and conditions for disclosed, quoted, private and free services', async ({request}) => {
  const products = await catalog(request);
  const selected = [...kinds.map(kind => products.find(p => p.price_summary.kind === kind)), products.find(p => p.name === 'FIKAIGO'), products.find(p => p.name.includes('Nafty'))];
  for (const p of selected.filter(Boolean)) {
    const response = await request.get(`/products/${p.slug}/`);
    expect(response.status()).toBe(200);
    const hero = (await response.text()).split('<nav class="detail-nav')[0];
    expect(hero).toContain('class="detail-price"');
    expect(hero).toContain(p.price_summary.label);
    if (p.price_summary.note) expect(hero).toContain(p.price_summary.note.replaceAll('&', '&amp;'));
    expect(hero).toContain('href="#prices"');
  }
});

test('pricing filters and prominent detail pricing remain accessible on mobile and desktop', async ({page, request}) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const products = await catalog(request);
  const air = products.find(p => p.name === 'Airシフト');
  const nafty = products.find(p => p.name.includes('Nafty'));
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width, height:width === 1440 ? 1600 : 1000});
    await page.goto('/#services');
    const decline = page.getByRole('button', {name:'同意しません', exact:true});
    if (await decline.isVisible()) await decline.click();
    if (width <= 800) await page.locator('#mobile-filters-toggle').click();
    await expect(page.getByRole('radio', {name:'非公開', exact:true})).toBeVisible();
    if (width === 1440) {
      await page.evaluate(() => window.scrollTo({top:0, behavior:'instant'}));
      const layout = await page.locator('.directory-layout').boundingBox();
      const prices = await page.locator('.price-options').boundingBox();
      const card = await page.locator('.product-card').first().boundingBox();
      await page.screenshot({path:'../../docs/screenshots/pricing-filter-desktop-20261012.png',clip:{x:layout.x,y:layout.y,width:layout.width,height:Math.max(prices.y+prices.height,card.y+card.height)-layout.y}});
    }
    await page.getByRole('radio', {name:'無料プランあり', exact:true}).check();
    await expect(page).toHaveURL(/price=free/);
    if (width <= 800) await expect(page.locator('#mobile-filter-count')).toHaveText('（1条件）');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
    if (width === 390) {
      await page.locator('.directory-filters').screenshot({path:'../../docs/screenshots/pricing-filter-mobile-20261012.png'});
      const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(axe.violations.map(v => v.id)).toEqual([]);
    }
    for (const p of [air, nafty].filter(Boolean)) {
      await page.goto(`/products/${p.slug}/`);
      await expect(page.locator('.detail-price strong')).toHaveText(p.price_summary.label);
      const logo = await page.locator('.detail-logo').boundingBox();
      const name = await page.locator('.detail-heading h1').boundingBox();
      const price = await page.locator('.detail-price').boundingBox();
      expect(logo.y+logo.height).toBeLessThanOrEqual(name.y+1);
      expect(name.y+name.height).toBeLessThanOrEqual(price.y+1);
      expect(price.y+price.height).toBeLessThan(900);
      const layout = await page.locator('.detail-layout').boundingBox();
      const body = await page.locator('.detail-layout>article').boundingBox();
      const guidance = await page.locator('.detail-guidance').boundingBox();
      expect(body.width).toBeCloseTo(layout.width,0);
      expect(guidance.width).toBeCloseTo(layout.width,0);
      expect(guidance.x).toBeCloseTo(body.x,0);
      expect(guidance.y).toBeGreaterThanOrEqual(body.y+body.height-1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
      if (p === air && [390,1440].includes(width)) {
        await page.locator('.detail-heading').screenshot({path:`../../docs/screenshots/detail-single-column-${width === 390 ? 'mobile' : 'desktop'}-20261012.png`});
        const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
        expect(axe.violations.map(v => ({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
      }
      await page.locator('.detail-price>a').click();
      await expect(page).toHaveURL(/#prices$/);
      await expect(page.locator('#prices h2')).toBeInViewport();
    }
  }
  expect(errors).toEqual([]);
});
