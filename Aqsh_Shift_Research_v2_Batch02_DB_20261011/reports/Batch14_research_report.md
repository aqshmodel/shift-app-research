# 第14バッチ：認証・権限、支援契約、個別開発の適用範囲

2026年10月12日、Smartlinx Scheduling、ShiftWizard、PerfectServe Lightning Bolt、NTTデータ数理システムの公式資料16件から45記録を追加した。資料で部分確認29（うちプレビューの予定2）、記載未確認14、顧客認証で取得できない範囲2。未着手9課題に確認を進め、未着手は712件から703件となった。新しい確認課題は優先度2の5件、優先度1の残課題は29件。

正本DBは50提供単位、1,960文書記録、254調査文書、116料金明細。新しい金額明細は追加していない。共通40項目の資料採用は578/2,000枠で、部分確認・予定を含む資料の充足状況。独立試験の実施結果は0件。

## 料金と支援の契約条件

| サービス | 料金概要 | 今回確認した範囲 |
| --- | --- | --- |
| Smartlinx Scheduling | 非公開 | Help Deskと製品保守は予算に応じた支援レベルを選ぶ案内。初期導入・移行・研修の金額と内包は未確認 |
| ShiftWizard | 非公開 | 予測Censusの前提となる連携・設定は案内されるが、連携費・機能追加費・基本料は未確認 |
| PerfectServe Lightning Bolt | 個別見積もり | 組織規模と必要ソリューション（Schedulingを含む）に応じて見積もると説明。単体の課金単位・最低契約は未確認 |
| NTTデータ数理システム | 非公開 | 個別開発・Excel呼出モジュールに対応するが、開発・研修・ソルバー・保守費の具体額は未確認 |

Lightning Boltの料金概要を「非公開」から「個別見積もり」へ更新した。他49サービスの料金概要は前回と同じ。根拠は[PerfectServeの料金FAQ](https://www.perfectserve.com/solutions/physician-scheduling-software)。共通プラットフォームの見積方式であり、Lightning Bolt単体の単価や税を確定したわけではない。

Smartlinxは[支援レベルの選択](https://www.smartlinx.com/services/customer-support/)、[導入担当・帳票調整・既存連携](https://www.smartlinx.com/services/deployment/)、[講師研修・教材・訪問研修](https://www.smartlinx.com/services/training/)を確認した。教材の常時閲覧を有人の24時間対応として扱わず、全支援の標準内包も決めていない。[Webサイト規約](https://www.smartlinx.com/terms-conditions/)の無料提供はWebサイトについての説明で、Schedulingの無料プランの根拠にはしない。

## 顧客認証と権限

ShiftWizardの[公開ログイン手順](https://help-healthstream-ps.mcoutput.com/shiftwizard/Content/1-GetStarted/LoggingIn.htm)は、組織SSOの利用と、hStream IDと対象サイトの製品アカウントの紐付けを説明する。電話番号確認は回復・パスワード再設定用と説明されるため、毎回のMFAや管理者の必須化を確認したことにはしない。旧モバイルFAQの2FA予告も現行仕様に採用していない。

[権限の説明](https://help-healthstream-ps.mcoutput.com/shiftwizard/Content/4-Help/F303800-Help/F303800-00-UserAccessLevelsLoginTypes.htm)では、Login Type・所属拠点部署・部署内Access Levelを組み合わせる。Login Typeは1人1種類で、部署ごとに別の種類を割り当てないよう注意する。SuperUserが設定し、一部の役割には提供者側の支援が必要。実際の組織間分離・越権防止の試験は未実施。

Lightning Boltの[顧客ポータル案内](https://support.lightning-bolt.com/hc/en-us/articles/39291924762765-How-to-Log-In-to-the-Customer-Portal-for-the-First-Time)は、Zendesk認証が製品認証と紐付かないと明記する。[Viewerヘルプ](https://support.lightning-bolt.com/hc/en-us/categories/360003285752-Viewer)は顧客認証画面へ転送され、CSV仕様・解約時の全量搬出は確認できなかった。検索に残る2添付PDFも404だったため、断片から現行機能を確定していない。

Smartlinxの[資格・拠点方針の説明](https://www.smartlinx.com/why-smartlinx/intelligent-compliance/)では、設定可能な規則による資格失効後の割当防止と拠点別方針を確認した。Scheduling・勤怠・人事等を横断する説明で、例外権限や失効日の境界は未確認。社内基盤のSSO・2FAを顧客のScheduling認証へ転用しないという既存判断も維持する。

## 更新済みの機能とプレビュー

ShiftWizardの[2026年9月更新資料](https://help-healthstream-ps.mcoutput.com/shiftwizard/Content/Resources/ReleaseNotes/Current.htm)は9月16日のGive Shift競合修正を記載する。一方、部署横断Activity Logと将来枠の予測Census計算は「9月30日プレビュー」の区分。資料の最終更新日は9月22日で、日付が過ぎたことだけで実装済みとはしていない。

Activity Logの横断表示はManager以上、対象期間は90日以内と説明する。90日は表示範囲で、保存期限ではない。予測値を人員計算に使う機能には、ADT連携、全社・部署での有効化、Census設定が必要。提供開始・契約内包・追加費は残課題とした。既存の需要予測の案内と、将来の追加機能を併存させている。

[2026年1月通知](https://community.healthstream.com/viewdocument/shiftwizard-monthly-notification-ja-2)は新モバイルアプリと旧アプリの終了移行を説明し、Push通知・位置情報打刻・資格Walletを今後の予定としている。現在の提供状況は未確定。同通知は平日7〜18時CT・877-301-4786、[現行製品案内](https://www.healthstream.com/solution/scheduling/nurse-and-staff-scheduling/shiftwizard)は7〜19時CST・800-521-0574を載せる。窓口・対象契約・現在の時間帯の照合を残した。

公開用データへの変換では、構造化した「予定」を拾わず「確認済み」とする問題を検出した。変換処理を修正し、予定だけの項目は「予定」、既存機能に将来拡張が併記される項目は既存機能の区分を保持する回帰テストを追加した。調査原本・採用履歴は変更していない。

## 個別開発と導入事例

NTTデータ数理システムの[シフトスケジューリング](https://www.msi.co.jp/solution/scheduling.html)は、特殊要件のコンサルティング・個別開発を案内する。[大阪ガスの事例PDF](../assets/sources/B14-20261012/osakagas-case-020-202307.pdf)2頁を確認し、元PDFの識別子 `020-202307` とSHA-256を保存した。

事例は緊急出動の当直編成。5地区に分かれ、1地区に複数部署からなる約200人がいるという説明。2人1組を異なる部署で組み、日数・曜日の負担配分を扱う。図には過去3か月の勤務実績、曜日の重み・ペナルティ設定、Excelからの実行がある。Excelの操作画面を、最終勤務表のExcel出力仕様の確認とはしていない。

利用担当者は、月の編成に延べ20時間、繁忙月40時間かかっていた作業が、データ準備・計算・微調整まで4時間になったと説明する。計算だけの時間や全工程の独立測定ではなく、顧客・案件固有の報告。顧客の情報通信部が自社開発し、ベンダーの相談・研修を使った作業分担も、現在の全契約の標準提供方式には一般化していない。既存のTMJ300人の事例は別の対象として保持した。

Lightning Boltは[製品を明記したFAQ](https://www.perfectserve.com/solutions/physician-scheduling-software)でClinConnect・Outlook・Epic・Oracleとの連携と、データ収集・研修・設定を含む通常4〜6週間の導入目安を案内する。TPMGへの導入に言及する文脈で、顧客規模別の実測や保証期限ではない。プラットフォーム全体の270超の連携を、全てLightning Boltの標準機能とはしていない。

## 更新と検証

[B14入力](../batches/B14-20261012.json)を追記登録し、DB、D1初回登録用SQL、比較画面、統計・出典・課題一覧、公開用データを更新した。公開操作説明の確認であり、フォーム送信、製品登録、実データ投入、独立試験は未実施。

- 整合性・外部キー・SQL再読込一致と、36テーブルで旧行の完全一致を確認。
- 調査DB14、公開投影・差分更新12、Web22の計48テストが成功。
- 比較画面の全50件、今回追加4サービス、出典・履歴、最大4件比較、1440px・390pxを確認。
- 全50料金概要、予定機能の区分、部分SSO、全量出力の未確認を照合。
- 前回公開版B12からB14への差分SQLを生成。B13も含め、ローカルの全39調査テーブル一致、過去公開版の保持、外部キー違反0件を確認。

記録は [B14検証](batch14_validation.json)、[DB検証](db_validation_batch14.json)、[履歴保持](batch14_history_preservation.json)、[比較画面](viewer_validation_batch14.json)、[料金概要](batch14_price_summaries.json)。準備版は `B14-20261012-pub2`、調査DBのSHA-256は `4f3a6f2fe3faeed80db012eab79d82093baaee81190696d0708a5f3fb48acc44`。

今回分はローカル更新と公開用差分SQLの準備まで。本番は第12バッチの `B12-20261012-pub2` で、B13・B14の遠隔D1更新・本番反映は未実施。初回import.sqlを既存D1へ再投入しない。
