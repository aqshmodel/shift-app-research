# 第24バッチまでの本番反映

2026年10月13日、[本番サイト](https://shift.aqsh.co.jp/)を `B24-20261012-pub2` へ更新した。B19〜B24の43調査記録を追加し、公開総数は50サービス・2,080文書記録・304調査文書・118料金明細。調査基準日は2026年10月12日。

Smartlinx、Rotageek、Timefold、RosterElf、ShiftWizard、SHIFTEEの提供・支援・契約条件等を補完した。料金明細の追加はなく、全50サービスの料金概要はB18と同じ。資料間の相反、未確認、プラン・契約の限定を保持している。長い出典URLがスマホの調査履歴で横幅を超えたため、本文の折り返しも反映した。

## 反映と検証

本番と検証D1を直前に全件取得し、B18→B23の449文、B23→B24の188文を再生成した。旧版・件数・変更前の値を照合する差分を検証環境で確認してから本番へ適用。初回import.sqlは再投入していない。B24の全39調査テーブルが固定した正本と一致し、外部キー違反0件、整合性ok。過去の公開6版・300製品行・366用途行を保持した。

- 研究14・Web Python31・Node22の67テストと、58ファイルの型検査が成功。B24追加後には研究14テストと公開投影の生成を再確認。表示コードはB23で検証したものと同じ。
- 本番・検証APIで全50サービスの料金概要・料金明細・詳細・版・ハッシュが一致。
- B24の本番・検証で各38ブラウザケースが成功。skip・flaky・失敗は0。検索、比較、JavaScriptなし、料金、同意、WebMCPを確認。
- 今回調査した6サービスを320・390・768・1440pxで追加確認し、横幅のはみ出し0件。調査履歴の本文にURLの折り返しが適用されていることを確認。外部ロゴの配信可否は個別には検証していない。
- 本番62ページのHTTP、正規URL、title・説明文・H1、構造化データ等は問題0件。

B23のD1更新直後に一時的な503が出たが、準備完了を待って200と全件一致を確認。B24は同じWorkerコードを使うデータ追加のため、Workerの重複アップロードは行わなかった。並行する後続のローカル調査は保持し、今回の公開版はB24で固定した。

## 公開版・復旧・費用

本番Worker版は `8c9b350a-538f-4d33-9bf3-721083efac82`、検証版は `f5d81634-2c81-4cc7-8500-608ac6b79c5a`。反映前のWorker版、完全SQL、復元地点、適用記録はMacの `.release-backups/B23-20261013/` と `.release-backups/B24-20261013/` に保存し、Gitへ含めていない。

今回の操作量は直前に確認した既存Cloudflare利用枠内。料金プラン変更なし。GitHubは公開リポジトリの標準runnerを使用し、artifact追加保存なし、キャッシュも利用枠内。Workers・PagesのGit自動ビルド連携はない。確認した料金条件は [Workers](https://developers.cloudflare.com/workers/platform/pricing/)、[D1](https://developers.cloudflare.com/d1/platform/pricing/)、[GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions)。内部の料金画面・診断はMacへ保管。

根拠は [検証概要](research-b24-publication-verification-20261013.json)、[本番D1](research-b24-production-d1-verification-20261013.json)、[本番API](research-b24-production-api-verification-20261013.json)、[本番ブラウザ](research-b24-production-browser-verification-20261013.json)、[表示追加確認](research-b24-production-capture-verification-20261013.json)、[SEO](research-b24-production-seo-verification-20261013.json)、[旧公開版の保持](research-b24-production-preservation-20261013.json)。各調査報告の「未公開」は、その報告作成時点の状態を示す。
