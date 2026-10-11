# Aqsh シフト競合調査 — 第6バッチ / 様式9・MFA・解約データ出力

2026年10月11日、公開一次資料の追加調査を登録。**50提供単位、1,664文書記録、188調査文書、88料金明細、ロゴ50製品、制度参照17件**。第7バッチでは8対象へ37記録を追加し、公式URL50件を点検しました。共通40項目の資料採用は524/2,000枠です。部分確認・提供予定を含み、実性能の点数ではありません。

## 最初に見るファイル

| ファイル | 用途 |
|---|---|
| [comparison.html](comparison.html) | ブラウザで開く比較・検索画面。今回追加調査のみの絞り込み、出典、最大4対象の比較 |
| [research.sqlite3](research.sqlite3) | 最新の正本DB。39テーブル・12ビュー |
| [第6バッチ調査報告](reports/Batch06_research_report.md) | 算式・管理者MFA・全量出力の追加確認、矛盾、残課題 |
| [DB_DESIGN.md](DB_DESIGN.md) | D1向け設計、履歴・出典・料金・最新判断の扱い |
| [d1/import.sql](d1/import.sql) | **空のD1へ初回登録**する全件SQL |
| [d1/schema.sql](d1/schema.sql) | スキーマのみ。import.sqlには同じスキーマも含む |
| [d1/queries.sql](d1/queries.sql) | Webアプリ向けの読み取りクエリ例 |
| [batches/B07-20261011.json](batches/B07-20261011.json) | 37記録、15出典取得、50公式URL点検、5課題進捗の入力データ |
| [batches/B06-20261011.json](batches/B06-20261011.json) | 新規130記録、分類訂正3、出典取得40、制度参照17、課題と進捗の入力データ |
| [reports/regulation_index.csv](reports/regulation_index.csv) | 行政資料・専門団体手引きの算式、除外、丸め、適用条件と出典 |
| [reports/logo_index.csv](reports/logo_index.csv) | 全50対象のロゴURL、公式掲載ページ、サービス／会社、確認日 |
| [reports/research_stats.json](reports/research_stats.json) | 詳細件数と対象別の追加数 |
| [archive/batch02-original.zip](archive/batch02-original.zip) | 元の88ファイルをそのまま保存した検証済みZIP |

元のExcel・CSV・JSON・SQLite・SQL・比較HTMLの旧版はZIPへ保存しています。同内容のExcel2個・HTML3個を含む旧パッケージの展開ファイルは整理し、ルートには最新のDBと画面を置きました。元資料の観測・出典・評価・料金は最新DBでも保持しています。

## 調査の読み方

- known/documentedは資料に記載された範囲の確認。実動作・対象契約・独立性能試験の合格とは異なります。
- 未調査、記載未確認、取得不可、非公開、矛盾を非対応へ置き換えません。部分確認や提供予定、地域・プランの限定を保持しています。
- 出典Webページの全文やスクリーンショットは未保存です。比較画面の検証画像はreportsに保存しています。ほすぴタッチの公開SLA PDFは原本を保存し、source_archivesにパス・SHA-256を記録しました。ロゴは公式のURLまたは埋め込みSVGのdata URLで保持します。未保存の本文ハッシュはNULLです。
- ロゴはサービス優先、会社を代替として選びます。brand_assetsとv_preferred_brand_assetsを使います。共用ブランド・親サービス・権利未確認は注記しています。
- 料金は通貨・税・プラン・追加機能・人数・契約期間を揃えて解釈してください。未知の金額はNULLで、0円に置換していません。
- 14件の独立試験シナリオ設計がありますが、実施結果は0件です。見積取得やログイン後のデモ操作も未実施です。
- 様式9の制度参照はregulationsへ独立登録しています。比較画面の「制度の参考算式・条件」から閲覧できます。制度の式が判明しても製品の実装が検証済みとは扱いません。

## D1へ登録する

生のSQLiteファイルではなく`d1/import.sql`を使います。SQLはCloudflare公式Wrangler 4.149.0で**ローカルD1への取り込みと全データの一致を検証済み**。遠隔D1の作成・登録・Web公開はまだ行っていません。

既存のデータがないD1を作り、実際のdatabase_idを指定したWrangler設定を用意してから実行します。

```sh
npx wrangler d1 create aqsh-shift-research
# 作成結果のIDを、Webアプリのwrangler.jsoncのd1_databasesに設定する
npx wrangler d1 execute aqsh-shift-research --remote --file d1/import.sql --config wrangler.jsonc
```

`d1/wrangler.local.jsonc`のIDはローカル検証専用のダミーです。遠隔用には実IDの別設定を使います。`import.sql`はスキーマも含むので、同じDBへschema.sqlを先に実行しません。既存D1への再適用ではなく、初回の空DB向けです。継続更新は追加バッチとバージョン付きmigrationに分けます。

ローカルの再確認例：

```sh
npx wrangler d1 execute aqsh-shift-research --local --persist-to /tmp/aqsh-d1-new-check --file d1/import.sql --config d1/wrangler.local.jsonc
```

## DBを再作成・継続調査する

Python 3の標準ライブラリで動きます。初期化は元ZIPから読み出し、既存DBを上書きしません。

```sh
python3 tools/research_db.py init --db /tmp/aqsh-rebuilt.sqlite3
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B03-20261011.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B04-20261011.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B05-20261011.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B06-20261011.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B07-20261011.json
python3 tools/research_db.py stats --db /tmp/aqsh-rebuilt.sqlite3
```

次の調査は新しいbatch_idのJSONを作り、ingestで追加します。同じID・同じ内容は何も追加せず、同じIDの内容変更は拒否します。バッチ内での登録失敗は全件ロールバックします。登録済みのバッチJSONを書き換えて再適用する運用にはしません。v3.0のローカルDBは、バッチ追加前にmigrateでv3.1へ更新します。分類訂正は元観測を保持した新しい観測と訂正記録として追加します。

新規バッチはB06と同じ`resolution_policy_version: 2`を指定します。後続調査でも以前の分類訂正による採用除外を保持する方式です。未指定の旧バッチは従来の方式で再作成し、過去の判断履歴を変更しません。制度参照は`regulations`配列で、出典キーとJSONの適用条件を指定して追加できます。製品の実装証拠への関連付けは別途確認した場合に限ります。

正本を更新した後の出力：

```sh
python3 tools/research_db.py export
python3 tools/research_db.py viewer
python3 tools/research_db.py verify
python3 tools/refresh_indexes.py
python3 -m unittest discover -s tools -p 'test_*.py' -v
```

verifyはSQL再取り込みによるデータ一致、外部キー、証拠と評価の範囲、最新判断を確認します。回帰検証は14件。全バッチの再作成、分類訂正の継承、制度参照と製品対応の分離、最低課金人数、サービスロゴ優先も含みます。画面検証は`tools/test_viewer.cjs`で、PlaywrightとChromeが必要です。静的な比較画面はDBから再生成するスナップショットです。

検証結果：[DB](reports/db_validation.json)、[ローカルD1](reports/d1_local_validation.json)、[画面](reports/viewer_validation.json)。優先度1の残課題：[priority_followups.csv](reports/priority_followups.csv)。

公開アプリとD1の配信手順は、ルートの [apps/web/README.md](../apps/web/README.md) と公開報告を参照してください。
