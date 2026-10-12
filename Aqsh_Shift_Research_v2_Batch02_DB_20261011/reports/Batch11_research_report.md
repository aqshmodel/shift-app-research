# 第11バッチ：ライセンス・保守・追加機能の契約条件

> 公開状況の追記（2026年10月12日）：第8〜12バッチは本番に反映済みです。以下の本番未反映の記述・検証JSONは調査作成時点の状態を保持しています。現在の公開状況は [本番反映記録](../../docs/research-b12-publication-20261012.md) を参照してください。

2026年10月12日、6サービスの公式資料12件から47記録を追加した。資料で部分確認40、記載未確認7。未着手だった17課題に追加確認を行い、未着手は766件から749件となった。個別の契約資料・見積が必要な追加課題4件を登録し、優先度1の残課題は29件を保持した。

正本DBは50提供単位、1,801文書記録、218調査文書、88料金明細。共通40項目の資料採用は552/2,000枠。部分確認や提供予定を含む資料の充足状況で、製品性能の点数ではない。独立試験の実施結果は0件。

## 今回確認した内容

| サービス | 確認事項と適用範囲 | 一次資料 |
| --- | --- | --- |
| 快決！シフト君NEO メディカル・ウェルネス | 料金は個別見積。利用人数に応じたライセンスを案内する。立案100人と、登録管理1000人・同時接続5台は別の項目で、モード・推奨環境を照合する必要がある。Windows本体とクラウドリンクを組み合わせ、milQ・クラウド帳票等には保守・サービス利用権が必要。ExcelやSQL Serverの別Editionのライセンスは別途確認する。 | [購入案内](https://products.ndis.jp/shift-neo/sales/)、[製品仕様・注5～8](https://products.ndis.jp/shift-neo/system.html) |
| 快決！シフト君NEO メディカル | 2026年6月の案内は令和8年度の様式9帳票9種類を追加したと説明。ただし更新ファイルはパスワード保護で未取得。10月6日に共同提供元が公開停止した書式の採用・修正反映や算式の妥当性は未確認。 | [利用者向け更新案内](https://products.ndis.jp/shift-neo/customer.html) |
| 快決！シフト君NEO 両版のクラウドリンク | 障害復旧用バックアップと、契約終了後の資料返還・消去を規約で確認。原資料の保存や直近データの復元は顧客の責任とする。全設定・希望・履歴の機械可読な搬出、削除期限、顧客MFAは未確認。milQの機種変更コードの削除までの保持とは区別する。 | [クラウド規約 第13・14・26条](https://products.ndis.jp/shift-neo/terms.html?id=04)、[milQの保持説明](https://products.ndis.jp/shift-neo/system.html) |
| Ramanas | PRO経由では販売パートナーが納品・技術支援を担当し、難解なトラブルの提供者対応には二次保守契約が必要。UNITE・FREEは提供者が技術支援を担当。販売パートナー向け研修費を利用者の導入費へ転用していない。 | [販売パートナー制度](https://www.sbn.co.jp/ramanas/partner/) |
| Smartlinx | 公開企業説明はAzure、米国データベース、暗号化、年次第三者試験、バックアップを記載。一方、冒頭に適用留保とSecureframeへの相談文があり、所在地も角括弧付き。Schedulingの実契約へ適用を確定していない。SSO・2FAは社内従業員の基盤アクセスの説明で、顧客MFAの根拠にしていない。 | [Security](https://www.smartlinx.com/security/) |
| Lightning Bolt | Access Optimizationは追加購入が必要。日別目標を入力してカバーを自動作成する機能で、需要そのものの自動予測とは区別する。専用Excelでの需要値入力を既存勤務表の任意取込と扱わない。電話・チケットへ毎日24時間連絡できるとの案内は、応答・解決SLAの保証とは別。 | [追加機能区分](https://support.lightning-bolt.com/hc/en-us/categories/360003285832-Add-Ons)、[購入前提・設定手順](https://support.lightning-bolt.com/hc/en-us/articles/360044043252-Access-Optimization-Overview)、[需要目標FAQ](https://support.lightning-bolt.com/hc/en-us/articles/360044043332-FAQ-about-Access-Optimization)、[窓口](https://support.lightning-bolt.com/hc/en-us/articles/360044014252-How-do-I-contact-support) |
| Nursegrid Manager | Managerヘルプは任意・役割別機能の存在を注記。参照する共通アプリ規約では、Managed Accessの付与利用者数課金、初月按分、米ドル・該当税、請求期間末のアクセス終了を確認。Manager固有のMSA・注文書は未取得。個人向け講座等の年次更新・返金条件をManager契約へ移していない。 | [Managerヘルプ](https://healthstreamhelp.mcoutput.com/nursegridmanager/Content/NG_Manager/ManagerLandingPage.htm)、[共通規約 Section 6](https://nursegrid.com/terms-of-service/) |

NEOの窓口は平日9～12時・13～17時30分で、休業日・ユーザーIDの条件がある。クラウド規約の問合せ対象には、顧客固有の環境や登録データの内容を除外する条件がある。2026年10月15日18～22時の告知は将来の計画停止で、実際の停止結果や稼働率として採用していない。掲載の停止対象はmilQ・クラウド帳票等で、ログインと他メニューは利用可能と説明する。[現行窓口・停止予定](https://products.ndis.jp/shift-neo/customer.html)、[クラウド規約 別紙](https://products.ndis.jp/shift-neo/terms.html?id=04)

資料ごとの日付を保持した。NEO動作環境は2025-08-01更新だが、クラウド機能の注記は2021年5月現在。クラウド規約は2022-02-21改定、Nursegrid共通規約は2024-03-12更新、Managerヘルプは2025-09-09更新。取得日2026-10-12を、資料の公開・更新日へ置き換えていない。

## 取得できなかった資料と残課題

Lightning BoltのScheduling Rules PDFは検索結果にあるが、直接取得は404だった。Administration、Integrations、Analytics、Google Calendarの記事は認証へ転送した。ログインや登録は行わず、検索抜粋・記事名を新しい機能の根拠に採用していない。

追加した優先度2の4課題は、SmartlinxのSchedulingへのセキュリティ説明の適用、Lightning Boltの需要作成を含む見積、Nursegrid Managerと共通規約の契約対応、NEO医療版の本体・保守・帳票・第三者ライセンスを分けた見積。NEOの様式9に関する優先度1課題は、6月の更新案内の確認結果を追記し、未完了を維持した。

## データ更新と検証

[B11入力](../batches/B11-20261012.json) を追記登録し、正本DB、D1初回登録用SQL、静的比較画面、出典・課題一覧、公開用データを再生成した。比較画面に残っていた旧調査日の固定表示も、最新バッチの調査日に連動させた。

- DB整合性、外部キー、SQL再読込一致を確認。
- 36テーブルでB10までの旧行の完全一致を確認。最新評価・課題状態・schema_infoは意図した更新対象として別に照合。
- 調査DBの14テスト、公開用データの4テスト、Webの22テスト、計40件が成功。
- 比較画面の50件表示、今回追加6サービスの絞り込み、出典・分類履歴、最大4件比較、1440px・390px幅を確認。日付修正後も画面確認に成功。
- 50サービスの料金概要を確認。NEO両版は「個別見積もり」、Smartlinx・Lightning Boltは「非公開」。新しい金額や0円の明細は追加していない。

検証記録は [B11概要](batch11_validation.json)、[DB](db_validation_batch11.json)、[履歴保持](batch11_history_preservation.json)、[比較画面](viewer_validation_batch11.json)、[料金概要](batch11_price_summaries.json)。公開用版は `B11-20261012-pub2`。調査DBのSHA-256は `d07b41baadcf73a962cf5e391527c475273e66276ec7be85ae4e2360515fd7f3`。

今回の追加調査はローカルDB・比較画面・公開用データまで更新。本番D1・公開サイトへの反映は未実施。`d1/import.sql` は空DBへの初回登録用で、既存本番D1へ再投入しない。
