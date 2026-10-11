export const SITE = 'https://shift.aqsh.co.jp';
export const SITE_NAME = 'Aqsh シフトづくりサービス比較';
export const AS_OF = '2026年10月11日';
export const categoryInfo: Record<string,{name:string;intro:string;checks:string[]}> = {
 medical:{name:'医療・看護',intro:'夜勤、資格別の人数、病棟の兼務など、医療の勤務表には施設ごとの条件があります。医療向けの公開案内がある製品を集め、様式9の出力と計算根拠を分けて調査しています。',checks:['二交代・三交代と日跨ぎ夜勤の扱い','資格・職種別の配置と兼務の按分','様式9の対象年度、算式、実際の出力']},
 care:{name:'介護・福祉',intro:'特養、老健、グループホームでは、勤務形態や配置基準の数え方が異なります。介護向けの案内がある製品を集め、常勤換算の提供状況、対象サービス種別、帳票の範囲を確認します。',checks:['対象のサービス種別と雇用区分','常勤換算の分母・丸め・兼務','提供予定と現在利用できる機能の区別']},
 general:{name:'店舗・幅広い業種',intro:'希望の回収、複数店舗の調整、自動作成、勤怠連携まで、シフト管理の提供範囲は製品ごとに違います。業種横断の製品を、標準機能と追加プランの条件を含めて比較できます。',checks:['希望転記と勤務表自動作成の違い','複数拠点・勤怠を含む契約プラン','課金対象人数、最低料金、解約時の出力']},
 api:{name:'API・開発者向け',intro:'既存の業務システムにシフト最適化を組み込むためのAPIを調査しています。完成した管理画面を持つ製品とは区別し、入出力、結果状態、商用利用や提供段階を確認します。',checks:['入力制約と返却状態の定義','結果を別ロジックで検証する方法','商用再提供権、課金条件、β終了時の扱い']}
};
export const stateLabels: Record<string,string> = { documented:'資料で確認',disputed:'資料に不一致',planned:'提供予定',unknown:'記載未確認',known:'資料で確認',not_found:'記載未確認',not_researched:'未調査',inaccessible:'取得未完了' };
export const criterionLabels: Record<string,string> = {B01:'勤務表の自動割当',J05:'様式9の計算根拠',J06:'介護・福祉の配置基準',N02:'SSO・多要素認証',M08:'解約時の全量出力'};
export const methodLabels:Record<string,string>={vendor_document:'販売元資料',vendor_quote:'正式見積',synthetic_test:'合成データでの試験',demo:'実画面・デモ',public_document:'公開資料',independent_source:'利用者側の一次資料',unknown:'確認方法を検討中'};
export const safeUrl=(url:string)=>/^https:\/\//.test(url) ? url : undefined;

export const safeImage=(url:string|undefined)=>url && (url.startsWith('https://') || /^data:image\/(svg\+xml|png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(url)) ? url : undefined;
