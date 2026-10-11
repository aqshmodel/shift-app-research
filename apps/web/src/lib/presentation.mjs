// Display wording and visibility only. Research data and AI responses retain the original records.
const wording = [
  ['疲労評価の根拠', '疲労評価の方法'],
  ['矛盾原因の根拠提示', '条件の矛盾を説明する機能'],
  ['職員満足・定着等の根拠', '職員満足・定着等に関する資料'],
  ['ルール根拠の区分', 'ルールの参照資料'],
  ['計算根拠', '計算方法'],
  ['過去の採用根拠', '過去に掲載した資料'],
  ['以前の根拠', '以前の確認資料'],
  ['最適化結果の根拠全体', '最適化結果の詳しい説明'],
  ['契約根拠', '契約上の取り決め'],
  ['この設問の根拠', 'この項目の確認資料'],
  ['独立した検算器の根拠にはしない', '独立した検算器を備えることの確認には使わない'],
  ['プラン・地域・版の留保は本文・limitations参照', '対象プラン・地域・製品の版は、以下の説明と注意点をご確認ください。'],
];
export function displayText(value) {
  return wording.reduce((text, [before, after]) => text.replaceAll(before, after), String(value ?? ''));
}
export const isVisibleAssessment = assessment => Boolean(assessment && ['documented', 'planned', 'disputed'].includes(assessment.status));

const groups = [
  {id: 'overview', name: 'サービスの概要', prefixes: ['A']},
  {id: 'scheduling', name: '勤務表の作成・調整', prefixes: ['B', 'F', 'G', 'H']},
  {id: 'staffing', name: '勤務条件・人員配置', prefixes: ['C', 'D', 'E', 'I']},
  {id: 'medical-care', name: '医療・介護の帳票', prefixes: ['J']},
  {id: 'integration', name: '操作・データ連携', prefixes: ['K', 'L', 'M', 'R']},
  {id: 'security', name: 'セキュリティ・運用', prefixes: ['N', 'O']},
  {id: 'pricing-cases', name: '料金・導入事例', prefixes: ['P', 'Q', 'T']},
];
export function assessmentGroups(assessments) {
  const visible = assessments.filter(isVisibleAssessment);
  return groups.map(group => ({...group, items: visible.filter(a => group.prefixes.includes(a.id[0]))})).filter(group => group.items.length);
}
