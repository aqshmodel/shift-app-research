# Cloudflare課金異常への対応

## 発見と証拠保全

1. Manage Account → Billing → Billable Usageで、従量額・予測額・請求期間・対象サービスを確認する。固定料金と区別する。0表示も集計遅延を含む。
2. D1 Metricsでrows read/written、read/write queries、容量、時間別の山を確認する。24時間・7日・30日を比較し、公開/検証作業の日時と突き合わせる。
3. `wrangler d1 insights --help`で使用中の仕様を確認する。4.149.0では `wrangler d1 insights aqsh-shift-research --time-period 7d --sort-type sum --sort-by reads --limit 20 --json` が使える。insightsは一部のSQLの観測であり、D1 Metricsの総量と一致するとは限らない。
4. 時刻とタイムゾーン、請求画面、メトリクス、Query Insights、Workerの現行version ID、Cron/Alarm/Queueの状態、直前の変更を私有の証拠フォルダへ保存する。認証情報、個人情報、非公開ソースを公開PRへ貼らない。

## シフト比較サイトのD1停止

以下は課金対策コードの本番導入後に使用する。導入前のWorkerにはこのフラグが存在しないため、設定だけ追加しても停止しない。本番変更の承認を得てから実施する。

1. Worker `aqsh-shift-research`の現行version IDとbindingsを記録する。D1は削除・復元しない。
2. 検証済みのソースの `apps/web` に移動する。本番と検証を取り違えない。
3. `node scripts/deploy.mjs production paused` で構築・対象検査後に停止モードをデプロイする。元の設定ファイルは変更しない。検証なら `staging paused` とする。緊急時にDashboardから変数を変更する場合も、新しいWorker版のデプロイが必要である。反映は瞬時のグローバル停止を保証しない。
4. 公開ドメインの `/healthz` が200かつ `d1_access=paused`、トップ・APIが503/no-storeであることを少数のリクエストで確認する。APIをポーリングする自動リトライを追加しない。
5. D1 Metricsで新規利用が低下することを確認する。ただし集計遅延、既に実行中の処理、他の接続元のアクセスは残り得る。Worker変数だけでは管理APIからのSQLを止められない。

停止中は検索、詳細、比較、出典、API、WebMCP、DBを使うsitemapが利用不可になる。DB非依存のhealthと静的アセットは使える。既存キャッシュに保存された旧表示は最大300秒程度残り得る。データは維持する。

本番で停止テストを行わない。停止・復旧はローカルのモックまたは承認済みの検証環境で事前に確認する。

## 復旧とロールバック

原因SQL/ループを修正し、停止中のD1呼び出し0、失敗時の再試行上限、通常の検索・比較・詳細・出典・WebMCPを確認する。公開版IDと50製品、料金情報、出典履歴が停止前と一致するか調べる。復旧確認のために全表走査や再投入を行わない。

承認後、修正済み版を `node scripts/deploy.mjs production normal` でデプロイし、少数の通常操作とMetricsを確認する。全サイト障害なら、保存済みのWorker version IDへロールバックする。緊急停止前の版に戻すと防御が失われる場合があるため、版とフラグを確認する。DBのTime TravelやSQLでの公開版切替は別の承認が必要。

## 他サービス・Alarmの異常

Cronが0でもDurable Objects Alarmは独立して動作する。公開URLの遮断だけではAlarm、Queue、Service Bindingからの呼び出しを止められない。接続元とストレージ方式を確認し、対象Worker/DOの停止方法・データ保持・復旧版を準備してから承認を得る。リソースを見つけただけで削除しない。

## サポートと再発防止

Cloudflareへの問い合わせには、Account/DB/Workerの識別子、期間、請求ID、異常前後のMetrics、原因SQLのハッシュ、現行/修正版version、停止した時刻、再現テストと対策をまとめる。トークン、Cookie、秘密鍵、不要な利用者データを含めない。請求調整やクレジットは保証されない。

復旧後は公開コードの読み取り専用、共通制限、DB操作予算、停止フラグ、サンプリング、予算通知先を確認する。毎週の利用量レビューと公開前の10/100/1000倍シミュレーションを運用に含める。定期実行の自動化を新設する場合は、回数・コスト・通知先・停止方法を先に決める。
