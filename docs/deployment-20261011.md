# Aqsh シフト比較の初回公開記録

この文書は初回公開時の記録です。名称・画面・データ取得の改修後の状態は[シフトづくりサービス比較のデザイン・性能改修](design-quality-20261011.md)を参照してください。

2026年10月11日。本番・検証Worker、Pages入口、本番・検証D1への登録を完了。確認用のPages URLで画面・API・Web MCPを検証した。shift.aqsh.co.jpはCloudflareへ登録済みだが、ムームードメイン側のCNAMEが未設定のため、指定ドメインでの公開は完了していない。

- サイト名：Aqsh シフト比較、無料・会員登録不要。
- 検証URL：https://aqsh-shift-research-staging.aqsh-reprom.workers.dev/
- 本番URL：https://shift.aqsh.co.jp/ （DNS設定待ち）
- 確認用URL：https://aqsh-shift.pages.dev/ （検索エンジンにはnoindex）
- Cloudflare：既存Workers Paid。契約・ネームサーバーの変更なし。独自ドメインを扱うPages入口と、Workers SSR・Static Assets・D1をサービスバインディングで接続。
- Pagesプロジェクト：aqsh-shift（既存DNSのサブドメインに対応）。
- 本番Worker：aqsh-shift-research、検証Worker：aqsh-shift-research-staging。
- D1本番：82a6fd5d-f656-4eb4-bf78-347cf154420c、検証：31ed6b7f-a59e-4967-a27e-38684f221fd4。原本39テーブルと公開4テーブルを保存。
- 公開版：B07-20261011-pub2。研究SHA-256 `2ddb59f682a829e7ee796950232bccbe36bceee2787eeafd4efac504776fc094`、公開投影SHA-256 `74a40b58cb45ed8264a9f8da9d779b0807686a7a169ccb2d251ee86f2e10a4ce`。
- 本番Workerバージョン：`b34675a2-0f6f-4d85-8594-b5b9a43e4bfc`。Pagesデプロイ：https://68054e6c.aqsh-shift.pages.dev/ 。
- アプリ・調査のGitHubコミット：`ab23d1b6cca3716732b20a63e7ba3579b0e71d93`。mainへpush済み。[GitHub Actions](https://github.com/aqshmodel/shift-app-research/actions/runs/38129446505)の全検証が成功。Pagesのaccount_id設定形式の修正と公開記録は `2fbbfdf5e3db367dcc0927f4bd36df9df8e60c89` でpush済み。[追加コミットのGitHub Actions](https://github.com/aqshmodel/shift-app-research/actions/runs/38129741758)も成功。

## 検証

原本DBの14回帰テスト、整合性・外部キー・SQL往復、公開投影の4テスト、7契約・入口テスト、型検査とビルドを確認。検証環境では50詳細SSR、検索・比較、モバイル幅、無JS、API境界、SEO、Web MCP登録・実行・キャンセルの自動検証を行った。D1全39研究テーブルの照合は別JSONに保存する。

本番Pages URLでも同じ9ブラウザテストがすべて成功（17.0秒）。サービスバインディング経由のD1読取、50製品のSSR、素材配信、キャンセルと未対応ブラウザの通常閲覧を確認した。デスクトップと390px幅の画面を目視確認し、screenshotsへ保存。本番Workerのworkers.dev別名は指定ドメインへ301で転送する。Pages別名はnoindexとrobots Disallowで検索公開を抑制する。

Aqsh公式のロゴ・faviconを取得し、SHA-256と取得元をbrand-assets.jsonへ保存。会社概要は2026年10月11日に再確認し、電話番号を本文・フッター・構造化データへ掲載していない。公開URL50件のアクセス点検は研究記録に保持。個別ロゴ権利の許諾は未確認として保持し、権利者からの訂正・削除連絡窓口を掲載した。

## SEO

50製品詳細・4用途ページ・制度参照・運営情報をSSRで配信。固有のtitle、description、canonical、Organization/WebSite/WebPage/SoftwareApplication/Breadcrumb/用途ItemListを設定。口コミ点数、価格、動作保証を構造化データに捏造しない。sitemapは62URL。検索・絞り込み・任意比較はnoindexで、検索結果が無限にインデックスされる状態を避ける。robotsはAPIだけクロール対象外、検証とPages別名は全体noindex。llms.txtはAI用の読取案内であり、順位向上の保証ではない。

## DNS

aqsh.co.jpの権威DNSはdns01/02.muumuu-domain.com。指定CloudflareアカウントにはDNSゾーンがない。既存サイト・メールのレコードを移行せず、次の1レコードでサブドメインを接続する。

| 種別 | サブドメイン | 内容 |
|---|---|---|
| CNAME | shift | aqsh-shift.pages.dev |

Cloudflare側のPagesカスタムドメイン登録は実施済み。管理画面は「非アクティブ (DNS セットアップが必要です)」。DNS照会でもCNAMEは存在しない。ユーザーへDNS設定方法を確認しており、DNS管理画面へのアクセスまたはユーザー側でのレコード追加が必要。ネームサーバーは変更不要。

レコードが反映したら、Cloudflareのドメイン状態、HTTPS証明書、トップ・詳細・比較・API、robots Allowとサイトマップ、noindexヘッダーの解除を確認する。Google Search Consoleの所有権確認・サイトマップ送信もその後に行う。DNSが未設定の現在、Googleでの検索公開は未完了。

## 未検証・残課題

優先度1の未確認課題30件、独立製品動作試験0件。Web MCPの自然言語AI選択E2E、Safari・Firefox・実機、Googleのインデックス・検索順位は確認していない。Search Consoleへのサイトマップ登録は公開接続後に実施・未実施を記録する。定期監視や新しい認証トークンは作成していない。
