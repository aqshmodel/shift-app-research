# 第5バッチ調査報告 — 条件・制約・運用・APIの深掘り

調査日：2026-10-11。バッチ：B05-20261011。9対象へ新規198件、既存分類の訂正1件、参考料金5件を登録しました。出典取得履歴は38件追加。累計は**50提供単位、1,494文書記録、88料金明細、ロゴ50件**です。新規198件は196件が記載範囲の確認、2件が資料内・資料間の不一致です。独立した動作・性能試験は未実施です。

## 今回の追加範囲

| 対象 | 新規文書記録 | 深掘りした内容 |
|---|---:|---|
| Shiftmation | 6 | 1〜4週の指定期間、CSV連携 |
| アールシフト | 9 | 参考料金、有償体験、ISMS認証範囲 |
| Airシフト | 11 | 打刻CSVの除外、配布形式、人件費の閲覧権限 |
| QGenda Nurse & Staff Scheduling | 5 | 連邦医療向け認証説明、SAML、支援担当の操作制限 |
| Rotageek | 15 | 公開OpenAPI、職員同期、退職日変更、Webhook |
| Connecteam Operations Hub Expert | 33 | 自動割当と手動配置・応募の制約差、方針・勤務時間帯 |
| Quinyx | 49 | 有効化、必須／希望、公平性、日跨ぎ、警告 |
| When I Work | 40 | OpenShift割当、業務日起点、時間外、API、SLA |
| Planday | 30 | API認可、操作スコープ、制限、変更履歴、プラン境界 |

アールシフトには新規9件に加えて分類訂正1件があります。料金5件は文書観測とは別のprice_componentsへ登録しています。新規対象を増やすより、既存サービスの具体的な適用条件を公開ヘルプ・API仕様で補う調査を行いました。

## 導入判断に影響する確認結果

### Quinyx：設定済みでも、自動割当に使われるとは限らない

契約テンプレートの労働ルールと勤務可否は、導入担当が有効化していなければAuto Assignで考慮されません。ルールごとに必須／希望を分け、希望条件の重みや追加ルールはベンダーが設定します。自動割当の規則と、手動編集・公開時の警告／停止の設定は別に記録しました。[労働ルール](https://help.quinyx.com/help-centre/docs/labor-rules-in-auto-assign)、[勤務可否](https://help.quinyx.com/help-centre/docs/availability-within-auto-assign)、[手動操作の検査設定](https://help.quinyx.com/help-centre/docs/schedule-compliance-settings)。

公平性には契約時間に対する充足率を揃える規則があり、単純な勤務数の均等化と区別できます。勤務の開始週で週時間を集計する一方、日上限では日跨ぎ時間を両日に分けるため、境界試験が必要です。実行完了でも未配置や警告が残り得ます。以前に本文を取得できなかった資料読解の課題B03-TASK007は完了し、実動作の合成試験は新しい課題として残しました。[Auto Assign](https://help.quinyx.com/help-centre/docs/auto-assign)、[完了時の警告](https://help.quinyx.com/help-centre/docs/auto-schedule-and-auto-assign-warnings)。

### Connecteam：自動割当、手動配置、本人応募で制約の効き方が異なる

Auto Assignは用意した未割当勤務へ職員を配置します。勤務希望は他のルールより優先せず、割当できない勤務は未割当のまま残します。勤務不可・適格性の考慮には実行前の切替があります。前回表との類似性や保留中の応募考慮は今後の開発項目と書かれており、提供済みの変更最小化機能とは判定していません。[自動割当ヘルプ](https://help.connecteam.com/en/articles/8886939-automatically-assign-shifts-in-connecteam)。

会社方針と個人の例外ルール、勤務表全体のSchedule Limitationsを分けました。自動割当では勤務ルールを守る説明がある一方、手動配置は警告を伴って可能な範囲があります。本人のOpen Shift応募には超過を阻止する設定があります。通常勤務時間帯の変更ログ、日跨ぎ入力、プランごとの方針数も追加しました。[ルール・応募数](https://help.connecteam.com/en/articles/12829136-starting-guide-to-scheduling-rules-and-shift-quotas)、[通常勤務時間帯](https://help.connecteam.com/en/articles/15013084-how-to-set-regular-working-hours-for-employees)。

### When I Work：割当対象・業務日起点・時間外表示を区別

Auto Assignは週表示の未公開OpenShiftsを対象とし、勤務枠を先に用意します。Position／Tag、承認済み休暇などを使い、週末優先では金曜17時以降から日曜末までを対象にします。最低休息、連勤、週勤務日数の設定範囲も登録しました。[自動割当](https://help.wheniwork.com/articles/auto-assign-shifts/)、[勤務ルール](https://help.wheniwork.com/articles/scheduling-rules-reference/)。

日跨ぎ勤務の時間外判定は時間を両日に分けますが、連勤・勤務日数の判定は開始日を使います。交換時の残業バッジは超過が増える場合だけの表示で、バッジがないことだけでは全条件を満たした証拠になりません。サービス自身はSLAを提供しないと明記し、基盤提供者の99.9%保証と区別しました。[時間外の表示](https://help.wheniwork.com/articles/overtime-visibility/)、[セキュリティ説明](https://wheniwork.com/security)。公開APIの勤務スキーマで公開・通知・確認日時等も確認しましたが、本番のAPI接続はしていません。[公開API](https://apidocs.wheniwork.com/external/index.html)。

### Planday：APIは操作別スコープとプラン境界がある

APIはPlus／Pro／Enterprise向けと案内されていますが、部署別給与識別子の操作はProを必要とします。管理者の認可解除・無効化による連携停止、職員マスターと機微項目の専用権限、勤務変更履歴も登録しました。給与向け勤務承認APIは打刻を考慮しないため、予定の承認を実績照合済みと扱っていません。[Open API利用条件](https://help.planday.com/en/articles/30402-how-to-use-open-api-to-integrate-with-planday)、[HRガイド](https://developer.planday.com/guides/hr-guide/)、[API変更履歴](https://openapi.planday.com/gettingstarted/release_notes/)。

制限表はポータル20要求／秒・750／分、Client ID100／秒・2000／分としますが、同じページの例はポータル10要求／秒を使っています。この差はdisputedとして残し、現行値を決めていません。HTTP429と制限ヘッダー、ポータルとClient ID双方のカウンター消費は別の記載として保存しました。[Rate limiting](https://developer.planday.com/gettingstarted/rate-limiting/)。

### Rotageek：更新時の保護とWebhookの具体仕様

公開OpenAPIから職員・所属・スキル・勤務可否の更新、適用日別の雇用区分・賃金、監査ログの抽出範囲を確認しました。退職日を変更する前に将来勤務・休暇への影響をプレビューし、変更時に空き枠への変換または削除を指定する操作があります。勤務削除は権限や未確定勤怠を検査し、画面と同じ業務処理・通知へ渡すと説明されます。[OpenAPI JSON](https://publicapi.rotageek.com/swagger/v1/swagger.json)。

Webhookは8種類のイベントを定義し、通知後にAPIで最新データを取得する方式です。HMAC-SHA256署名の仕様も確認しました。ただし秘密長は案内ページが8〜256文字、現行OpenAPIが8〜128文字で異なります。この互換性上の不一致をdisputedで保存しました。再送・順序・重複排除の保証は未確定です。[Webhook案内](https://publicapi.rotageek.com/webhooks.html)。

### 国内サービス：新しい提供時点と通常出力の限界

Shiftmationは2026-07-30に、1〜4週間の任意期間で自動作成し、勤務時間・勤務回数を期間通算で判定する指定期間モードを提供開始しました。4週間8休の確認を説明していますが、前周期の夜勤・休息の引継ぎは合成試験で確認する課題です。Cares Connect連携と勤怠向けCSVの列設定も追加しました。[指定期間モード](https://shiftmation.com/release/20260730/)、[Cares Connect連携](https://shiftmation.com/release/20260804/)。

Airシフトは打刻CSVから不正打刻・未打刻を除外します。確定シフトの共有対象、PDF／Excelのレイアウトと編集制限、人件費画面への一般権限アクセスの制限を確認しました。Airワーク 給与支払への概算人件費の受渡しはCSVダウンロード・アップロードであり、リアルタイムAPIとは扱っていません。[打刻CSV](https://faq.airshift.jp/hc/ja/articles/360021664651)、[配布・印刷](https://faq.airshift.jp/hc/ja/articles/42967195119129)、[閲覧制限](https://faq.airshift.jp/hc/ja/articles/360027255151)、[標準連携](https://airregi.jp/shift/function/integration/)。

アールシフトの月額10万円からという欄には2024年2月の注記があります。月額下限1件と規模・業種付きの参考例4件を登録しましたが、現行の見積としては使えません。初期費用は別見積で、税・最低期間も未確認です。有償体験の最大2店舗・最大45日、顧客の設定作業、追加支援費用の可能性を保持しました。[公式費用欄](https://www.rshift.jp/)、[体験条件](https://www.rshift.jp/trial_rule.php)。ISMSは登録番号・登録日・対象範囲まで保存し、認証機関の登録簿や有効期限の独立照合はしていません。[認証公表](https://www.rshift.jp/news/20260422_002.php)。

## 訂正・未解消の差

- アールシフトのB04-OBS0124は通常の勤務表・設定出力を解約時全量出力M08に分類していました。M02へ訂正し、元観測・取得履歴を保持しました。M08は未確定へ戻しています。CSV出力だけでは、解約時の希望・ルール・履歴の持出し、費用、期限は確定しません。
- RosterLab米国の15／20ドルと、When I Workの料金カード／FAQの複数拠点・勤怠含有の差を再確認しました。不一致が残るため新しい重複観測や料金行を増やさず、既存課題の進捗へ記録しました。
- 新たな不一致はPlandayの秒間API制限とRotageekのWebhook秘密長の2件です。公開資料の一方を便宜的に正解としていません。

共通40項目の資料採用は477から508／2,000枠へ増えました。32枠が増え、分類訂正で1枠を未確定へ戻した純増31枠です。広い設問に対する部分確認や提供予定を含むため、508件が機能合格したという意味ではありません。新旧の記載内容が変わった共通セルは46件です。[差分CSV](batch05_coverage_changes.csv)、[集計](batch05_coverage_change.json)。

## 調査手段と残課題

公式ヘルプ、公式API仕様、公式リリース・料金・認証案内の本文を使用しました。Quinyxの一部、When I WorkのRedoc、Shiftmationの429応答ページはブラウザの公開本文で補完しました。RotageekのOpenAPIは通常のHTTPSで公開JSONを取得しました。検索抜粋だけを新規根拠にせず、ログイン、アカウント作成、営業連絡、業務APIの書込は行っていません。今回のWeb／JSON原文全文は配布ファイルに保存していません。[出典取得履歴](source_index.csv)。

残る課題は943件中942件が未完了です。多くは公開記載だけでは確定できない広い設問です。今回、実動作の強制力、公平性、28日周期境界、API仕様の不一致、現行見積など10件の具体的な追試・確認課題を追加しました。独立試験シナリオ設計は14件、実施結果は0件です。

次は医療・福祉に固有の配置基準・様式9算式、解約時出力、管理者MFAの必須化、通知の到達・再通知、最低休息を跨ぐ境界試験を優先できます。公開資料、正式契約・見積、デモ、合成試験で得る情報を分け、未確認を非対応や0円へ置き換えません。[優先課題一覧](priority_followups.csv)、[全課題DB](../research.sqlite3)。

## 検証と配布

- 正本DBの整合性、外部キー、証拠と設問・提供単位の範囲、SQLからの再取り込み一致を確認。
- 回帰検証12件に成功。全追加バッチの再適用で件数を増やさず、変更済みバッチの拒否、登録失敗の全件ロールバック、原記録の保持、全バッチの再作成一致を確認。
- 第4バッチまでの観測・証拠・出典・判断・料金・ロゴの既存行を比較し、書換えがないことを確認。
- 比較画面の50対象、今回追加9対象への絞り込み、検索、最大4対象比較、未確定表示、分類履歴、サービス優先ロゴ、ロゴ取得失敗時の名前表示、PC／モバイルを確認。
- Wrangler 4.149.0のローカルD1に11,844文を適用し、39テーブルの全行、共通40項目ビュー、優先ロゴビューが正本と一致。遠隔D1への登録・Web公開は未実施。

[DB検証](db_validation.json)、[回帰検証](unit_validation.json)、[履歴保持](batch05_history_preservation.json)、[画面検証](viewer_validation.json)、[ローカルD1検証](d1_local_validation.json)。以前の検証記録はbatch03／batch04のファイルで残しています。今回のDBデータSHA-256：`76ee51179019158ae8ad752c20466cdb2b156d89bd105bb64ec415301b5ba9c8`。

正本と[比較画面](../comparison.html)、[D1初回登録SQL](../d1/import.sql)、再作成用の[B05入力JSON](../batches/B05-20261011.json)を更新しました。追加研究の入力、出典、分類訂正、課題履歴まで同じDBへ登録しています。
