# Aqsh シフト比較

Astro 7 + Cloudflare Workers + D1で50製品をサーバー描画する公開資料サイトです。Web MCPはブラウザネイティブの公開読み取り5ツール。会員、AI推論API、広告タグはありません。

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

`CLOUDFLARE_ENV=staging npm run build` で検証用D1の設定を選択し、`npm run deploy:staging`。本番は `npm run build` 後に `npm run deploy`。ビルドごとに生成されるdist/server/wrangler.jsonを使用します。ステージング成果物を本番へ流用しません。

初回D1登録は `python3 scripts/d1-initialize.py staging` または `production`。既存テーブルがあれば停止します。以後の更新は原本の差分バッチと新しい公開版を追加する方式にし、初回import.sqlを再投入しません。

ムームードメインのDNSを維持するため、Cloudflare Pagesの `apps/domain-proxy` がサービスバインディング経由でWorkerを配信します。接続するのは `shift.aqsh.co.jp CNAME aqsh-shift.pages.dev` です。Cloudflare側でカスタムドメインを登録してからDNSを設定してください。apexのネームサーバーは変更不要です。

画面・API・ネイティブWeb MCPは `TEST_BASE_URL=https://... npm run test:browser`。Chrome155の実験機能を有効化して検証します。登録・実行テストと、独立したAIの自然言語によるツール選択は別です。後者の150評価ケースは `docs/webmcp/eval-cases.json` に保存しています。

## 復旧

WorkerはCloudflareの前のデプロイへロールバックします。D1はweb_liveのsnapshot_idを保持済みの旧公開版へ1行更新します。現在の原本39テーブルや調査履歴を消しません。公開版だけを戻しても根拠履歴APIは新しい研究記録を含むため、原本更新を伴う復旧はD1 Time Travelを併せて検討します。

```sql
UPDATE web_live SET snapshot_id='B07-20261011-pub1' WHERE id=1;
```

公開URL・本番照合・未検証事項はルートdocsの公開報告に記録します。Cloudflare認証はローカルの既存OAuth、GitHub Actionsは検証だけでデプロイ用トークンを持ちません。Worker APIは120回/分の制限、1秒CPU上限を設定しています。サービスバインディングとD1利用も既存アカウントの使用量に加算されます。
