import { validateSearch, validateIds, validateId, validateEvidence } from './contracts.mjs';
type Row = Record<string, any>;
interface Statement {
  bind(...values: unknown[]): Statement;
  first(): Promise<Row | null>;
  all(): Promise<{ results: Row[] }>;
}
export interface Database {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<{ results: Row[] }[]>;
}
const nameOrder = new Intl.Collator('ja');
export const compactAssessment = (a: any) => ({
  ...a, findings_total: a.findings.length, findings_truncated: a.findings.length > 2,
  findings: a.findings.slice(0, 2).map((f: any) => ({
    ...f, summary: f.summary?.slice(0, 900), summary_truncated: (f.summary?.length || 0) > 900,
    sources_total: f.sources.length, sources: f.sources.slice(0, 3),
  })),
});

// Each instance belongs to one request. Promises and D1 I/O never cross requests.
export function createResearchRepository(database: Database) {
  let snapshotPromise: Promise<Row> | undefined;
  let catalogPromise: Promise<Row[]> | undefined;
  const productPromises = new Map<string, Promise<Row | null>>();
  const metrics = { calls: 0, queries: 0, duration: 0 };
  const snapshotSql = 'SELECT s.snapshot_id,s.as_of_date,s.scope_json FROM web_live l JOIN web_snapshots s ON s.snapshot_id=l.snapshot_id WHERE l.id=1';
  function hydrate(row: Row | null): Row {
    if (!row) throw new Error('Published snapshot unavailable');
    return { id: row.snapshot_id, date: row.as_of_date, scope: JSON.parse(row.scope_json) };
  }
  async function read<T>(operation: () => Promise<T>, queries = 1): Promise<T> {
    const start = performance.now(); metrics.calls++; metrics.queries += queries;
    try { return await operation(); } finally { metrics.duration += performance.now() - start; }
  }
  function snapshot(): Promise<Row> {
    return snapshotPromise ??= read(async () => {
      return hydrate(await database.prepare(snapshotSql).first());
    });
  }
  async function scope() { return (await snapshot()).scope; }
  function catalog(): Promise<Row[]> {
    return catalogPromise ??= (async () => {
      let results: Row[];
      if (!snapshotPromise) {
        const batch = read(() => database.batch([
          database.prepare(snapshotSql),
          database.prepare('SELECT p.summary_json,p.search_text FROM web_products p JOIN web_live l ON p.snapshot_id=l.snapshot_id WHERE l.id=1 ORDER BY p.slug'),
        ]), 2);
        snapshotPromise = batch.then(rows => hydrate(rows[0].results[0]));
        const [rows] = await Promise.all([batch, snapshotPromise]);
        results = rows[1].results;
      } else {
        const current = await snapshot();
        results = (await read(() => database.prepare('SELECT summary_json,search_text FROM web_products WHERE snapshot_id=? ORDER BY slug').bind(current.id).all())).results;
      }
      return results.map(row => ({ ...JSON.parse(row.summary_json), search_text: row.search_text })).sort((a, b) => nameOrder.compare(a.name, b.name));
    })();
  }
  async function search(input: Record<string, unknown> = {}) {
    const filters = validateSearch(input); const list = await catalog();
    const matches = list.filter(p => (!filters.q || p.search_text.includes(filters.q)) &&
      (!filters.category || p.categories.includes(filters.category)) && (!filters.region || p.region === filters.region) &&
      (!filters.feature || p.features.some((f: any) => f.id === filters.feature && (filters.state ? f.status === filters.state : f.status === 'documented'))) &&
      (!filters.state || filters.feature || p.features.some((f: any) => f.status === filters.state)));
    const start = (filters.page - 1) * filters.limit;
    return { filters, total: matches.length, page: filters.page, limit: filters.limit,
      has_more: start + filters.limit < matches.length,
      products: matches.slice(start, start + filters.limit).map(({ search_text, ...p }) => p) };
  }
  function product(id: string): Promise<Row | null> {
    validateId(id);
    if (!productPromises.has(id)) productPromises.set(id, (async () => {
      const row = await productRow('offering_id', id);
      return row ? JSON.parse(row.detail_json) : null;
    })());
    return productPromises.get(id)!;
  }
  async function productRow(key: 'offering_id' | 'slug', value: string) {
    if (!snapshotPromise) {
      const query = read(() => database.prepare(`SELECT p.detail_json,s.snapshot_id,s.as_of_date,s.scope_json FROM web_live l JOIN web_snapshots s ON s.snapshot_id=l.snapshot_id LEFT JOIN web_products p ON p.snapshot_id=s.snapshot_id AND p.${key}=? WHERE l.id=1`).bind(value).first());
      snapshotPromise = query.then(hydrate);
      const [row] = await Promise.all([query, snapshotPromise]);
      return row?.detail_json ? row : null;
    }
    const current = await snapshot();
    return read(() => database.prepare(`SELECT detail_json FROM web_products WHERE snapshot_id=? AND ${key}=?`).bind(current.id, value).first());
  }
  async function productBySlug(slug: string) {
    if (!/^(jp|us)\d{2}$/.test(slug)) return null;
    const row = await productRow('slug', slug);
    const item = row ? JSON.parse(row.detail_json) : null;
    if (item) productPromises.set(item.id, Promise.resolve(item)); return item;
  }
  async function compare(ids: string[]) {
    validateIds(ids); const current = await snapshot();
    const missing = ids.filter(id => !productPromises.has(id));
    if (missing.length) {
      const { results } = await read(() => database.prepare(`SELECT offering_id,detail_json FROM web_products WHERE snapshot_id=? AND offering_id IN (${missing.map(() => '?').join(',')})`).bind(current.id, ...missing).all());
      const found = new Map(results.map(row => [row.offering_id, JSON.parse(row.detail_json)]));
      for (const id of missing) productPromises.set(id, Promise.resolve(found.get(id) ?? null));
    }
    const items = await Promise.all(ids.map(product));
    if (items.some(p => !p)) throw new Error('製品が見つかりません。');
    const keys = [...current.scope.criteria.map((x: any) => x.criterion_id), 'J05', 'N02'];
    return { products: items.map(p => ({ ...p!, assessments: p!.assessments.filter((a: any) => keys.includes(a.id)).map(compactAssessment),
      evidence_url: '/api/evidence/?id=' + p!.id, detail_url: 'https://shift.aqsh.co.jp/products/' + p!.slug + '/' })),
      criteria: keys, as_of_date: current.scope.as_of_date, snapshot_id: current.scope.snapshot_id, limitations: current.scope.limitations };
  }
  async function evidence(input: Record<string, unknown>) {
    const v = validateEvidence(input); const current = await snapshot();
    // Reuse the detail page read. Evidence-only requests retrieve only the product ID.
    const exists = productPromises.has(v.id) ? Boolean(await productPromises.get(v.id)) :
      Boolean(await read(() => database.prepare('SELECT offering_id FROM web_products WHERE snapshot_id=? AND offering_id=?').bind(current.id, v.id).first()));
    if (!exists) return null;
    const condition = 'offering_id=?' + (v.criterion ? ' AND criterion_id=?' : '');
    const args = v.criterion ? [v.id, v.criterion] : [v.id];
    const statements = [
      database.prepare("SELECT count(DISTINCT observation_id) AS n FROM observations WHERE record_category='document_observation' AND " + condition).bind(...args),
      database.prepare("SELECT * FROM v_current_observations WHERE observation_id IN (SELECT observation_id FROM observations WHERE record_category='document_observation' AND " + condition + ' ORDER BY observation_id DESC LIMIT ? OFFSET ?) ORDER BY observation_id DESC,evidence_id').bind(...args, 10, (v.page - 1) * 10),
    ];
    if (v.criterion) statements.push(database.prepare('SELECT criterion_id FROM criteria WHERE criterion_id=?').bind(v.criterion));
    const [counts, observations, criterion] = await read(() => database.batch(statements), statements.length);
    if (v.criterion && !criterion.results.length) throw new Error('比較項目がありません。');
    const records: Record<string, any> = {};
    for (const x of observations.results) {
      records[x.observation_id] ??= { id: x.observation_id, criterion: x.criterion_id, label: x.label_ja,
        summary: x.paraphrase || x.summary_ja || x.unknown_reason, state: x.value_state,
        scope: JSON.parse(x.applicability_json || '{}'), limitations: x.limitations,
        verification: x.verification_stage, evidence_role: x.current_evidence_role, sources: [] };
      records[x.observation_id].sources.push({ url: x.canonical_url, title: x.title, locator: x.locator, retrieved_on: x.retrieved_on });
    }
    const total = counts.results[0].n;
    return { id: v.id, criterion: v.criterion, page: v.page, limit: 10, total,
      has_more: v.page * 10 < total, records: Object.values(records),
      as_of_date: current.scope.as_of_date, snapshot_id: current.scope.snapshot_id };
  }
  return { scope, catalog, search, product, productBySlug, compare, evidence,
    timingHeader: () => `db;dur=${metrics.duration.toFixed(1)}, db_calls;desc="${metrics.calls}", db_queries;desc="${metrics.queries}"`,
    metrics: () => ({ ...metrics }) };
}
