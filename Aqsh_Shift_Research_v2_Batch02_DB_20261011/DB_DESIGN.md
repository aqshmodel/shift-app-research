# D1向けDB設計（v3.1）

このDBは競合調査の根拠と判断を管理する。シフトを作成する業務DBではない。SQLiteをローカルの編集・検証用として採用し、Cloudflare D1にはSQLで取り込む。

## 製品と提供範囲

`products`は製品名、`offerings`は版・モジュール・販売地域・導入方式などの提供単位。機能観測、評価、プラン、課題は`offering_id`に結び付く。将来一製品に複数の版が増えても評価を混ぜない。現在は50製品・50提供単位。販売地域が不明なものは推定で埋めていない。

`market_region`のdomestic/overseasは元台帳の調査区分。`USxx`という製品IDは米国を意味しない。`product_aliases`には検索用の別名を登録し、NFKC正規化とcasefoldを用いる。

## 観測、証拠、最新判断

`observations`は設問に対する資料の観測。`observation_evidence`を通じて`source_revisions`の取得日時・該当箇所へ辿れる。一つの観測に複数の出典を付けられる。

`value_state`（既知、未調査、記載未確認、非公開、取得不可、矛盾）と`support_status`（対応、部分確認、非対応、予定、未知）は別概念。資料に書かれていたことを`known/documented`としても、実動作や性能の合格とは扱わない。提供予定は`planned`、プラン・地域・版の限定は要約・`limitations`・`applicability_json`に保存する。設問全体を確認していない新規機能観測は原則`limited`。

`record_category`は文書観測、料金明細の補助観測、未調査枠を区別する。画面の調査件数は文書観測のユニークな`observation_id`だけを数える。生の観測行数や証拠リンク行数を調査件数として使わない。検索用`summary_ja`はJSONからの生成列で、二重編集による不一致を防ぐ。

`assessment_resolutions`は提供単位×設問に対する採用判断の履歴。更新・削除は禁止し、新しい判断を追記する。最新は`as_of_date`、同日なら明示的な`resolution_order`で決まる。元DBのrowid順を明示的な順序に移行したため、SQL取り込み順が変わっても同日の判断が入れ替わらない。順序はオフライン取り込み時に一つの書き込み処理で採番する。並行編集APIを追加する場合は競合処理と採番方式を設計する。

`current_assessments`は最新判断への参照。履歴追記時にトリガーが更新する。設問・提供単位が異なる観測を判断に結び付ける操作はトリガーで拒否する。今回未確認だっただけでは、以前に採用された根拠を自動で非対応へ変更しない。新しい既知の観測は最新の採用根拠とし、古い根拠はcontextまたは履歴として残す。現在の比較セルにはaccepted/conflictingを表示し、contextは詳細画面で確認する。

## 出典の重複と取得範囲

`sources`は元の出典IDを保存する。`source_documents`は正規化URLがユニークな文書識別子。正規化ではフラグメント、末尾スラッシュ、一部の既知の追跡・言語UIパラメータを除去する。意味を持つ未知のクエリは保持し、別ドメインやhttp/httpsを勝手に同一視しない。

取得回ごとのURLとタイトルは`source_revisions.retrieval_url/title_at_retrieval`に保存。過去の出典ID、取得履歴、観測は削除しない。Web全文・スクリーンショットは保存しておらず、ハッシュ未取得はNULL。取得した公開PDF原本はsource_archivesに相対パス、SHA-256、形式、ページ数を保存する。`source_method_attributes`に本文確認・Web参照と全文未保存を記録する。本文取得失敗は`retrieval_checks`に残す。検索抜粋だけで現行仕様を確定しない。

## 分類の訂正

classification_correctionsは元観測と訂正先観測、理由、バッチ、日付を結び付ける。元の観測・本文取得日は書き換えず、訂正先へ同じ取得履歴を引き継ぐ。supersedes_observation_idも保持する。元設問の最新判断で誤分類をrejectedにし、他に採用可能な根拠がなければ未確定へ戻す。元資料の再取得を行っていない訂正を新しいWeb確認とは扱わない。

新しい調査バッチは`resolution_policy_version: 2`を指定し、元設問の以前のrejectedを後続判断でも保持する。旧バッチの未指定は従来方式として再作成し、過去の判断履歴を変更しない。既知の根拠を追加しても、誤分類した根拠がcontextへ戻らない。

## ロゴ

brand_assetsはproduct_idに対する履歴付きロゴ。サービス／会社、ブランド名、画像URL、公式掲載元、出典の取得履歴、確認状態、日付、優先順位、画像形式、権利確認状態を保存する。ロゴを持つことと転載権の確認は別で、権利未確認をpermittedにしない。

v_preferred_brand_assetsはverifiedのみを選び、サービスを会社より優先、その後selection_rank、確認日、IDで一意に選ぶ。URLは外部のHTTP/HTTPSと、公式の埋め込みSVGを保存したdata URL。SVGは画像として表示しHTMLへ直接挿入しない。HTTPのみの1件は公開HTTPSアプリでの混在コンテンツ対応が残る。候補・取得不可を自動表示の優先対象にしない。

将来専用サービスロゴが見つかった場合は新しいasset_idを追加する。会社ロゴを上書きして履歴を消す必要はない。閲覧側は画像取得失敗でも製品名を残す。brand_assetsの更新を管理APIへ公開する場合は、許可された画像形式・プロトコルと公開掲載元を確認する。

## 料金と残課題

`plans`と`price_components`で初期費用、月額、追加機能、人数帯、課金単位、支払周期、最低契約、通貨、税込/税別を分ける。金額はDecimal文字列で保存。未知・見積・矛盾はNULLにし、0円への置換をCHECK制約で拒否する。年契約の月額相当や「から」の価格を`conditions_json`に残す。複数プランの明細を足して総額にしない。費用試算は対象条件と証拠を揃えてから別処理で行う。

min_billable_units、min_quantity/max_quantity、quantity_definitionに課金人数と人数上限を保存する。v_price_detailsには観測バッチと最新判断での根拠の役割も表示し、以前の料金を一律に現行額と扱わない。

現在の料金表は時点付きの明細であり、将来のすべての契約の現行価格を保証しない。新価格への更新は新しいプラン・観測・明細と有効期間で記録する。同一プランの複数時点を集計する画面を作る場合は、価格時点の選択を必須にする。

`research_tasks`に優先度、必要な確認方法、最終確認日を追加。公開資料、販売元資料、見積、デモ、合成データ試験、利用者側の一次情報を分ける。資料が一つ見つかっただけで広い設問を完了にしない。既存課題の進捗は`research_task_updates`に保存する。

## Webアプリでの読み方

`regulations`には行政資料と専門団体の手引きを独立して登録する。`authority_type`、版、取得履歴への`revision_id`と、`applicability_json`の式・入力・除外・丸め・対象条件・ページ位置を保持する。適用日を資料から確定できない場合はNULLにする。参考式は実行コードではなく、計算エンジンへの入力前に正式通知と届出区分の確認が必要な参照データである。

第6バッチは様式9の17件を追加した。JSONには`metric`、`formula`、`rounding`等と`verification_stage: documented`、`vendor_implementation_verified: false`を保存する。複数式は`formulas`、丸めの別資料は`rounding_reference_id`で参照する。`regulation_support`への製品関連付けは0件。制度資料の存在から製品対応を自動判定しない。CSV索引と比較画面にも出典・留保を表示する。

- 一覧：`v_product_catalog`。最大50件、`offering_id`をカーソルにして安定したページ送り。
- 比較：`v_current40`を2〜4提供単位で絞り込み。採用枠数は資料の充足であり品質点数ではない。
- 詳細：`v_observations_with_sources`。観測IDでまとめ、複数の根拠リンクを保持。
- 最新根拠：`v_current_observations`のaccepted/conflicting。履歴・contextは分けて表示。
- 料金：`v_price_details`。期間、地域、追加機能、未知金額、根拠の役割を表示。
- ロゴ：`v_preferred_brand_assets`をproductsへLEFT JOIN。サービス優先、会社を代替に使う。
- 調査待ち：`v_open_questions`。優先度・必要な確認方法で絞り込む。
- 制度参照：`regulations`と`source_revisions`をJOIN。原則の式と製品に対する観測を別に返す。

代表クエリは[d1/queries.sql](d1/queries.sql)。Workers側ではプリペアドステートメントへ値をbindし、任意SQL・任意の列名や並び順を公開APIに渡さない。閲覧アプリは読み取りを基本にし、調査編集・取り込みは別の管理経路に置く。

外部キー・提供単位・取得日・バッチ・料金プラン・課題キューの索引を追加した。現在の小規模データでは日本語の部分一致をLIKEで扱えるが、先頭ワイルドカードには通常の文字索引が効かない。件数拡大時には検索索引と分かち書きを検討する。FTS5は今回導入していない。

## D1への取り込み

[d1/import.sql](d1/import.sql)は**空のDB向け**。全テーブル・索引・ビュー・トリガーとデータを含む。既存DBを消すDROP、外部キー無効化、明示的なBEGIN/COMMITは含めない。外部キーの親から順に、一文一行のINSERTを出力する。自己参照する製品・観測は参照先を先に登録する。生成列と派生する最新ポインタには直接INSERTしない。

Cloudflareの公式資料：[SQLによる移行](https://developers.cloudflare.com/d1/best-practices/import-export-data/)、[外部キー](https://developers.cloudflare.com/d1/sql-api/foreign-keys/)、[生成列](https://developers.cloudflare.com/d1/reference/generated-columns/)、[制限](https://developers.cloudflare.com/d1/platform/limits/)。D1は生のSQLiteファイルを直接取り込めない。SQLite互換のSQLと、生成列・外部キーを利用する。今回のINSERTは全て100KB未満。FTSの仮想テーブルを含まないので、D1のエクスポート制約を避けられる。

遠隔D1へ初回登録した後の継続更新では、この全件SQLを再実行しない。スキーマはバージョン付きmigration、新規観測・判断・出典は追加バッチとして適用する。最新ポインタは判断追記時に更新される。
