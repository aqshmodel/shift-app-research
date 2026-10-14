# サービス詳細ページのGoogle検索対応（2026年10月14日）

全50サービスの詳細ページに、掲載対象2,259件の調査記録を初回HTMLとして含める修正を本番へ反映しました。正本B62の2,274文書記録、379調査文書、119料金明細は変更していません。採用除外済み15件は正本に保持し、公開対象からの除外を維持しています。

各サービスは以前から `/products/jp01/` などの独立URLと本文を持つページでした。Google検索で製品一覧とNaftyの詳細ページを確認しました。ただし、site検索は全登録URLを列挙する保証がないため、この結果だけで登録件数を確定していません。Search Consoleの全体集計は「データを処理しています」で、全50件の登録数は未確認です。

Shiftmationの詳細は「検出 - インデックス未登録」、前回クロールなしでした。Googleの公開URLテストでは2026年10月14日9:22に取得成功、クロール許可・インデックス許可がともに「はい」、登録可能と確認しました。ページが存在しない、JavaScriptが必須、robotsが遮断している、という状態ではありません。

以前の調査履歴は最初の10件のみ初回HTMLへ入り、続きをJavaScriptとAPIで取得していました。今回は掲載対象の全文を初回HTMLに含め、最初の10件に続く履歴はネイティブの開閉表示にしています。機能説明は従来どおり常時表示です。JavaScriptを無効にしても履歴を開け、全出典・適用条件・留保を読めます。

公開APIとWebMCPは1ページ10件を維持します。件数とページ送りを実際の掲載対象と揃え、採用除外の記録が件数だけに混ざって空のページを作る状態も解消しました。分類訂正や未確認事項を確認済みとして扱う変更はありません。

全50詳細のサイトマップlastmodとWebPageのdateModifiedを揃えました。共通本文の実際の変更日である2026年10月14日と、各サービスの調査記録・判断履歴・課題更新日から算出します。各社の製品改定日とは区別し、公開時刻や毎日の日付で一律更新しません。[Google公式のlastmodの説明](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)に沿って、内容変更のある日付を使っています。

Google Search Consoleへ更新済みサイトマップを再送信し、「サイトマップを送信しました」を確認しました。送信日2026年10月14日、表示された検出数62件です。この時点の最終読み込み表示は10月12日で、再送信直後の全件再取得・登録完了を意味しません。

Google側の登録・再取得には時間がかかり、リクエストやサイトマップ送信は掲載を保証しません。[Google公式の再クロール案内](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)を参照してください。全50件が検索に掲載されたとは報告していません。

## 検証

- 全50詳細の初回HTMLを正本の掲載対象IDと照合し、2,259件の重複・欠落なし。HTTP 200、自己参照canonical、index許可、固有title、H1、更新日を確認。
- 本番・検証とも全50サービスの料金・詳細APIがB62公開投影と一致。
- Node 24テスト成功。Astro 61ファイルで診断0、ビルド成功。コードの呼び出し元・SQL・公開API境界をローカルレビュー。
- 検証環境は初回38ケース成功、テスト前提の修正後に関連5ケース成功。全40ケースを確認。修正した前提は、検証環境でも正規URLは本番を示すことと、機能説明の常時表示と履歴の開閉を区別することです。アプリコードは再検証時に変更していません。
- 本番は40ブラウザケースが一括成功。JavaScriptなし、検索・比較、PC/スマホ幅、同意、アクセシビリティ、WebMCPを含みます。
- 公開62ページのSEO検査は問題0件。研究パッケージ801ファイルのハッシュは維持しています。

本番Worker版は `e7fce1ad-456c-42c3-a007-3456cd8c4f29`、検証版は `a778f0d4-e191-442c-9270-bbec362aaa5e`。D1とPages入口は変更していません。復旧先のWorker版は運用バックアップへ保存しています。元の作業フォルダのGit HEAD/indexと並行調査は保持し、Git保存は公開用コピーから行います。

作業直前にCloudflare料金画面の使用コストと予測がともにUSD 0、既存枠内であることを確認しました。既存Workers Paidの基本料変更、プラン変更、外部有料API利用はありません。

[検証概要](service-indexing-verification-20261014.json)、[本番全50HTML](service-indexing-production-html-verification-20261014.json)、[本番API](service-indexing-production-api-verification-20261014.json)、[本番40ケース](service-indexing-production-browser-verification-20261014.json)、[SEO](service-indexing-production-seo-verification-20261014.json)、[サイトマップ送信画面](screenshots/seo-service-sitemap-submitted-20261014.png)を保存しています。GitHubとCIの最終結果は完了記録へ保存します。
