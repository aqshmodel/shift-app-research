# Aqsh シフト管理・作成サービス調査

シフト管理・自動作成サービスの公開一次資料を整理した調査DBです。2026年10月12日の第24バッチまでに、**50提供単位、2,080文書記録、304調査文書、118料金明細、ロゴ50製品、制度参照17件**を収録しています。第24バッチまで本番へ反映済みです。未確認事項、資料間の矛盾、提供予定、契約・地域・プランの限定を区別して保持しています。

第8・9バッチでは11サービスの公開一次資料25件を確認し、54記録と分類訂正1件を追加しました。優先度1の未完了課題は29件です。詳細は [第8バッチ調査報告](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch08_research_report.md) と [第9バッチ追補](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch09_research_report.md)。第8〜12バッチの追加調査は、履歴と過去の公開版を残したまま本番D1・公開サイトへ反映しました。

第10バッチでは5サービスの公式資料8件から35記録を追加しました。課金主体、外部LLM利用と退出データ、勤怠連携のファイル操作・別契約、権限・通知・受付時間を確認し、未着手13課題を追加確認へ進めました。詳細は [第10バッチ調査報告](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch10_research_report.md)。優先度1の残課題29件は、見積・契約資料・実機確認等が引き続き必要です。

最新の公開版は `B24-20261012-pub2`。調査基準日を公開データから表示し、全39調査テーブルと50料金概要を照合しました。公開・復旧の記録は [第24バッチまでの本番反映](docs/research-b24-publication-20261013.md) に保存しています。

第13バッチでは国内4サービスの公式資料15件から52記録と4料金明細を追加しました。解約・退会後の保持、削除期限の記載差、任意支援費、店舗間機能の範囲を確認し、未着手課題は732件から712件になりました。正本DB・比較画面・公開用データとB12からの差分SQLは更新済みで、今回分の本番反映は未実施です。[第13バッチ調査報告](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch13_research_report.md)

第14バッチでは4サービスの公式資料16件から45記録を追加しました。顧客SSO・権限、機能の前提とプレビュー、支援費の契約範囲、個別開発の導入事例を確認し、未着手課題は703件になりました。Lightning Boltは個別見積もりを確認。予定機能を確認済みとして投影する問題を修正し、48テスト・表示確認が成功しています。B13・B14を含む差分SQLは準備済みで、本番反映は未実施です。[第14バッチ調査報告](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch14_research_report.md)

第15バッチではUKG Pro Workforce Management、セルヴィスEX、シフト屋さんの公式資料16件から53記録と年額料金2件を追加しました。UKGの個別見積もり、支援の契約範囲、旧版環境表、AI解析と保存先、APIベータの留保を確認し、未着手課題は696件になりました。48テストと料金・表示確認が成功。B12からB15への差分SQLは準備済みで、本番未反映です。[第15バッチ調査報告](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch15_research_report.md)

第16バッチではSmart Squareの公式4資料から11記録を追加し、未着手7課題を追加確認へ進めました。未着手689件、未完了978件です。48テストと表示・料金確認が成功。B13〜B16は本番未反映です。[第16バッチ報告](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch16_research_report.md)

第17バッチではQGendaの自動割当・契約範囲・支援・料金に限定し、公式4本文から7記録を追加しました。既存の未確認観測と窓口情報は重複追加せず、未着手は684件、未完了は978件です。48テストと表示・全50料金の照合が成功。B13〜B17は本番未反映です。[第17バッチ報告](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch17_research_report.md)

第18バッチではNursegrid Managerの自動割当・Mobile境界・支援に限定し、公式6本文から6記録を追加しました。一括承認を最適化とせず、Mobile無料をManager契約へ流用していません。未着手682件、未完了978件。48テストと表示・全50料金の照合が成功。第18バッチまで本番反映済みです。[第18バッチ報告](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch18_research_report.md)

第13〜18バッチは本番・検証D1の全39テーブルと全50サービスを照合し、本番・検証の各38画面テスト、公開62ページのSEO検査が成功しています。[第18バッチまでの本番反映](docs/research-b18-publication-20261012.md)をご覧ください。過去の未公開表示は各報告の作成時点です。

第19〜24バッチでは6サービスを補完し、43記録を追加しました。全39調査テーブル・全50料金／詳細、本番と検証の各38画面ケース、公開62ページを確認しています。[第24バッチまでの本番反映](docs/research-b24-publication-20261013.md)をご覧ください。

調査データとツールは [Aqsh_Shift_Research_v2_Batch02_DB_20261011](Aqsh_Shift_Research_v2_Batch02_DB_20261011/) にあります。

無料・会員登録不要の **[Aqsh シフト管理・作成サービス比較](https://shift.aqsh.co.jp/)** をCloudflareへ公開しました。ムームードメインのCNAME接続、HTTPS証明書、検索・比較・50詳細ページ・Web MCPを確認しています。医療・介護・店舗・APIの4用途に、選ぶ順序、比較項目、資料の確認例、販売元への質問を追加しました。Aqsh公式の関連ページにも紹介リンクを掲載しています。

Googleはサイトマップの62ページを検出し、今回検査したトップ・製品一覧・代表製品・4用途の7URLはインデックス登録済みです。全62URLの集計は処理中です。GA4は同意後に計測し、タグの読み込みと閲覧の実受信を確認しています。新しい医療向け解説のモバイルLighthouseは性能97、ほか3項目は100でした。実測と最新の確認範囲は [用途別ガイド・SEO対応記録](docs/seo-guides-20261011.md)、GA4の導入設定は [アクセス解析の対応記録](docs/seo-analytics-20261011.md) をご覧ください。

| ファイル | 用途 |
|---|---|
| [調査パッケージのREADME](Aqsh_Shift_Research_v2_Batch02_DB_20261011/README.md) | 調査の読み方、DBの再作成・更新、D1への登録手順 |
| [比較・検索画面](Aqsh_Shift_Research_v2_Batch02_DB_20261011/comparison.html) | ダウンロード後、ブラウザで開ける静的な閲覧画面 |
| [正本DB](Aqsh_Shift_Research_v2_Batch02_DB_20261011/research.sqlite3) | 出典と判断履歴を含むSQLite DB |
| [DB設計書](Aqsh_Shift_Research_v2_Batch02_DB_20261011/DB_DESIGN.md) | Cloudflare D1向けのテーブル・ビュー設計 |
| [D1初回登録用SQL](Aqsh_Shift_Research_v2_Batch02_DB_20261011/d1/import.sql) | 空のD1にスキーマと全データを登録するSQL |
| [継続調査](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch08_research_report.md)・[第12バッチ](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch12_research_report.md)・[第13バッチ](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch13_research_report.md)・[第14バッチ](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch14_research_report.md)・[第15バッチ](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch15_research_report.md)・[第16バッチ](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch16_research_report.md)・[第17バッチ](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch17_research_report.md)・[第18バッチ](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch18_research_report.md)・[最新の第24バッチ](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch24_research_report.md) | 自動割当・契約条件、保守・追加費用、支払・解約、データの削除・復元・出力、参考価格の適用条件 |
| [デザイン・性能の改修記録](docs/design-quality-20261011.md) | 新名称、数字、画面品質、D1取得回数、公開側の検証と計測 |
| [独自ドメインの公開接続記録](docs/custom-domain-20261011.md) | DNS・SSL・公開ドメインの動作・SEO・Google Search Console |
| [SEO・アクセス解析の対応記録](docs/seo-analytics-20261011.md) | サイトマップ成功、Google登録、62ページのタグ検査、同意に基づくGA4の実受信 |
| [用途別ガイド・SEO対応記録](docs/seo-guides-20261011.md) | 4用途の選び方、公式紹介リンク、7URLの登録確認、Googleタグ案内メールの実通信検査 |
| [文言・詳細画面の改善記録](docs/readability-20261011.md) | 未確認項目の非表示、機能の常時表示、自然な文言、対象環境を照合するデプロイ手順 |
| [TOPの絞り込み・一覧の改善記録](docs/home-directory-20261011.md) | 名前を知らなくても探せる用途・機能の絞り込み、DBの一覧、比較導線、公開側の検証と性能測定 |
| [サイト名・SEO表記の変更記録](docs/branding-20261012.md) | 「シフト管理・作成」への統一、公開62ページのSEO検査、本番表示の確認 |
| [概要カードの料金表示](docs/card-pricing-20261012.md) | 全50サービスの料金概要、非公開・個別見積もり、契約条件、本番・画面検証 |
| [料金フィルターと詳細への導線](docs/pricing-navigation-20261012.md) | 料金区分の絞り込み、ロゴ・名前のリンク、詳細上部の料金、本番・画面検証 |
| [詳細ページの1カラム化](docs/detail-single-column-20261012.md) | ロゴ・サービス名・料金の縦配置、本文と案内の1カラム化、画面検証 |
| [制度の参照データ](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/regulation_index.csv) | 様式9の式・除外・丸め・集計期間。製品の実装証拠とは別に保存 |

## ローカルで確認する

```sh
cd Aqsh_Shift_Research_v2_Batch02_DB_20261011
python3 -m unittest discover -s tools -p 'test_*.py' -v
```

DBの再作成・検証にはPython 3の標準ライブラリを使います。元資料のZIPと追加バッチJSONを残しているため、DBを再作成できます。画面テストには別途Node.js、Playwright、Chromeが必要です。

DB、D1用SQL、閲覧画面、出典、調査バッチ、検証記録をGitで管理します。キャッシュ、依存ライブラリ、仮想環境、認証情報を含む環境ファイル、SQLiteの一時ファイルは `.gitignore` で除外しています。`manifest.json` は調査パッケージ内の配布ファイルのサイズとSHA-256を記録しています。

本番・検証D1への登録と全件照合の記録を含みます。公開資料での確認と、独立した動作・性能試験の結果は区別しています。

Webアプリの開発・検証・復旧手順は [apps/web/README.md](apps/web/README.md)。GitHub ActionsはDB再構築・原本保持・公開投影・ツール契約・型・ビルドの検証だけを行い、本番認証情報を保持しません。
