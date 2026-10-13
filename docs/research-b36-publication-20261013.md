# 第36バッチまでの本番反映

2026年10月13日、[本番サイト](https://shift.aqsh.co.jp/)を `B36-20261013-pub2` へ更新した。B25〜B36の71文書記録を追加し、公開総数は50サービス・2,151文書記録・352調査文書・118料金明細。未確認、資料間の相反、契約・機能の適用境界を保持している。

本番・検証D1を全件取得し、現行B24から757文の差分SQLを再生成。旧版・件数・変更前の値を照合し、検証環境の成功後に本番へ適用した。初回import.sqlは再投入していない。全39調査テーブルが固定したB36正本と一致し、外部キー違反0件、整合性ok。過去の公開版と記録はすべて保持した。

大きな公開製品JSONを10万バイト以下のSQLへ分割する生成処理も含む。Unicode・引用符・中断再開・再適用・既存行保持を回帰テストで確認し、実D1から取得した全50詳細も正本と照合した。公開版の切替は全50行が完成した後に行う。画面・Workerの実行コードは現行と同じため、Worker・Pagesの重複デプロイは行っていない。

- 72テスト（研究14・Web Python36・Node22）、58ファイルの型検査、ビルドが成功。型のエラー・警告・ヒント0件。
- 本番・検証APIの全50料金・詳細・版・ハッシュが一致。
- 本番・検証で各38ブラウザケースが成功。skip・flaky・失敗0。検索・比較・料金・JavaScriptなし・同意・WebMCPを確認。
- 今回更新した4サービスを320・390・768・1440pxの計16表示で追加確認し、横幅のはみ出し0件。PC・スマホ8画像を保存。外部ロゴの配信可否は個別には検証していない。
- 本番62ページのHTTP、正規URL、メタ情報、H1、構造化データ等は問題0件。

更新直後の全件API検査で一時503が出たが、DBエクスポート完了後の再照合で全50サービスの成功を確認した。反映前の完全SQL、復元地点、有効Worker情報、費用確認と適用記録はMacの `.release-backups/B36-20261013/` に保存し、Gitへ含めていない。今回はB36で固定し、並行調査の後続成果を上書きしていない。

直前のCloudflare従量料金は0ドルで、今回の操作量は既存利用枠内。既存Workers Paidの基本料金を含む契約・プランは変更していない。GitHubは公開リポジトリの標準runner、artifact追加保存なし、キャッシュも利用枠内。Workers・PagesのGit自動ビルド連携はない。料金条件は [Workers](https://developers.cloudflare.com/workers/platform/pricing/)、[D1](https://developers.cloudflare.com/d1/platform/pricing/)、[GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions)で照合した。

根拠は [検証概要](research-b36-publication-verification-20261013.json)、[本番D1](research-b36-production-d1-verification-20261013.json)、[本番API](research-b36-production-api-verification-20261013.json)、[画面テスト](research-b36-production-browser-verification-20261013.json)、[追加表示確認](research-b36-production-capture-verification-20261013.json)、[SEO](research-b36-production-seo-verification-20261013.json)、[公開履歴の保持](research-b36-production-preservation-20261013.json)。各バッチ報告の未公開表記は、その報告作成時点を示す。
