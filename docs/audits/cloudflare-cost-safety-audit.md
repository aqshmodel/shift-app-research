# Cloudflare課金安全性監査 — シフト比較サイト

監査日: 2026-10-14 JST。基点はGitHub main `764fe3580e5a166f8257ead8ed428e7546ebbf11`。元の作業フォルダの未保存変更を保持し、独立コピーで修正した。アカウント全体の料金・私有サービス・取得ソースの証拠と棚卸しはローカルの非公開報告書に保存し、この公開リポジトリには含めない。

## 判定と本番の状態

シフト比較サイトには、HTMLでの無制限なD1アクセス、Binding欠落時のAPI制限省略、入力検証前の取得、HEADとGETの重複処理、DB呼び出し予算・停止フラグの欠如があった。公開コードにD1書き込み・Cron・Alarm・Queue・Workflows・無制限リトライは見つからない。

対策を実装・ローカル検証した。本番デプロイ、本番DB書き込み、本番サイト停止は行っていない。検証Workerには導入し、停止・復旧を確認した。本番の安全性が修正後の状態へ変わったとは扱わない。課金を完全に上限保証する仕組みはない。

## 棚卸し

|リソース|環境/アプリ|公開状態|課金方式|使用量/確認状態|リスク/既存防御|不足・対処|
|---|---|---|---|---|---|---|
|aqsh-shift-research Worker|本番/shift-app-research|稼働|requests・CPU|実稼働版と接続先をAPIで確認|中: APIのみ120回/分、CPU 1,000ms|HTML/API共通防御・停止・SQL予算を実装、本番未導入|
|aqsh-shift-research-staging Worker|検証/同上|稼働|requests・CPU|本番と別Worker/DBを確認|中: 同上|同上、検証へ導入し停止・復旧済み|
|aqsh-shift-research D1|本番/同上|公開経路から読取|走査行・書込行・容量|29,716,480 bytes、実測|中: 公開SQLはSELECTのみ|高走査SQLを修正、データ・構造は維持|
|aqsh-shift-research-staging D1|検証/同上|検証経路から読取|同上|29,716,480 bytes、実測|中: 検証でも同じ課金枠|SELECT4回だけで新旧比較、書込0|
|aqsh-shift Pages|本番/同上|独自ドメイン配信|Functions等の実行|RESEARCH Service Bindingを確認|中: HTTP Cache-ControlのみではDB削減を保証しない|既存プロキシを保持、動的no-store・snapshotキャッシュ|

## 原因と修正

|優先度|根拠|原因|実装|
|---|---|---|---|
|P1|`src/middleware.ts`、`src/pages/api/[...path].ts`|HTMLは無制限、APIもBinding/IP欠落で制限省略|共通ガード、設定欠落/失敗は503、拒否前D1なし|
|P1|`src/pages/index.astro`、`products/index.astro`、`compare.astro`|取得後の入力検証、エラー後の再取得|ルートへ入る前に検証、トップ内も取得前に検証|
|P1|`src/lib/repository.ts`、`src/lib/data.ts`|リクエスト全体の上限・停止状態なし|8呼出/12SQL、D1外の停止設定、DB非依存health|
|P1|`src/pages/api/[...path].ts`|HEADがGETを呼ぶ|公開版と索引の存在確認だけに変更|
|P2|`src/lib/evidence-query.mjs`|viewで全製品の判定を展開|対象キーで直接結合、同じ結果を維持|
|P2|`src/lib/repository.ts`|一覧ごとにjson_each走査、リクエストごとの重複取得|SQL抽出とsnapshot単位の完了データキャッシュ|
|P2|`wrangler.jsonc`|Logs無効、請求増加時のSQL情報が不足|1%抽出・定型メトリクス、監視CLIと手順書|
|P1|`scripts/deploy.mjs`|source自体で両DBが同一でも通る可能性|本番/検証分離、Account、Binding名/ID/DB名、制限Bindingとモードの検査|

## 改善の実測

既存検証DBに対してSELECTを4回、書き込み0、容量変更0。単回測定であり、負荷試験や統計的なレイテンシ比較ではない。

|処理|旧rows read|新rows read|返却行|旧SQL時間|新SQL時間|
|---|---:|---:|---:|---:|---:|
|出典10記録|6,676|277|10|6.3737ms|1.1444ms|
|50製品一覧|2,395|51|50|19.0200ms|35.9399ms|

一覧のcold取得は読み取り行数が約98%減った一方、JSON転送量が増えた。warm時は最新snapshot確認の2行だけになる。SQL本数だけでは料金を判定しない。D1料金の共通枠を既に超過していると仮定すると、100万回の出典SQLで約$6.676→$0.277、一覧SQLで約$2.395→$0.051の読取費になる。Workers・CPU・ログ費は別である。

## 検証と残件

- Node 34件、研究Python17件、Web Python36件、既存ブラウザ38件が成功。Astro型検査はエラー/警告0、ビルド成功。
- 出典結果は全50製品・実在項目・複数ページで旧viewと一致。検索、比較、料金、出典、5つのWebMCPツール、同意管理、モバイル表示を保持。
- ローカルの停止・復旧、入力/ページ上限、429、Binding欠落、SQL予算、HEAD、公開版更新とロールバックを確認。本番で停止・大量アクセスを行っていない。検証Workerでは停止時のHTML/APIが503、DB呼び出し/SQLが0、healthが200になり、通常モードへの復旧後に50製品とB62を確認した。
- 検証の実稼働でwarmキャッシュが2SQL→1SQLとなり、HEADが2SQLの存在確認だけになることを確認した。本番のIPヘッダーとService Binding経路、ログの実保存は本番導入後の少数確認が残る。請求集計の遅延上限は未確認。
- 監視CLIの定期起動・通知は未設定。アカウント標準の予算通知の確認と追加案は私有報告書に記録する。
- 各拠点のレート制限は分散アクセスの総量を止めない。D1直接操作、他Worker、既実行中の処理、キャッシュ済み応答にも限界がある。

[設計と料金影響](../operations/cloudflare-cost-guardrails.md)、[緊急対応](../runbooks/cloudflare-cost-incident.md)、ルート[開発ルール](../../AGENTS.md)を参照する。変更は公開データの更新を含まない。CIジョブ・有料資源を増やさず、既存Nodeテストへ安全検査を組み込む。

## 修正後コードの確認位置

共通ガードは `apps/web/src/middleware.ts:9` と `apps/web/src/lib/cost-guard.mjs:52`、入力前取得の解消は `apps/web/src/pages/index.astro:9`、予算は `apps/web/src/lib/repository.ts:39`、HEADは同 `:169`、出典SQLは `apps/web/src/lib/evidence-query.mjs:3`、接続先検査は `apps/web/scripts/deploy.mjs:6`。行番号はこの作業枝の実装時点を示す。

検証Workerの通常復旧版は `eddb1b7e-a86d-4d67-bd63-3116eacddbdf`。停止テスト版 `84cd0530-0ff7-45e7-becc-7a0578cac0fd` の後に通常へ戻した。本番の基点版は `e7fce1ad-456c-42c3-a007-3456cd8c4f29` で維持した。
