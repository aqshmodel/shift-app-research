import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';

test('every service card server-renders a price in home, directory and category pages', async ({request}) => {
  const response = await request.get('/api/search/?limit=50');
  expect(response.status()).toBe(200);
  const products = (await response.json()).products;
  expect(products).toHaveLength(50);
  expect(products.every(p => p.price_summary?.label)).toBe(true);
  const target = new URL(process.env.TEST_BASE_URL || 'http://127.0.0.1:4321').hostname === 'shift.aqsh.co.jp' ? 'production' : 'staging';
  writeFileSync(`../../docs/card-pricing-${target}-data-20261012.json`, JSON.stringify({snapshot:products[0].snapshot_id,products:products.map(p=>({id:p.id,name:p.name,...p.price_summary}))},null,2)+'\n');
  for (const url of ['/', '/products/', '/categories/care/']) {
    const page = await request.get(url);
    expect(page.status()).toBe(200);
    expect(page.headers()['server-timing']).toContain('db_calls;desc="1"');
    const html = await page.text();
    const cards = [...html.matchAll(/<article class="product-card"[\s\S]*?<\/article>/g)].map(m => m[0]);
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) expect(card).toContain('class="card-price"');
  }
});

test('pricing stays readable on mobile and desktop and survives filtering', async ({page}) => {
  for (const width of [320,390,1440]) {
    await page.setViewportSize({width, height: 1000});
    await page.goto('/#services');
    const cards = page.locator('.product-card');
    await expect(cards).toHaveCount(12);
    await expect(cards.first().locator('.card-price strong')).toHaveText('月額330円 / 人');
    await expect(cards.nth(1).locator('.card-price strong')).toHaveText('年額8,400円 / 人');
    await expect(cards.nth(2).locator('.card-price strong')).toHaveText('非公開');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (width === 1440) {
      await page.locator('#home-results').screenshot({path:'../../docs/screenshots/card-pricing-desktop-20261012.png'});
      const first = await cards.first().boundingBox();
      const third = await cards.nth(2).boundingBox();
      await page.screenshot({path:'../../docs/screenshots/card-pricing-cards-20261012.png', clip:{x:first.x,y:first.y,width:third.x + third.width - first.x,height:Math.max(first.height,third.height)}});
    }
    if (width === 390) await page.locator('.product-card').first().screenshot({path:'../../docs/screenshots/card-pricing-mobile-20261012.png'});
  }
  const axe = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(axe.violations.map(v => v.id)).toEqual([]);
  await page.getByRole('radio', {name:'医療・看護',exact:true}).check();
  await expect(page).toHaveURL(/category=medical/);
  const labels = await page.locator('.card-price strong').allTextContents();
  expect(labels.length).toBeGreaterThan(0);
  expect(labels.every(Boolean)).toBe(true);
});
