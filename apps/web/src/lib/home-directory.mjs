import {categories, features, normalize, validateSearch} from './contracts.mjs';

export const PAGE_SIZE = 12;
/** @type {Record<string, string>} */
export const featureNames = {
  B01: '勤務表の自動割当', J05: '様式9の計算方法', J06: '介護・福祉の配置基準',
  N02: 'SSO・多要素認証', M08: '解約時の全量出力',
};
/** @type {Record<string, string>} */
export const priceNames = {'': 'すべての料金', published: '有料・料金公開', free: '無料プランあり', quote: '個別見積もり', unpublished: '非公開'};
const nameOrder = new Intl.Collator('ja');

export function readDirectoryFilters(params) {
  const allowed = ['q', 'category', 'region', 'price', 'feature', 'sort', 'page'];
  if ([...params.keys()].some(key => !allowed.includes(key)) ||
      allowed.filter(key => key !== 'feature').some(key => params.getAll(key).length > 1)) {
    throw new Error('検索条件を確認してください。');
  }
  const selected = [...new Set(params.getAll('feature'))];
  if (selected.some(id => !features.includes(id))) throw new Error('機能の条件を確認してください。');
  const base = validateSearch({q: params.get('q') ?? '', category: params.get('category') ?? '',
    region: params.get('region') ?? '', page: params.get('page') ?? 1});
  const sort = params.get('sort') || 'domestic';
  if (!['domestic', 'name'].includes(sort)) throw new Error('並び順を確認してください。');
  const price = params.get('price') || '';
  if (!Object.hasOwn(priceNames, price)) throw new Error('料金の条件を確認してください。');
  return {q: base.q, category: base.category, region: base.region, price, features: selected, sort, page: base.page};
}

export function directoryUrl(filters, changes = {}) {
  const next = {...filters, ...changes};
  const params = new URLSearchParams();
  for (const key of ['q', 'category', 'region', 'price']) if (next[key]) params.set(key, next[key]);
  for (const id of next.features ?? []) params.append('feature', id);
  if (next.sort === 'name') params.set('sort', 'name');
  if (next.page > 1) params.set('page', String(next.page));
  return '/' + (params.size ? '?' + params : '') + '#services';
}

export function buildDirectory(catalog, filters) {
  const hasFeature = (product, id) => product.features.some(f => f.id === id && f.status === 'documented');
  const searchText = filters.q ? new Map(catalog.map(product => [product, normalize(product.search_text)])) : null;
  const matches = (product, values) => (!values.q || searchText.get(product).includes(values.q)) &&
    (!values.category || product.categories.includes(values.category)) &&
    (!values.region || product.region === values.region) &&
    (!values.price || product.price_summary?.kind === values.price) && values.features.every(id => hasFeature(product, id));
  const products = catalog.filter(p => matches(p, filters)).sort((a, b) =>
    (filters.sort === 'domestic' ? Number(a.region !== 'domestic') - Number(b.region !== 'domestic') : 0) ||
    nameOrder.compare(a.name, b.name));
  // Facet counts keep the other conditions, so selecting an option has a predictable result.
  const counts = {
    category: Object.fromEntries(['', ...categories].map(id => [id, catalog.filter(p => matches(p, {...filters, category: id})).length])),
    region: Object.fromEntries(['', 'domestic', 'overseas'].map(id => [id, catalog.filter(p => matches(p, {...filters, region: id})).length])),
    price: Object.fromEntries(Object.keys(priceNames).map(id => [id, catalog.filter(p => matches(p, {...filters, price: id})).length])),
    feature: Object.fromEntries(features.map(id => [id, catalog.filter(p => matches(p, {...filters, features: [...new Set([...filters.features, id])]})).length])),
  };
  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const start = (page - 1) * PAGE_SIZE;
  return {filters: {...filters, page}, total: products.length, pages, start, counts,
    products: products.slice(start, start + PAGE_SIZE)};
}
