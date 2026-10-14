# Aqsh シフト管理・作成サービス比較

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
python3 -m unittest discover -s tests -p '*_test.py'
```

原本はルートの調査パッケージです。公開用SQL生成は `python3 scripts/build-publication.py`。提供条件・出典・判断履歴は原本を保ち、4つのweb_テーブルへ版付きで投影します。Airシフトの業務割当を勤務表生成として確認済みには分類しません。Clairviaの初期URLは顧客のヘルプだったため、公開リンクはOracle公式へ補正しています。

ローカル正本・公開投影と本番・検証環境は第62バッチ（`B62-20261013-pub2`）まで更新済みです。全39テーブルと全50サービスを照合しました。[本番反映記録](../../docs/research-b62-publication-20261014.md)と[Q08調査結果](../../Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/public-research-Q08/report.md)を参照してください。

公開投影は構造化された `support_status=planned` を「予定」として保持します。既存機能の資料に将来の追加機能を併記している場合は、各記録を残して既存機能の区分を維持します。プレビューの日付が過ぎたことだけで提供済みに変更しません。

概要カードの料金は、公開中の詳細JSONの料金・P01評価から `price-summary.mjs` で生成します。月額・年額・人数単位・必須の基本料を区別し、未判明の金額は「非公開」または「個別見積もり」と表示します。初期費用0円を無料の継続プランへ置き換えません。検索APIの `price_summary` も同じ表示を使い、カードごとのD1追加呼出しは行いません。対応記録はルートの [料金カード](../../docs/card-pricing-20261012.md) に保存しています。

TOPの料金フィルターは `price=published|free|quote|unpublished`。用途・機能・地域と組み合わせ、件数・選択中の条件・ページ送り・履歴にも反映します。無料の区分には人数制限のあるプランと無料βを含みます。価格の通貨・周期・課金単位が異なるため、金額の単純な大小比較は行いません。概要カードのロゴとサービス名は詳細へのリンクです。詳細ページ上部にも同じ料金概要と条件を表示します。

詳細ページはPC・スマートフォンともにロゴ、サービス名、料金の順で縦に表示します。本文も1カラムとし、比較の案内は本文の下に配置します。

## 公開

検証環境は `npm run deploy:staging`、本番は `npm run deploy`。各コマンドが対象環境でビルドし、生成された `dist/server/wrangler.json` のWorker名・環境名・D1 IDを照合してから公開します。事前の別ビルドは不要です。ステージング成果物を本番へ流用しません。

初回D1登録は `python3 scripts/d1-initialize.py staging` または `production`。既存テーブルがあれば停止します。以後の更新は原本の差分バッチと新しい公開版を追加する方式にし、初回import.sqlを再投入しません。

既存D1の調査更新は、直前の全件エクスポートから `scripts/build-research-update.py` で差分SQLを生成します。公開版・件数・変更前の課題情報を照合し、調査履歴と新しい公開用データを同じD1ファイルインポートで更新します。既存の調査行と過去の公開版を残し、確認処理はD1の式の深さ制限に合わせて分割します。生成時にも、全39テーブルが正本と一致することをローカルで確認します。

```sh
# apps/webで実行。検証環境を先に更新・照合してから本番へ進める。
npx wrangler d1 export DB --remote --env staging --output /private/tmp/shift-before.sql --skip-confirmation
python3 scripts/build-research-update.py --baseline /private/tmp/shift-before.sql --output /private/tmp/shift-update.sql
npm run deploy:staging
npx wrangler d1 execute DB --remote --env staging --file /private/tmp/shift-update.sql --yes
npx wrangler d1 export DB --remote --env staging --output /private/tmp/shift-after.sql --skip-confirmation
python3 scripts/verify-d1-export.py /private/tmp/shift-after.sql --output /private/tmp/shift-d1-check.json
python3 scripts/verify-publication.py --base https://aqsh-shift-research-staging.aqsh-reprom.workers.dev --output /private/tmp/shift-public-check.json
```

公開照合の `scripts/verify-publication.py` は、選択した `data/manifest.json` と `data/publication.sql` の版・件数・調査ハッシュ・内容ハッシュを先に照合します。期待料金は同じ公開SQLの全50製品から `price-summary.mjs` で生成し、特定バッチの料金報告には依存しません。検索概要と全50詳細の料金・版・日付・評価状態を照合し、不一致では成功報告を書き込みません。実環境へ実行する場合はscope・検索・全詳細の52回のGETを行います。C01T04の試験はローカル模擬応答だけで行い、実環境へは接続していません。

Node.jsがPATHにない場合は `--node /path/to/node` または `NODE_BINARY` で指定します。既定以外の版を調べる場合は `--manifest` と `--publication` で対応する保存ファイルの組を明示します。片方だけ古い版でも停止します。ローカル境界テストは `python3 -m unittest discover -s apps/web/tests -p verify_publication_test.py -v`（リポジトリのルート）です。合成した将来版の料金変更、古い版、改変されたmanifest・SQL、料金・詳細・件数の不一致を確認します。

公開側の調査基準日は公開版のデータから表示します。検索API・詳細・一覧・用途別一覧・調査方法・AI向けの取得結果で同じ基準日を使い、解説本文や制度資料の実際の更新・取得日は別に保持します。

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

2026年10月14日、全50サービスの掲載対象記録を初回HTMLに含め、JavaScriptなしで履歴を開ける表示とサイトマップの更新日を本番反映しました。掲載対象2,259件、採用除外15件は正本に保持。Googleへの送信と検証は[詳細ページの検索対応](../../docs/service-indexing-20261014.md)を参照してください。Googleでの全件掲載はまだ確認できていません。
