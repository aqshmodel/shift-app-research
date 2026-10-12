# Aqsh シフト競合調査 — 第24バッチまで / 未完了課題の継続調査

2026年10月12日UTC、公開一次資料の追加調査を登録。**50提供単位、2,080文書記録、304調査文書、118料金明細、ロゴ50製品、制度参照17件**。第24バッチ（C03T01）はSHIFTEEの6公式資料から6部分確認を追加。夜勤明け・初回/月次工程・店舗表示・希望の再提出と2導入事例の対象・分母を記録し、4課題を未着手から確認中へ移動、完了0。未着手670、確認中230、停止78、未完了978、優先度1未完了29。共通資料採用598/2,000は課題完了数と別。2026年10月13日、第24バッチまで本番へ反映し、全件照合を完了しました。

## 最初に見るファイル

| ファイル | 用途 |
|---|---|
| [comparison.html](comparison.html) | ブラウザで開く比較・検索画面。今回追加調査のみの絞り込み、出典、最大4対象の比較 |
| [research.sqlite3](research.sqlite3) | 最新の正本DB。39テーブル・12ビュー |
| [第24バッチ調査報告](reports/Batch24_research_report.md) | SHIFTEEの夜勤明け・店舗表示・希望収集と用途・分母を区別した事例 |
| [第23バッチ調査報告](reports/Batch23_research_report.md) | ShiftWizardの一般/製品支援時間・ケース運用・未解決とC02包括検証 |
| [第22バッチ調査報告](reports/Batch22_research_report.md) | RosterElfの席・SMS・Flex未確認と変更時期の相反 |
| [第21バッチ調査報告](reports/Batch21_research_report.md) | Timefoldの支援・利用単位・既定契約と請求条件、完了条件の不足 |
| [第20バッチ調査報告](reports/Batch20_research_report.md) | Rotageekの比較表矛盾・支援窓口と権限・法人料金の未確認範囲 |
| [第19バッチ調査報告](reports/Batch19_research_report.md) | Smartlinxの利用条件・無料取得表示・継続支援と法人契約の未確認範囲 |
| [第18バッチ調査報告](reports/Batch18_research_report.md) | 手動割当・一括承認、自己割当段階と制限、Mobile無料とManager契約、支援の未確認範囲 |
| [第17バッチ調査報告](reports/Batch17_research_report.md) | QGendaの対象別説明・全社支援・Web規約と製品契約の区別・重複除外 |
| [第16バッチ調査報告](reports/Batch16_research_report.md) | Smart Squareの周期型勤務・契約と支援の未確認範囲・2事例の測定条件 |
| [第15バッチ調査報告](reports/Batch15_research_report.md) | 料金・支援契約、旧版資料、AI解析と保存先、公開APIベータの境界と未確認事項 |
| [第14バッチ調査報告](reports/Batch14_research_report.md) | 顧客認証・権限、支援の契約範囲、プレビューと実装済みの区分、個別開発の事例 |
| [第13バッチ調査報告](reports/Batch13_research_report.md) | 国内4サービスの解約・データ搬出・削除期限、任意支援費、店舗間機能・顧客認証の範囲 |
| [第12バッチ調査報告](reports/Batch12_research_report.md) | 支払・解約、支援の追加費、削除・バックアップ・出力・履歴、VXの参考価格と製品境界 |
| [第11バッチ調査報告](reports/Batch11_research_report.md) | ライセンス・保守、販売チャネル、顧客認証と社内対策、需要作成アドオン、共通規約の適用範囲 |
| [第10バッチ調査報告](reports/Batch10_research_report.md) | 課金主体、外部LLM・退出データ、勤怠連携のファイル操作と別契約、権限・通知・受付時間、残課題 |
| [第8バッチ調査報告](reports/Batch08_research_report.md) | 公開・通知、APIの未適用制約、病院側の試行報告、料金・認証・解約条件、残課題 |
| [第9バッチ追補](reports/Batch09_research_report.md) | Nafty提供前表示・予定仕様、課題進捗2件の訂正、最新の検証状況 |
| [DB_DESIGN.md](DB_DESIGN.md) | D1向け設計、履歴・出典・料金・最新判断の扱い |
| [d1/import.sql](d1/import.sql) | **空のD1へ初回登録**する全件SQL |
| [d1/schema.sql](d1/schema.sql) | スキーマのみ。import.sqlには同じスキーマも含む |
| [d1/queries.sql](d1/queries.sql) | Webアプリ向けの読み取りクエリ例 |
| [batches/B07-20261011.json](batches/B07-20261011.json) | 37記録、15出典取得、50公式URL点検、5課題進捗の入力データ |
| [batches/B08-20261012.json](batches/B08-20261012.json) | 51記録、分類訂正1件、24出典取得、12課題進捗・追加2課題の入力データ |
| [batches/B09-20261012.json](batches/B09-20261012.json) | Naftyの3記録・1出典取得、課題進捗2件の訂正と提供時期の再確認 |
| [batches/B10-20261012.json](batches/B10-20261012.json) | 5サービス35記録、8出典取得、Clairviaの取得結果、追加課題3件 |
| [batches/B11-20261012.json](batches/B11-20261012.json) | 6サービス47記録、12出典取得、認証に転送された資料の取得結果、追加課題4件 |
| [batches/B12-20261012.json](batches/B12-20261012.json) | 3サービス62記録・24料金明細、12出典取得、PDF3原本、追加課題4件 |
| [batches/B13-20261012.json](batches/B13-20261012.json) | 4サービス52記録・4料金明細、15出典取得、追加課題5件、B12までの原本・履歴を保持 |
| [batches/B14-20261012.json](batches/B14-20261012.json) | 4サービス45記録、16出典取得、PDF1原本、追加課題5件、既存の原本・履歴を保持 |
| [batches/B21-20261012.json](batches/B21-20261012.json) | Timefoldの8記録・4出典取得・3課題更新、料金・完了課題なし |
| [batches/B20-20261012.json](batches/B20-20261012.json) | Rotageekの9記録・7出典取得・6課題更新、料金・完了課題なし |
| [batches/B19-20261012.json](batches/B19-20261012.json) | Smartlinxの5記録・4出典取得・5課題更新、料金と完了課題は増やさない |
| [batches/B15-20261012.json](batches/B15-20261012.json) | 3サービス53記録・2料金明細、16出典取得、公開OpenAPI仕様の照合、追加課題4件 |
| [batches/B06-20261011.json](batches/B06-20261011.json) | 新規130記録、分類訂正3、出典取得40、制度参照17、課題と進捗の入力データ |
| [reports/regulation_index.csv](reports/regulation_index.csv) | 行政資料・専門団体手引きの算式、除外、丸め、適用条件と出典 |
| [reports/logo_index.csv](reports/logo_index.csv) | 全50対象のロゴURL、公式掲載ページ、サービス／会社、確認日 |
| [reports/research_stats.json](reports/research_stats.json) | 詳細件数と対象別の追加数 |
| [archive/batch02-original.zip](archive/batch02-original.zip) | 元の88ファイルをそのまま保存した検証済みZIP |

元のExcel・CSV・JSON・SQLite・SQL・比較HTMLの旧版はZIPへ保存しています。同内容のExcel2個・HTML3個を含む旧パッケージの展開ファイルは整理し、ルートには最新のDBと画面を置きました。元資料の観測・出典・評価・料金は最新DBでも保持しています。

## 調査の読み方

- known/documentedは資料に記載された範囲の確認。実動作・対象契約・独立性能試験の合格とは異なります。
- 未調査、記載未確認、取得不可、非公開、矛盾を非対応へ置き換えません。部分確認や提供予定、地域・プランの限定を保持しています。
- 出典Webページの全文やスクリーンショットは未保存です。比較画面の検証画像はreportsに保存しています。ほすぴタッチの公開SLA、お助けマンの利用規約・Day/TimeのセキュリティPDFは原本を保存し、source_archivesにパス・SHA-256を記録しました。ロゴは公式のURLまたは埋め込みSVGのdata URLで保持します。未保存の本文ハッシュはNULLです。
- ロゴはサービス優先、会社を代替として選びます。brand_assetsとv_preferred_brand_assetsを使います。共用ブランド・親サービス・権利未確認は注記しています。
- 料金は通貨・税・プラン・追加機能・人数・契約期間を揃えて解釈してください。未知の金額はNULLで、0円に置換していません。
- 14件の独立試験シナリオ設計がありますが、実施結果は0件です。見積取得やログイン後のデモ操作も未実施です。
- 様式9の制度参照はregulationsへ独立登録しています。比較画面の「制度の参考算式・条件」から閲覧できます。制度の式が判明しても製品の実装が検証済みとは扱いません。

## D1へ登録する

初回登録には、生のSQLiteファイルではなく`d1/import.sql`を使います。既存D1はこのSQLを再投入せず、直前のエクスポートから生成した差分SQLで更新します。第24バッチまでの本番・検証D1は全39調査テーブルを正本と照合しました。最新の反映状況は [本番反映記録](../docs/research-b24-publication-20261013.md)、研究作成時点の検証は [B12検証記録](reports/batch12_validation.json) を参照してください。

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
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B08-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B09-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B10-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B11-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B12-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B13-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B14-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B15-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B16-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B17-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B18-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B19-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B20-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B21-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B22-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B23-20261012.json
python3 tools/research_db.py ingest --db /tmp/aqsh-rebuilt.sqlite3 --batch batches/B24-20261012.json
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

第22バッチの検証：[結果](reports/batch22_validation.json)、[完了条件](reports/batch22_completion_review.json)、[8出典](reports/batch22_source_verification.json)。C02T05はShiftWizard支援時間の追加照合と包括検証・引き継ぎを予定。

C02の最終結果：[B23包括検証](reports/batch23_validation.json)、[全38ケース](reports/batch23_browser_validation.json)、[サイクル履歴](reports/cycle02_history_preservation.json)。現在は停止、次サイクルの開始なし。

第24バッチの検証：[結果](reports/batch24_validation.json)、[完了条件](reports/batch24_completion_review.json)、[出典](reports/batch24_source_verification.json)。C03T02は親の指示待ち。T05にも追加調査を含め包括検証と引き継ぎ後に停止。
