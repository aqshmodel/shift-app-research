// Summaries are derived from the same immutable publication as the card.
// Preserve the original prices; setup fees, optional add-ons and old records
// must not become an advertised recurring price.
const recurringTypes = new Set(['subscription', 'recurring']);
const setupTypes = new Set(['setup', 'initial_setup', 'implementation']);
const personUnits = new Set(['職員', '勤務者', '人', '連携職員', '利用者', 'employee_month', 'employee_month_equivalent', 'staff_month', 'user_month', 'active employee', 'employee', 'rostered_staff_month']);
const units = {'部署アカウント': '部署', 'account_month': 'アカウント', 'organization_month': '組織', '箇所': '拠点', 'contract': '契約', 'team': 'チーム'};
const taxLabels = {inclusive: '税込', exclusive: '税別', unknown: '税区分未確認'};
const number = new Intl.NumberFormat('ja-JP', {maximumFractionDigits: 20});
const amount = price => price.unit_amount_decimal != null && /^\d+(?:\.\d+)?$/.test(String(price.unit_amount_decimal)) ? Number(price.unit_amount_decimal) : NaN;
const money = price => price.currency === 'JPY' ? number.format(amount(price)) + '円' : price.currency + ' ' + number.format(amount(price));
const unit = price => personUnits.has(price.billable_unit) ? '人' : units[price.billable_unit] || price.billable_unit;
const annualEquivalent = price => price.recurrence_months === 1 && (price.conditions?.price_basis === 'monthly_equivalent_annual_payment' || /年払|年契約/.test(price.plan_name));
const referenceOnly = price => Boolean(price.conditions?.reference_date || price.conditions?.price_document_date || /参考値|調達限定|現在の一般販売価格ではない/.test(price.conditions?.notes || ''));
const from = price => price.conditions?.starting_at || price.conditions?.price_qualifier === 'from' ? '〜' : '';

function fallback(prices, pricing) {
  const text = (pricing?.findings || []).map(f => f.summary || '').join(' ');
  const publishedButUncertain = prices.some(p => recurringTypes.has(p.charge_type) && p.conditions?.raw_display_amount != null);
  const quoted = pricing?.status === 'disputed' || publishedButUncertain || prices.some(p => p.amount_status === 'quote_required' || p.current_evidence_role === 'conflicting' || (recurringTypes.has(p.charge_type) && p.amount_status === 'known')) || /見積|個別案内|問い合わせ|問合せ|相談窓口/.test(text);
  return {label: quoted ? '個別見積もり' : '非公開', note: pricing?.status === 'disputed' || publishedButUncertain ? '適用料金はお問い合わせください' : '', kind: quoted ? 'quote' : 'unpublished'};
}

function conditions(prices) {
  const price = prices[0];
  const note = [price.plan_name, taxLabels[price.tax_status] || taxLabels.unknown];
  const annual = price.recurrence_months === 12 || annualEquivalent(price);
  if (annual) note.push(annualEquivalent(price) ? '年契約（月額換算）' : '年契約');
  if (['yes', 'required'].includes(price.plan_conditions?.prepayment)) note.push(annual ? '年額前払い' : '前払い');
  const minimum = Number(price.plan_conditions?.min_billable_units);
  if (minimum > 0) note.push(`最低${number.format(minimum)}${unit(price)}`);
  const min = price.conditions?.staff_count_min ?? price.conditions?.applicable_staff_min;
  const max = price.conditions?.staff_count_max ?? price.conditions?.applicable_staff_max;
  if (max != null) note.push(min != null ? `対象${min}〜${max}人` : `${max}人まで`);
  else if (price.max_quantity != null && personUnits.has(price.billable_unit)) note.push(`${price.max_quantity}人まで`);
  const raw = prices.map(p => p.conditions?.notes || '').join(' ');
  const floor = raw.match(/月最低([\d,]+)円/);
  if (floor) note.push(`最低月額${number.format(Number(floor[1].replaceAll(',', '')))}円`);
  const usdFloor = raw.match(/最低月次請求US\$([\d.]+)/);
  if (usdFloor) note.push(`最低月額USD ${usdFloor[1]}`);
  if (/自動作成|Full・AI/.test(raw) && /別見積/.test(raw)) note.push('自動作成プランは個別見積もり');
  return [...new Set(note)].join(' · ');
}

export function summarizePrice(prices = [], pricing) {
  if (pricing?.status === 'disputed') return fallback(prices, pricing);
  const current = prices.filter(p => p.current_evidence_role === 'accepted' && p.amount_status === 'known' && /^[A-Z]{3}$/.test(p.currency || '') && Number.isFinite(amount(p)) && !['optional', 'scenario_dependent'].includes(p.requirement));
  const recurring = current.filter(p => recurringTypes.has(p.charge_type) && [1, 12].includes(p.recurrence_months) && !referenceOnly(p));
  // Group required base + per-person charges, but never add alternative plans.
  const groups = new Map();
  for (const price of recurring) {
    const key = JSON.stringify([price.plan_name, price.currency, price.recurrence_months]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(price);
  }
  const choices = [...groups.values()].sort((a, b) => {
    const annualA = a[0].recurrence_months === 12 || annualEquivalent(a[0]);
    const annualB = b[0].recurrence_months === 12 || annualEquivalent(b[0]);
    return Number(annualA) - Number(annualB) || a.reduce((n, p) => n + amount(p), 0) - b.reduce((n, p) => n + amount(p), 0);
  });
  const selected = choices[0];
  if (selected) {
    const first = selected[0];
    if (selected.every(p => amount(p) === 0)) {
      const cap = first.conditions?.max_staff_per_project;
      return {label: '無料プランあり', note: [cap != null ? `1プロジェクト${cap}人まで` : '', taxLabels[first.tax_status] || '', '有料プランの条件は詳細へ'].filter(Boolean).join(' · '), kind: 'free'};
    }
    const ordered = [...selected].sort((a, b) => Number(personUnits.has(a.billable_unit)) - Number(personUnits.has(b.billable_unit)));
    const label = (first.recurrence_months === 12 ? '年額' : '月額') + ordered.map(p => money(p) + from(p) + ' / ' + unit(p)).join(' ＋ ');
    const setupFees = current.filter(p => setupTypes.has(p.charge_type) && amount(p) > 0 && p.currency === first.currency);
    const setupNote = setupFees.length === 1 ? '初期費用' + money(setupFees[0]) + ' / ' + unit(setupFees[0]) : setupFees.length > 1 ? '初期費用は別途' : '';
    return {label, note: [conditions(ordered), setupNote].filter(Boolean).join(' · '), kind: 'published'};
  }
  const beta = current.find(p => p.charge_type === 'beta_access' && amount(p) === 0);
  if (beta) return {label: '無料β', note: '正式提供後の料金は未公開', kind: 'free'};
  const setup = current.find(p => setupTypes.has(p.charge_type) && amount(p) > 0);
  if (setup && !prices.some(p => recurringTypes.has(p.charge_type))) return {label: '初期費用' + money(setup) + from(setup), note: (/参考/.test(setup.plan_name + (setup.conditions?.notes || '')) ? '参考額 · ' : '') + '月額・保守費は個別見積もり', kind: 'published'};
  return fallback(prices, pricing);
}
