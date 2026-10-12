import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildDirectory, readDirectoryFilters, directoryUrl, PAGE_SIZE} from '../src/lib/home-directory.mjs';

const product = (id, {region = 'domestic', category = 'medical', state = 'documented', name = id, price = 'published'} = {}) =>
  ({id, name, region, categories: [category], search_text: 'ｓｈｉｆｔ 夜勤', price_summary: {kind: price}, features: [{id: 'B01', status: 'documented'}, {id: 'J05', status: state}]});

test('multiple required features exclude planned and unknown records without implying non-support', () => {
  const list = [product('a'), product('b', {state: 'planned'}), product('c', {state: 'unknown'}), product('d', {region: 'overseas'})];
  const filters = readDirectoryFilters(new URLSearchParams('category=medical&region=domestic&feature=B01&feature=J05'));
  const result = buildDirectory(list, filters);
  assert.deepEqual(result.products.map(p => p.id), ['a']);
  assert.equal(result.counts.region[''], 2);
  assert.equal(result.counts.category.medical, 1);
  assert.equal(buildDirectory(list, readDirectoryFilters(new URLSearchParams('q=SHIFT'))).total, 4);
  assert.equal(list[2].features[1].status, 'unknown');
});

test('pagination and filter links preserve AND conditions, Unicode query and available facets', () => {
  const list = Array.from({length: 26}, (_, i) => product('a' + String(i).padStart(2, '0')));
  const filters = readDirectoryFilters(new URLSearchParams('q=夜勤&feature=B01&feature=J05&page=2&sort=name'));
  const result = buildDirectory(list, filters);
  assert.equal(result.products.length, PAGE_SIZE); assert.equal(result.start, 12); assert.equal(result.pages, 3);
  const url = new URL(directoryUrl(filters, {region: 'domestic', page: 1}), 'https://shift.aqsh.co.jp');
  assert.deepEqual(url.searchParams.getAll('feature'), ['B01', 'J05']);
  assert.equal(url.searchParams.get('q'), '夜勤'); assert.equal(url.searchParams.has('page'), false);
  assert.equal(buildDirectory(list, {...filters, page: 99}).filters.page, 3);
  const empty = buildDirectory(list, {...filters, region: 'overseas'});
  assert.equal(empty.total, 0); assert.equal(empty.pages, 1); assert.equal(empty.counts.region.domestic, 26);
});

test('directory input rejects invalid or duplicate single-value fields and uses a neutral stable order', () => {
  for (const value of ['sql=x', 'category=absent', 'feature=N99', 'sort=price', 'price=0', 'price=free&price=quote', 'page=0', 'region=domestic&region=overseas', 'q=' + 'x'.repeat(101)]) {
    assert.throws(() => readDirectoryFilters(new URLSearchParams(value)));
  }
  const filters = readDirectoryFilters(new URLSearchParams('feature=B01&feature=B01'));
  assert.deepEqual(filters.features, ['B01']);
  const list = [product('a', {region: 'overseas'}), product('b')];
  assert.deepEqual(buildDirectory(list, {...filters, features: []}).products.map(p => p.id), ['b', 'a']);
  assert.deepEqual(buildDirectory(list, {...filters, features: [], sort: 'name'}).products.map(p => p.id), ['a', 'b']);
});

test('pricing filters use disclosed status and keep the other facet conditions', () => {
  const list = [product('paid'), product('free', {price: 'free'}), product('quote', {price: 'quote'}),
    product('hidden', {price: 'unpublished'}), product('overseas', {price: 'free', region: 'overseas'}),
    product('planned', {price: 'free', state: 'planned'}), product('store', {price: 'free', category: 'general'})];
  for (const kind of ['published', 'free', 'quote', 'unpublished']) {
    const filters = readDirectoryFilters(new URLSearchParams(`price=${kind}&category=medical&region=domestic&feature=J05`));
    const result = buildDirectory(list, filters);
    assert.equal(result.total, 1);
    assert.equal(result.products[0].price_summary.kind, kind);
    assert.deepEqual(result.counts.price, {'': 4, published: 1, free: 1, quote: 1, unpublished: 1});
    if (kind === 'free') {
      assert.equal(result.counts.region.overseas, 1);
      assert.equal(result.counts.category.general, 1);
    }
  }
  assert.equal(buildDirectory(list, readDirectoryFilters(new URLSearchParams())).total, 7);
});

test('pricing survives pagination and individual condition removal in shareable URLs', () => {
  const list = Array.from({length: 26}, (_, i) => product('a' + String(i).padStart(2, '0'), {price: 'unpublished'}));
  const filters = readDirectoryFilters(new URLSearchParams('price=unpublished&feature=B01&page=2'));
  assert.equal(buildDirectory(list, filters).start, 12);
  const url = new URL(directoryUrl(filters, {page: 3}), 'https://shift.aqsh.co.jp');
  assert.equal(url.searchParams.get('price'), 'unpublished');
  assert.equal(url.searchParams.get('page'), '3');
  assert.equal(url.searchParams.get('feature'), 'B01');
  const cleared = new URL(directoryUrl(filters, {price: '', page: 1}), 'https://shift.aqsh.co.jp');
  assert.equal(cleared.searchParams.has('price'), false);
  assert.equal(cleared.searchParams.get('feature'), 'B01');
});
