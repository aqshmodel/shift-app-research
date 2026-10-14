# Cloudflareの課金リスク対策

2026-10-14。対象はシフト比較サイト。コードの実装と本番への導入を区別する。本番導入には運用者の明示承認が必要。

## リクエストからD1まで

静的アセットは従来の配信を使う。動的HTML・API・sitemap・WebMCP用APIは、共通ミドルウェアで入力検証 → 停止設定 → レート制限を確認し、その後にルートを実行する。停止中はレート制限の呼び出しも不要なため先に503を返す。API側で二重カウントしない。

- URLの検索部分は1,500文字、パスは200文字まで。検索語100文字、検索結果50件、ページ100、比較2〜4製品、出典10記録/ページ。重複する単一値パラメータは拒否する。
- 存在しない比較項目の番号を入力段階で拒否する。既存のAPI対象であるA〜Rの実在コードだけを受け付ける。
- `utm_source/medium/campaign/id/term/content`、`gclid`、`fbclid`は検証時に内容の条件から除外する。ログには検索語、IP、URLクエリ、認証情報を含めない。
- `PUBLIC_API_LIMITER`はHTML/API共通で120回/60秒/IP。UAによる例外は設けない。通常閲覧と検索クロールを許容する初期値で、共有IPの誤制限と429を運用で確認する。
- レート制限は拠点ごとで、結果整合性も厳密ではない。分散アクセスの総額制限にはならない。
- 本番・検証でBinding/IPがない場合、呼び出しが失敗した場合は503。`ENVIRONMENT`が欠落・不明な場合も閉じる。ローカルAstro開発だけはビルド時のDEV分岐で制限を省略する。

## 停止設定とリクエスト予算

`D1_ACCESS_MODE=normal`だけが通常状態。`paused`、欠落、誤記は503になる。D1内に停止フラグを置かない。repository側でも停止状態を検査する。停止中はキャッシュ済みのカタログも返さず、D1にアクセスしない。`/healthz`はD1を使わず200とモードを返す。

repositoryはリクエストごとに作り、最大8回のD1呼び出し・12本のSQLを、実行前に確保する。失敗も予算を消費し、自動再試行はしない。正常経路は概ね1〜3回・1〜5本である。batchの1呼び出しと複数SQLを区別する。公開ランタイムに書き込みSQLはない。この予算は走査行数やアカウント総量の上限ではない。

APIのHEADはGETを呼ばない。scopeと索引による存在確認だけを使い、製品/出典の404、比較対象不足の400、障害の503を維持する。HTMLのHEADは引き続きSSRを行い、共通制限とSQL予算で保護する。

## SQLとキャッシュ

出典取得は全製品の判定を展開するviewを経由せず、`current_assessments`と出典を製品・項目のキーで結合する。DBの構造変更や再投入はない。全50製品・実在項目・複数ページで旧結果との一致を検証する。

カタログでは`json_each()`を使わず、必要なJSONを抽出してWorker内で料金項目を選ぶ。最大51行を取り出し、50を超えたら停止する。検証DBの単回測定は出典6,676→277行、一覧2,395→51行。出典のSQL時間は6.37→1.14ms、一覧は19.02→35.94msだった。一覧の転送JSON量が増えるため、読み取り行数の削減を応答時間の短縮と混同しない。

完了済みのカタログデータだけをisolate内に最大2版・5分保持する。PromiseやD1のI/Oをリクエスト間で共有しない。各リクエストは必ずD1の公開版ポインタを読み、新しい公開版または旧版へのロールバックに対応する。更新時は新しいsnapshot_idを発行し、同じIDの内容を後から書き換えない。warm時は公開版確認の1SQLだけになる。isolate再起動時はcoldになる。

動的応答は`no-store`。既存Pagesのプロキシもこのヘッダーを保持する。HTTPヘッダーだけによるエッジキャッシュ削減は主張しない。既に下流へ保存された旧応答がある場合、導入前のs-maxage最大300秒が経過するまで古い表示が残り得る。緊急時はキャッシュ削除の影響と権限も確認する。

## ログと監視

Workers Logsは1% head sampling、invocation logsとtracesは無効。定型イベントにstatus、処理区分、D1呼び出し回数・SQL数・時間を含める。all/batchで返る正式なmetaだけを集計し、firstの行データからメタ情報を想像しない。`metaQueries`に対応する部分のrowsRead/rowsWrittenであり、リクエスト総量ではない。全体はCloudflare Metrics/Query Insightsを使う。

監視CLIは`node scripts/cloudflare-usage-watch.mjs`。`CLOUDFLARE_ACCOUNT_ID`とGraphQL Analytics読み取り権限のトークンを実行環境から受け取る。1回1Analytics API、30秒タイムアウト、自動リトライなし、D1クエリ0、書き込み0。時間別の過去データから中央値×5と絶対値（500万行読取・10万行書込・1万read queries・千write queries/時）の大きい方を使う。暫定値であり、公開/検証イベントは人が照合する。集計がない時間は0と断定せず、欠測または非稼働として扱う。DB容量増加は標準D1 Storage Metricsで確認する。

CLI自体に定期実行・メール送信は追加していない。実行する場合は既存運用の1時間1回（最大744回/月）を上限の案とし、実行環境と通知先を確定してから設定する。端末停止中は監視されない。標準予算アラートを常設の第一段とする。通知は支出を止めない。

## 追加費用と限界

新しい有料サービス、Cron、監視用DB、毎リクエスト書き込み、CIジョブは追加しない。既存の`npm test`に安全性検査を追加する。現状水準なら追加従量費は既存枠内の見込みで、0ドルを保証しない。

2026-11-30まではWorkers Paid Logsが月2,000万イベントを含み、超過100万イベントあたり$0.60。1リクエスト1イベントの1%抽出では、月1,000万リクエストで約10万イベントとなる。他のサービスと枠を共有する。

2026-12-01からのObservabilityは、Paidで取込50GB/請求周期と保存10GB-monthを含み、超過は$0.25/GBと$0.10/GB-month。1イベントを保守的に2KBとすると前記10万イベントは約0.2GB。実際の付加属性とアカウント全体の量を確認する。サンプリングも支出の厳密な上限にはならない。

D1 Paidは月250億行読取・5,000万行書込・5GBを含み、超過は100万行読取$0.001・100万行書込$1・GB-month$0.75。例えば、1SQLで1億行を書き、1万回実行すると1兆行、含まれる枠を除いて約$999,950となる。SQL本数制限だけでは書き込み行数を抑えられないため、公開コードの読み取り専用を維持する。

## 公式仕様

- [D1料金](https://developers.cloudflare.com/d1/platform/pricing/)
- [D1 Metrics/Analytics](https://developers.cloudflare.com/d1/observability/metrics-analytics/)
- [Wrangler D1](https://developers.cloudflare.com/d1/wrangler-commands/)
- [Workers Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [Observabilityの新料金](https://developers.cloudflare.com/observability/pricing/)
- [Budget Alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/)

## サービス詳細の全文HTMLとの統合（2026-10-14）

詳細HTMLは掲載対象の履歴を1回のbatchで取得し、製品読取を含め2呼出/3SQLを維持する。API・WebMCPは10記録/ページで、全文取得は外部入力から指定できない。全文は1,001 IDまで取得し、件数が1,000を超える場合はエラーとする。件数とページ送りも採用対象roleを対象キーで結合し、全製品viewの展開を避ける。更新日算出は本文取得のcount SQLへ含め、サイトマップの更新日取得は1SQLでまとめる。停止モード・8呼出/12SQL予算・共通レート制限を保持し、自動再試行と定期起動はない。

仮に詳細とサイトマップの関連SQL読取を保守的に各10万行/リクエストと置くと、1,000回で1億行、10倍で10億行、100倍で100億行、1,000倍で1,000億行。D1の含まれる枠を既に消費している場合の読取費はそれぞれ$0.10/$1/$10/$100で、Workers・CPU・ログ費は別。これは設計上の例で、走査行数やアカウント総額の厳密な上限を保証しない。新しい課金資源・DB書き込みはない。Nodeで停止・SQL予算・履歴件数の境界を確認し、全50件の結果を正本と照合する。
