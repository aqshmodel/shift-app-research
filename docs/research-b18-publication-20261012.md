# 第18バッチまでの本番反映

2026年10月12日、[本番サイト](https://shift.aqsh.co.jp/)を `B18-20261012-pub2` へ更新した。第13〜18バッチの174調査記録と6料金明細を追加し、公開件数は50サービス・2,037文書記録・277調査文書・118料金明細になった。

Lightning BoltとUKGの個別見積もり、シフト屋さんの年額料金、支援・認証・AI処理・APIベータ・予定機能の条件を反映した。料金概要と詳細は同じ公開版から表示する。今回の公開内容はB18で固定し、並行作業で追加されたB19のローカル成果も保持した。

## 反映と検証

現在の本番・検証D1を全件取得して差分を再作成し、検証環境での成功を確認してから本番へ適用した。1,397文の差分SQLは旧版・ハッシュ・変更前の値を照合する。初回import.sqlを既存D1へ再投入していない。各環境の全39調査テーブルが固定したB18正本と一致し、外部キー違反0件・整合性ok。過去の公開版もすべて保持した。

- ローカル67テストとAstro診断が成功。58ファイルのエラー・警告・ヒントは各0件。本番・検証用ビルドのWorker名・環境・D1 IDを照合した。
- 本番・検証APIで、全50サービスの料金概要・料金明細・詳細・課題・提供条件を照合した。
- 本番・検証の各38ブラウザテストが成功。検索・比較・料金・JavaScriptなしの操作・320〜1440px・同意・WebMCPを確認した。
- 本番62ページのHTTP、正規URL、title・説明文、構造化データ等は問題0件。

D1更新直後の一時的な503は、反映後の取得と照合で解消を確認した。本番Workerのアップロード後には管理APIのGETで504が出たが、新しいWorker版が100%で有効になったことを管理APIから確認し、重複アップロードせず検証を完了した。

## 公開版と復旧情報

本番Worker版は `d37dc4b5-ac5e-4a57-b0ba-98daae0a4759`、検証版は `84bb49c5-6375-4145-a82c-a6509321d880`。旧本番Worker版は `a0c0f88c-0fca-405e-84b1-50db44913cf7`、旧公開データ版は `B12-20261012-pub2`。反映直前の完全SQL、Time Travel bookmark、旧Worker情報はMacの `.release-backups/B18-20261012/` に保管し、Gitへ含めていない。

本番の研究SHA-256は `567e341dd479a91db582baf002478551d13a5bb40c1805529aaa3517a81075e6`、公開内容SHA-256は `d0048171ab7afdc9a3f2c1a17370862c20218048fd5112ce2d8107b3da20ddd1`。

今回の反映・検証量は直前に確認した既存のCloudflare利用枠内。GitHubは公開リポジトリの標準runnerで、artifact追加保存なし、キャッシュも無料枠内。Workers・PagesのGit自動ビルド連携はなく、料金プランを変更していない。内部の料金画面・運用記録はMacへ保持した。

根拠は [検証概要](research-b18-publication-verification-20261012.json)、[本番D1照合](research-b18-production-d1-verification-20261012.json)、[本番API照合](research-b18-production-api-verification-20261012.json)、[本番ブラウザ](research-b18-production-browser-verification-20261012.json)、[SEO検査](research-b18-production-seo-verification-20261012.json)、[旧公開版の保持](research-b18-production-preservation-20261012.json)。過去のバッチ報告にある未公開の記載は、その報告の作成時点を示す。
