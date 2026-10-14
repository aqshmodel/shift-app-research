# サービス詳細ページのGoogle検索対応（2026年10月14日）

全50サービスの詳細ページに、掲載対象2,259件の調査記録を初回HTMLとして含める修正を本番へ反映しました。正本B62の2,274文書記録、379調査文書、119料金明細は変更していません。採用除外済み15件は正本に保持し、公開対象からの除外を維持しています。

各サービスは以前から `/products/jp01/` などの独立URLと本文を持つページでした。Google検索で製品一覧とNaftyの詳細ページを確認しました。ただし、site検索は全登録URLを列挙する保証がないため、この結果だけで登録件数を確定していません。Search Consoleの全体集計は「データを処理しています」で、全50件の登録数は未確認です。

Shiftmationの詳細は「検出 - インデックス未登録」、前回クロールなしでした。Googleの公開URLテストでは2026年10月14日9:22に取得成功、クロール許可・インデックス許可がともに「はい」、登録可能と確認しました。ページが存在しない、JavaScriptが必須、robotsが遮断している、という状態ではありません。

以前の調査履歴は最初の10件のみ初回HTMLへ入り、続きをJavaScriptとAPIで取得していました。今回は掲載対象の全文を初回HTMLに含め、最初の10件に続く履歴はネイティブの開閉表示にしています。機能説明は従来どおり常時表示です。JavaScriptを無効にしても履歴を開け、全出典・適用条件・留保を読めます。

公開APIとWebMCPは1ページ10件を維持します。件数とページ送りを実際の掲載対象と揃え、採用除外の記録が件数だけに混ざって空のページを作る状態も解消しました。分類訂正や未確認事項を確認済みとして扱う変更はありません。

全50詳細のサイトマップlastmodとWebPageのdateModifiedを揃えました。共通本文の実際の変更日である2026年10月14日と、各サービスの調査記録・判断履歴・課題更新日から算出します。各社の製品改定日とは区別し、公開時刻や毎日の日付で一律更新しません。[Google公式のlastmodの説明](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)に沿って、内容変更のある日付を使っています。

Google Search Consoleへ更新済みサイトマップを再送信し、「サイトマップを送信しました」を確認しました。送信日2026年10月14日、表示された検出数62件です。この時点の最終読み込み表示は10月12日で、再送信直後の全件再取得・登録完了を意味しません。

Shiftmation、Smartlinx、ShiftWizard、PerfectServe Lightning Bolt、NTTデータ数理システムの5詳細ページについて、個別の登録依頼が「優先クロールキューに追加しました」と受付されたことを確認し、画面を保存しました。受付は検索掲載完了を意味しません。

Google側の登録・再取得には時間がかかり、リクエストやサイトマップ送信は掲載を保証しません。[Google公式の再クロール案内](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)を参照してください。全50件が検索に掲載されたとは報告していません。

## 検証

- 全50詳細の初回HTMLを正本の掲載対象IDと照合し、2,259件の重複・欠落なし。HTTP 200、自己参照canonical、index許可、固有title、H1、更新日を確認。
- 本番・検証とも全50サービスの料金・詳細APIがB62公開投影と一致。
- Node 24テスト成功。Astro 61ファイルで診断0、ビルド成功。コードの呼び出し元・SQL・公開API境界をローカルレビュー。
- 検証環境は初回38ケース成功、テスト前提の修正後に関連5ケース成功。全40ケースを確認。修正した前提は、検証環境でも正規URLは本番を示すことと、機能説明の常時表示と履歴の開閉を区別することです。アプリコードは再検証時に変更していません。
- 本番は40ブラウザケースが一括成功。JavaScriptなし、検索・比較、PC/スマホ幅、同意、アクセシビリティ、WebMCPを含みます。
- 公開62ページのSEO検査は問題0件。研究パッケージ801ファイルのハッシュは維持しています。

朝の本番Worker版は `e7fce1ad-456c-42c3-a007-3456cd8c4f29`、検証版は `a778f0d4-e191-442c-9270-bbec362aaa5e`。午後の統合・再反映については次節を参照してください。D1とPages入口は変更していません。復旧先のWorker版は運用バックアップへ保存しています。元の作業フォルダのGit HEAD/indexと並行調査は保持し、Git保存は公開用コピーから行います。

作業直前にCloudflare料金画面の使用コストと予測がともにUSD 0、既存枠内であることを確認しました。既存Workers Paidの基本料変更、プラン変更、外部有料API利用はありません。

[検証概要](service-indexing-verification-20261014.json)、[本番全50HTML](service-indexing-production-html-verification-20261014.json)、[本番API](service-indexing-production-api-verification-20261014.json)、[本番40ケース](service-indexing-production-browser-verification-20261014.json)、[SEO](service-indexing-production-seo-verification-20261014.json)、[サイトマップ送信画面](screenshots/seo-service-sitemap-submitted-20261014.png)を保存しています。GitHubとCIの最終結果は完了記録へ保存します。

## 並行リリースとの統合

午後の最新確認で、別作業の課金防止修正がGitHub main `a9e8f6934df0c7c3557356295e6122b246c8edc8` に入り、本番Workerも13時22分の `40e9c6a5-8379-4e23-a9cc-5d42a7662430` へ変わっていました。この版では詳細の全文履歴と更新日が朝の修正前へ戻っていたため、両方を統合しました。SQL予算・停止設定・入力検証・レート制限・snapshotキャッシュ・出典の対象キー結合は維持します。

統合版は全50サービス・実在比較項目・複数ページで掲載対象viewとの一致を確認し、Node 37ケース、ローカル40ブラウザケース、Astro 67ファイルの診断0とビルドを確認しました。公開APIは10記録を維持し、詳細HTMLは内部取得を1,000記録/サービスで停止する予算を設けています。停止・SQL上限に対して全文履歴とサイトマップ取得も閉じることを検証しています。研究データの変更、公開SQLループ、自動再試行、バックグラウンド実行は追加していません。

料金画面と本番の通常モードを直前確認してから、統合版を検証Worker `449d5b6a-35cc-4ab7-8144-3d93dd4b3fa8` と本番 `a979ae02-5e54-43a7-a129-afce2f01fe71` へ反映しました。両環境の全50HTML・2,259記録・料金/詳細APIが正本と一致し、検証環境では全文履歴・サイトマップ・5つのWebMCPツールを含む5ブラウザケースも成功しました。D1への書き込みは0で、B62のハッシュは維持しています。

再反映直前の使用コスト・予測はともにUSD 0で既存枠内でした。請求集計には遅延があり、将来の増加を保証する報告ではありません。復旧先は直前稼働の本番 `40e9c6a5-8379-4e23-a9cc-5d42a7662430`、検証 `eddb1b7e-a86d-4d67-bd63-3116eacddbdf` を私有バックアップへ記録しました。

最終本番でも、全文履歴・サイトマップ・5つのWebMCPツール・320/390/768/1440px表示・WCAG検査の7ブラウザケースが成功し、62ページのSEO検査は問題0件でした。朝の40ケース一括検証、統合コードのローカル40ケース、最終本番の関連7ケースは環境・版の異なる結果として保存しています。

最終版の証拠は[全50HTML](service-indexing-merged-production-html-verification-20261014.json)、[料金・詳細API](service-indexing-merged-production-api-verification-20261014.json)、[画面](service-indexing-merged-production-browser-verification-20261014.json)、[SEO](service-indexing-merged-production-seo-verification-20261014.json)、[統合コードのローカル40ケース](service-indexing-merged-local-browser-verification-20261014.json)、[Google登録依頼の受付例](screenshots/seo-service-index-request-jp14-20261014.png)を参照してください。Googleの全50件の検索掲載完了は未確認です。
