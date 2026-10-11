# Aqsh シフトづくりサービス比較

Astro 7 + Cloudflare Workers + D1で50製品をサーバー描画する公開資料サイトです。Web MCPはブラウザネイティブの公開読み取り5ツール。会員、AI推論API、広告タグはありません。

GA4はAqshアカウント内の専用プロパティ `558435898`、Webストリーム `16105930586`、測定ID `G-E205Y93JB7` を使用します。測定IDは公開の設定値です。秘密鍵やMeasurement Protocol secretは作成しません。Googleタグは本番ホスト `shift.aqsh.co.jp` で計測に同意した場合だけ読み込み、検証環境・Pagesプレビューでは起動しません。`env.staging`に測定IDを継承しないのは意図した設定です。

基本同意モードで、拒否時はGoogleへの計測通信を行いません。同意後のCookieと同意選択は180日以内、このホストに範囲を限定します。撤回はフッターの「アクセス解析の設定」から行えます。検索語、クエリ文字列、フラグメント、外部参照元のパスは送らず、イベントは `page_view`、`catalog_search`、`compare_select`、`compare_submit`、`compare_view`、`vendor_click` を手動送信します。公開製品IDを除きフォーム値は収集しません。Google シグナル、ユーザー提供データ、広告パーソナライズと拡張計測は利用せず、ユーザー・イベント保持を2か月に設定します。

SEOはサーバー描画、正規URL、検索条件URLのnoindex、用途ページと製品詳細への内部リンク、ページ固有の説明文、OGP/Twitter、運営者・パンくず・製品・一覧のJSON-LDを使用します。ソフトウェアの料金や評価を捏造してリッチリザルトの要件を埋めません。公開URLの全件検査は `python3 apps/web/scripts/audit-seo.py --output /private/tmp/shift-seo-audit.json`（リポジトリのルートで実行）です。Googleの登録状況とサイト側検査は別に確認します。

## 開発

Node.js 24とPython 3.11、画面検証にはChromeを使います。認証情報はGitに入れません。

```sh
cd apps/web
npm ci
export ASTRO_TELEMETRY_DISABLED=1 WRANGLER_SEND_METRICS=false
python3 scripts/d1-initialize.py local  # 空のローカルD1限定
npm run dev
npm test
npm run check
python3 tests/publication_test.py
```

原本はルートの調査パッケージです。公開用SQL生成は `python3 scripts/build-publication.py`。提供条件・出典・判断履歴は原本を保ち、4つのweb_テーブルへ版付きで投影します。Airシフトの業務割当を勤務表生成として確認済みには分類しません。Clairviaの初期URLは顧客のヘルプだったため、公開リンクはOracle公式へ補正しています。

## 公開

検証環境は `npm run deploy:staging`、本番は `npm run deploy`。各コマンドが対象環境でビルドし、生成された `dist/server/wrangler.json` のWorker名・環境名・D1 IDを照合してから公開します。事前の別ビルドは不要です。ステージング成果物を本番へ流用しません。

初回D1登録は `python3 scripts/d1-initialize.py staging` または `production`。既存テーブルがあれば停止します。以後の更新は原本の差分バッチと新しい公開版を追加する方式にし、初回import.sqlを再投入しません。

ムームードメインのDNSを維持するため、Cloudflare Pagesの `apps/domain-proxy` がサービスバインディング経由でWorkerを配信します。接続するのは `shift.aqsh.co.jp CNAME aqsh-shift.pages.dev` です。Cloudflare側でカスタムドメインを登録してからDNSを設定してください。apexのネームサーバーは変更不要です。

本番Workerを先に公開し、次のコマンドでPages入口を更新します。Pagesの設定ファイルにはaccount_idを置けないため、既存のアカウントIDを環境変数で指定します。

```sh
cd ../domain-proxy
CLOUDFLARE_ACCOUNT_ID=032177c6a3d3bbf36ce3c60cc4e62404 \
  ../web/node_modules/.bin/wrangler pages deploy public --project-name aqsh-shift --branch main
```

画面・API・ネイティブWeb MCPは `TEST_BASE_URL=https://... npm run test:browser`。Chrome155の実験機能を有効化して検証します。登録・実行テストと、独立したAIの自然言語によるツール選択は別です。後者の150評価ケースは `docs/webmcp/eval-cases.json` に保存しています。

## 表示品質とデータ取得

TOPはDBのサービスを12件ずつサーバー描画し、用途・国内／海外・複数の機能で絞り込めます。`home-directory.mjs`で条件の検証、すべての選択機能に記載があるサービスの抽出、件数計算、ページ送りを扱います。提供予定・記載未確認を、資料で確認済みの機能として数えません。

GETフォーム・ページリンクはJavaScriptなしでも使えます。`home-client.mjs`の拡張時は同じGETのHTMLを取得し、一覧・条件・件数を差し替えます。独立した検索APIや画面用の全製品JSONを追加せず、D1はリクエストごとの1回のbatch（2クエリ）で公開版と一覧を取得します。中断、通信失敗、戻る操作と比較選択の維持を検証しています。既存API・Web MCPの契約と原本は変更していません。

FIKAIGOの公式ロゴは外部画像レスポンスのCookie設定を避けるため、元のSVGを編集せず自己配信します。完全一致する出典URLだけをローカルパスへ対応付け、APIは原URLを保持します。出典・取得日・SHA-256はルートの `docs/service-logo-assets.json`、TOPの検証結果と測定条件は `docs/home-directory-20261011.md` に記録しています。

数値には自己配信のManropeと`lining-nums tabular-nums`を使い、高さと幅を揃えています。フォントの出典・ライセンスは`docs/font-assets.json`に記録しています。案内文は丁寧語の表示用コピーに分け、調査記録とAPIの原文を保持しています。

`src/lib/repository.ts`はリクエストごとに公開版と取得済み製品を共有します。詳細の重複取得を避け、比較は一括SELECT、根拠の件数と本文はD1 batchで取得します。状態はリクエストを越えて共有しません。`Server-Timing`でDB呼出回数・クエリ数・所要時間を確認できます。根拠履歴は原本から取得するため、原本更新と公開版の切替は一緒に管理してください。

画面検証にはWCAG AAの自動検査、320〜1440pxの幅、フォント読込、動きを減らす設定、検索後の戻る操作も含めています。実SQLの回帰テストでは取得回数、公開版の切替、ページ送り、DB障害時の例外を検証します。デザイン改修の確認結果は`docs/design-quality-20261011.md`へ記録します。

## 復旧

WorkerはCloudflareの前のデプロイへロールバックします。D1はweb_liveのsnapshot_idを保持済みの旧公開版へ1行更新します。現在の原本39テーブルや調査履歴を消しません。公開版だけを戻しても根拠履歴APIは新しい研究記録を含むため、原本更新を伴う復旧はD1 Time Travelを併せて検討します。

```sql
UPDATE web_live SET snapshot_id='B07-20261011-pub1' WHERE id=1;
```

公開URL・本番照合・未検証事項はルートdocsの公開報告に記録します。Cloudflare認証はローカルの既存OAuth、GitHub Actionsは検証だけでデプロイ用トークンを持ちません。Worker APIは120回/分の制限、1秒CPU上限を設定しています。サービスバインディングとD1利用も既存アカウントの使用量に加算されます。
