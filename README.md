# Aqsh シフト管理サービス調査

シフト管理・自動作成サービスの公開一次資料を整理した調査DBです。2026年10月11日時点で、**50提供単位、1,664文書記録、88料金明細、ロゴ50件、制度参照17件**を収録しています。未確認事項、資料間の矛盾、提供予定、契約・地域・プランの限定を区別して保持しています。

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
| [最新の調査報告](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch07_research_report.md) | 様式9算式、管理者MFA、解約時の出力、分類訂正と残課題 |
| [デザイン・性能の改修記録](docs/design-quality-20261011.md) | 新名称、数字、画面品質、D1取得回数、公開側の検証と計測 |
| [独自ドメインの公開接続記録](docs/custom-domain-20261011.md) | DNS・SSL・公開ドメインの動作・SEO・Google Search Console |
| [SEO・アクセス解析の対応記録](docs/seo-analytics-20261011.md) | サイトマップ成功、Google登録、62ページのタグ検査、同意に基づくGA4の実受信 |
| [用途別ガイド・SEO対応記録](docs/seo-guides-20261011.md) | 4用途の選び方、公式紹介リンク、7URLの登録確認、Googleタグ案内メールの実通信検査 |
| [文言・詳細画面の改善記録](docs/readability-20261011.md) | 未確認項目の非表示、機能の常時表示、自然な文言、対象環境を照合するデプロイ手順 |
| [TOPの絞り込み・一覧の改善記録](docs/home-directory-20261011.md) | 名前を知らなくても探せる用途・機能の絞り込み、DBの一覧、比較導線、公開側の検証と性能測定 |
| [サイト名・SEO表記の変更記録](docs/branding-20261012.md) | 「シフト管理・作成」への統一、公開62ページのSEO検査、本番表示の確認 |
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
