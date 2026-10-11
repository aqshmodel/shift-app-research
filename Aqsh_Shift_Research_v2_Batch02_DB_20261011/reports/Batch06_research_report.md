# 第6バッチ追加調査 — 様式9の算式、管理者MFA、解約時のデータ出力

調査・登録日：2026年10月11日。18提供単位へ新規130件を追加し、既存3件の分類を訂正しました。累計は**50提供単位、1,627文書記録、88料金明細、ロゴ50件**です。様式9の算式・条件は製品への観測と分け、制度参照17件として登録しています。

新規130件の内訳は、資料で確認112件、資料間の不一致6件、調べた本文で記載を確認できなかったもの12件です。「確認」は公開文書の記載範囲を意味し、実動作や個別契約の適合を示しません。今回の出典取得履歴は40件。機能調査の累計は180文書、全用途の出典取得履歴は298件です。料金・ロゴの新規追加はありません。

## 様式9：原則の式と製品説明を照合する

行政様式の式・除外・兼務按分と、令和8年度改定資料の丸め・時間算入条件を整理しました。届出区分と施設条件の最終確認に使える参照データであり、実行可能な計算エンジンや製品の適合認定ではありません。

| 参照する項目 | 確認した式・条件 |
|---|---|
| 月平均夜勤時間 | `(D-E)/B`。Dは病棟の延べ夜勤時間、Eは平均から除外する職員の夜勤時間、Bは対象職員数 |
| 対象職員の除外 | 夜勤専従を除外。急性期・一般7対1／10対1等は16時間未満、短時間正職員は12時間未満、その他の病棟は8時間未満。閾値ちょうどは「未満」の除外に含まれない |
| 病棟外との兼務 | 対象交代制勤務者は通常1。兼務時は病棟夜勤時間／病棟外を含む総夜勤時間で按分 |
| 勤務実績の三段 | 上段は病棟日勤、中段は病棟夜勤、下段は病棟外を含む総夜勤。Cは上段＋中段、Dは中段の合計 |
| 月平均配置数・必要数 | 実績は `C/(日数×8)`。1日必要看護職員数は `(A/配置比の数)×3`。Aは1日平均入院患者数 |
| 追加・補助者・多職種 | 追加必要数 `(A/50)×3`、夜間補助者 `A/配置比の数`。事務的補助者は実績 `F/(日数×8)`、上限 `(A/200)×3`、事務業務割合5割以上の区分。多職種協働の式は精神科と一般を分ける |
| 添付する実績 | 直前1か月、勤務体制・申し送りの資料。対象夜間加算では日別患者数・配置等も確認 |

出典は[近畿厚生局の令和8年度様式9](https://kouseikyoku.mhlw.go.jp/kinki/r8-k09.pdf) pp.2–4です。夜勤平均のゼロ除算や丸めなど、この様式で明記されていない項目は未確認のまま保持しています。

令和8年度の改定説明では、Aを小数第1位まで切り上げる例として12.34→12.4を示しています。月平均配置数は小数第2位以下を切り捨て、1日必要看護職員数・夜間補助者必要数は小数第1位まで切り上げます。指示された院内研修は主に当該病棟へ従事する職員1名につき月1時間まで算入でき、条件付きの短時間の病棟外対応等も記載されています。[厚生労働省の改定説明資料](https://www.mhlw.go.jp/content/12400000/001703849.pdf) p.15。個々の式に同じ丸めを一律適用せず、確認できた対象をJSONへ記録しました。

専門団体の2026年版手引きでは、4週間を選択できる対象は月平均夜勤時間で、配置数は暦月です。両実績表と空白のない連続期間が必要と説明しています。行政資料と同じ権威区分にはせず、professional_guidelineとして保存しました。[共同手引き](https://youshiki9.doc-net.or.jp/manual/youshiki9_tebiki260527.pdf) p.7。PDF内部の古いタイトル情報ではなく、本文の2026年版表示を記録しています。

製品側には次の確認結果を追加しました。

| 対象 | 公開記載と、残った確認点 |
|---|---|
| Nafty | 「月16時間以下」の除外説明が行政の「未満」と異なる。兼務の分子・分母、丸め、8／12時間条件、研修算入は実Excel・製品結果の照合が必要。説明差を実装不具合とは断定していない。[様式9説明](https://nafty.app/youshiki9/) |
| miramos | 様式9出力の説明を確認。境界・兼務按分・丸め・適用版の算式詳細は本文で未確認。[医療向け機能](https://www.konicaminolta.com/jp-ja/miramos/function/medical-care.html) |
| 快決！シフト君NEO メディカル | 共同Excelの書式を使う説明を確認。実際の算式版と改定反映は未開示。[医療版](https://products.ndis.jp/shift-neo/medical/) |
| 勤夢表VX | 4週／暦月、任意期間、Excelセルへの出力設定を確認。制度上の用途と集計条件、改定後の算式実装は別途確認が必要。[勤務表概要](https://ideanexsys.com/看護介護の勤務表概要/) |
| エピタルHR | 改定へ速やかに対応する説明を確認。令和8年度の算式・版・境界結果は未確認。[FAQ](https://epigno.jp/epitalhr/faq/) |

共同Excelの提供元は2026-10-06に`26_9chiiki_ryoyo_hojokasan.xls`の公開を整合性確認のため停止しています。これは参考ファイルの告知であり、NEOの採用版や不具合の証拠ではありません。[共同Excelの告知](https://youshiki9.doc-net.or.jp/)。Naftyの無料Excelは取得用フォームの表示を確認しましたが、個人情報の送信・ファイル取得・数式の検算は行っていません。[無料Excel案内](https://nafty.app/youshiki9/download/)。手引き・Excelの原本をこのパッケージへ再配布していません。

## 管理者MFA：強制範囲、プラン、解除と復旧

| 対象 | 確認した条件 | 残る範囲・不一致 |
|---|---|---|
| シンクロシフト | PC版はシステム管理者のメール二要素認証を必須・無効化不可と明記。他の権限は任意 | アプリ記事は必須化と権限を限定しない無効化手順を併記。権限条件と全管理者ロック時の復旧は未確定。[PC](https://support.synchroshift.jp/portal/ja/kb/articles/1008)、[アプリ](https://support.synchroshift.jp/portal/ja/kb/articles/1009) |
| Connecteam | 全管理者のダッシュボードへSMS PINを要求する設定。2026-08のヘルプはBasicから利用可能とする | 旧Enterprise説明・料金情報とのプラン境界が不一致。契約で照合する課題を残した。[2FA](https://help.connecteam.com/en/articles/3112479-two-factor-authentication-2fa)、[Enterprise](https://help.connecteam.com/en/articles/6141378-the-enterprise-plan) |
| Deputy | SSO必須化でローカル／ソーシャルログインを停止できる | SSOにはDeputyの2FAが適用されず、IdPでのMFAが必要。既存セッションの即時再認証も別問題。[SSO FAQ](https://help.deputy.com/hc/en-au/articles/4755748784271-Single-Sign-On-SSO-FAQs) |
| Planday | 全プランでワークスペース単位に有効化、個人除外不可。既定は無効、Xero連携は必須。SMS／認証アプリ、管理者による職員リセットを説明 | 方式解除は全職員へ適用。30日間の認証省略、管理者全員が入れない場合の復旧を区別。[MFA](https://help.planday.com/en/articles/92280-how-to-enable-multi-factor-authentication-mfa-in-planday) |
| Quinyx | 署名済み契約・請求を伴う追加機能。Quinyx側で設定し、SMSコード、5回失敗ロック、要求周期を説明 | 月額とSMSの追加費用の金額、管理者対象・免除・復旧は未確認。強化パスワードの管理者別条件とは区別。[MFA](https://help.quinyx.com/help-centre/docs/multifactor-authentication)、[パスワード](https://help.quinyx.com/help-centre/docs/advanced-password-management) |
| Rotageek | 管理者等の利用者区分を指定し、認証アプリ／メールのMFAを設定。Company Settingsで一時解除可能 | 解除権限・監査、管理者全員のロックアウト復旧、SSOでのMFA条件は未確認。[会社設定](https://support.rotageek.com/en/articles/14601074-company-settings)、[MFA](https://support.rotageek.com/en/articles/6682375-multi-factor-authentication) |
| RosterElf | Xero／MYOB連携時は必須で、連携解除まで無効化不可。通常は個人設定を案内 | メール、SMS等の認証手順と復旧案内を追加。連携がない場合の全管理者一括強制は未確定。[有効化・無効化](https://www.rosterelf.com/support/knowledge-base/security/enabling-or-disabling-multi-factor-authentication)、[認証](https://www.rosterelf.com/support/knowledge-base/security/using-multi-factor-authentication) |
| When I Work | 全権限が個人単位で任意設定でき、SMS／認証アプリを利用。有効化後はログインと一部の機微操作で要求 | 管理者全員への一括強制は本文で未確認。[二段階認証](https://help.wheniwork.com/articles/two-step-verification-technical-reference/) |
| Humanity | 公開ログインページのHTMLに認証アプリ・1回限りのbackup code等の説明 | 条件付きの画面文言を含む可能性がある。現行プラン、管理者強制、ログイン成功の証拠にはしていない。[公開ページ](https://helpcenter.humanity.com/app/) |

Optima・Sona・Lantumの英国調達資料でも管理画面の二要素認証の列挙を確認しました。ただし全管理者への強制、解除・復旧方法までの確認とは区別しています。Patchwork Rotaの同欄ではユーザー名・パスワードの記載を確認し、MFAの記載未確認を「非対応」とはしていません。これらの出典は次表のサービス別調達資料です。

## 解約時の出力：通常レポートと全量返却の差

全量の確認では、職員・勤務だけでなく、希望、ルール、設定、監査、履歴、添付、識別子、期間、形式、期限、費用を分けました。公開文書に「全データ」があっても、全種類の再構成試験までは済んでいません。英国G-Cloud 14資料は当該調達枠の申告・契約資料であり、現在の日本向け個別契約へ適用すると断定しません。

| 対象 | 確認結果と制限 |
|---|---|
| Allocate Optima | システム内の全データを顧客所有とし、要求によりSQL等の標準形式で返却すると申告。終了前後の抽出と、終了後1か月内の申出を案内。希望・ルール・添付・監査等の具体スキーマ、別DBへの再構成は未確認。[調達資料](https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/889593993251086) |
| Patchwork Rota | 契約中いつでもfull extractionと移行支援を申告。終了時にアクセス停止、追加費用なしとする。CSV／Excelの通常出力とは分け、全設定・添付の構成は未確定。[調達資料](https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/174091422548808) |
| Lantum In-Genius Rota | 合意形式での要求抽出を申告。全履歴・設定・監査の対象や費用・期限は未確定。Secondary Careのこの提供単位を対象とし、別サービスの条件を混ぜていない。[調達資料](https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/896571031166769) |
| Sona | 終了時のレポート・抽出協力を申告するが、出力方法欄で取込を説明する不一致がある。2024-02版契約は個人データの返却／削除を規定し、非個人データは未払料金による返却制限がある。削除は「使用不能にする」を含み、物理的な全媒体消去の保証とは区別。[調達資料](https://www.applytosupply.digitalmarketplace.service.gov.uk/g-cloud/services/196631126822513)、[当該契約PDF](https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-14/documents/721491/196631126822513-terms-and-conditions-2024-05-07-1059.pdf) §§6.3.7／15.4.4 |
| Deputy | System AdministratorのData Exporterに各種CSV、フィルタ、件数、version historyを案内。解約は非Enterpriseの月／年契約でアクセスを直ちに停止し、News／Training等の添付は別保存が必要。出口CSVはbulk updateの再取込形式と異なる。[出力ガイド](https://help.deputy.com/hc/en-au/articles/4755408081167-How-to-export-or-download-your-data)、[解約](https://help.deputy.com/hc/en-au/articles/4755583313295-How-to-cancel-your-Deputy-subscription) |
| Planday | 各管理画面から個別に保存。署名契約は1件ずつ、documents overviewは一覧で元添付の一括取得ではない。勤務変更履歴の閲覧と全量出力は別。解約後120日以内の削除を案内するが、起算日は個別契約と未照合。[保存ガイド](https://help.planday.com/en/articles/30428-how-to-access-and-export-your-data)、[解約](https://help.planday.com/en/articles/30211-how-to-cancel-your-planday-subscription) |
| Connecteam | 全額返金時はアカウントをブロックするため事前のExcel／PDF保存を案内。全設定・監査等の一括出力は未確認。返金・利用終了時点は月払い／年払いで条件が異なる。[解約・返金](https://help.connecteam.com/en/articles/5828460-subscriptions-cancellations-refunds-and-plan-changes) |
| When I Work | 解約時に直ちにアクセスが終了するため事前出力が必要。削除依頼、法令保持、共有利用者データ等の条件を記録し、解約だけで即時全消去とはしていない。[利用規約](https://wheniwork.com/terms) §§12.1／12.3 |

Naftyは施設契約の全設定・履歴等の返却記載を確認できませんでした。ゲストの個人予定を端末内だけに保存し復元できないという条件は、施設解約時の全量出力と区別しました。[Nafty規約](https://nafty.app/terms/)。エピタルHRの秘密資料の返却／削除条項も、全DBの機械可読形式・納期・費用を約束する記載とは区別しています。[エピタルHR規約](https://epigno.jp/terms/) §§37.7／38。

調達資料からは、監査ログの取得・保存期間、API連携、保存地域も追加しました。保存地域の選択、顧客の監査と供給者の監査、現在の認証取得と過去時点の取得予定は分けて登録しています。

## 分類の訂正と、残した未確認事項

次の3件は原観測・取得履歴を保存し、訂正先を追記しました。

| 元観測 | 訂正 | 理由 |
|---|---|---|
| B02-O00015／Nafty | M08 → N06 | 職員が施設を離れた後の保持は、施設契約終了時の全量返却の証拠とは異なる |
| B03-20261011-OBS0223／Nafty | M08 → M02 | 通常の勤務表CSV／Excel／PDF出力だけでは解約時の設定・履歴の返却を確定できない |
| B03-20261011-OBS0021／シフト屋さん Public API / MCP | N02 → M04 | APIキー・OAuthトークンの認証は、管理者ログインのMFAの証拠とは異なる |

共通40項目の資料採用は508→517／2,000枠です。10枠増、誤分類の訂正で1枠減の純増9枠。内容が変わった共通セルは18件です。医療算式・全量出力等には共通40項目外の深掘り設問も使っているため、この数字だけで今回の調査量や品質を測れません。[差分](batch06_coverage_changes.csv)、[集計](batch06_coverage_change.json)、[分類訂正](classification_corrections.csv)。

具体的な残課題10件を追加し、既存4件の進捗・優先度を更新しました。優先度1の未完了課題は30件。全課題953件のうち952件が未完了です。公開記載だけで広い設問を完了にせず、文書・契約確認と合成データによる追試を分けています。[優先課題一覧](priority_followups.csv)。

特に次を残しています。

- 様式9の8／12／16時間ちょうど、夜勤専従、兼務、研修、丸めを実Excel・製品出力で照合。NEOの採用する改定版も確認。
- Connecteamの現行プラン境界、Quinyxの管理者対象・ロック解除・SMS費用、管理者全員が入れない場合の復旧を契約資料で確認。
- OptimaのSQLとDeputyのCSV・添付で、全種類・件数・期間・識別子・時刻を検査し、別DBへ再構成できるか追試。
- Plandayの全設定・勤務履歴・添付の出口、Sonaの出力説明の不一致・現行契約・削除証明を確認。

## DB・閲覧画面・D1の更新と検証

スキーマはv3.1の39テーブル・12ビューを維持しています。既存のregulationsへ17参照を登録し、source_revisionsへの関連、版、ページ位置、式、入力、除外、丸め、適用条件を構造化JSONで保存しました。適用日を確定できないものはNULLです。行政資料16件と専門団体手引き1件を区別し、全件に`vendor_implementation_verified: false`を保持。製品実装へのregulation_support関連は0件です。[制度索引](regulation_index.csv)、[設計書](../DB_DESIGN.md)。

比較画面に「制度の参考算式・条件」を追加しました。17件の要約・式・留保・出典へアクセスできます。製品の詳細と最大4件比較、検索、ロゴ50件、料金、分類・判断履歴も維持しています。[比較・検索画面](../comparison.html)。

後続バッチで以前の分類訂正による採用除外を引き継ぐ処理も修正しました。新規バッチは`resolution_policy_version: 2`を使います。旧バッチの未指定は従来方式で再作成し、入力JSONと過去の判断履歴を保持します。

- 回帰検証14件が成功。全バッチの再作成一致、同一バッチの再適用、変更済み入力の拒否、登録失敗の全件ロールバック、制度参照と製品判断の分離、分類訂正の継承を確認。
- 第5バッチまでの36テーブルの既存全行・全列、943件の課題定義を保持。最新判断への参照と、明示した4件・観測追加に伴う3件の課題進捗を更新。
- 正本の外部キー違反0、整合性ok。SQL再取り込みの全データ一致を確認。
- PC／モバイルの画面、50対象、今回追加19対象への絞り込み、検索、最大4対象比較、履歴、17制度参照、サービス優先ロゴと画像失敗時の表示を確認。
- Wrangler 4.149.0のローカルD1に12,568文を適用。39テーブルの全行・全列、共通40項目、優先ロゴ、17制度参照が正本と一致。

SQLは空のD1への初回登録用です。12,491件のINSERT、最大INSERT 9,155 bytes、全体5,577,643 bytes。遠隔D1への登録・Web公開は未実施です。ログイン、アカウント作成、営業連絡、フォーム送信、業務データの書込も行っていません。独立試験シナリオ14件の実施結果は引き続き0件です。

[DB検証](db_validation.json)、[回帰検証](unit_validation.json)、[履歴保持](batch06_history_preservation.json)、[画面検証](viewer_validation.json)、[ローカルD1検証](d1_local_validation.json)。今回のDBデータSHA-256：`6444e7734e6e744eacb584f1de3d9b4806b5b3db7d5aa21a25acdc595fbb07f6`。第5バッチの検証は`*_batch05.json`として保存しています。

[B06入力JSON](../batches/B06-20261011.json)、[正本DB](../research.sqlite3)、[D1初回登録SQL](../d1/import.sql)、[出典索引](source_index.csv)、[詳細集計](research_stats.json)を更新しました。公開Web／PDF本文は今回の配布ファイルへ保存せず、要約・該当箇所・取得履歴・不一致・残課題をDBに登録しています。
