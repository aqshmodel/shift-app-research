# Aqsh シフト管理サービス調査

シフト管理・自動作成サービスの公開一次資料を整理した調査DBです。2026年10月11日時点で、**50提供単位、1,664文書記録、88料金明細、ロゴ50件、制度参照17件**を収録しています。未確認事項、資料間の矛盾、提供予定、契約・地域・プランの限定を区別して保持しています。

調査データとツールは [Aqsh_Shift_Research_v2_Batch02_DB_20261011](Aqsh_Shift_Research_v2_Batch02_DB_20261011/) にあります。

無料・会員登録不要の公開サイト **Aqsh シフト比較（shift.aqsh.co.jp）** に向けた[追加調査・Webアプリ開発・公開計画](docs/webapp-plan-20261011.md)を作成しました。アプリ実装と本番・検証D1の登録を完了しました。Cloudflare Pagesの公開入口からWorkersへ接続します。公開状況は [公開報告](docs/deployment-20261011.md) を参照してください。

| ファイル | 用途 |
|---|---|
| [調査パッケージのREADME](Aqsh_Shift_Research_v2_Batch02_DB_20261011/README.md) | 調査の読み方、DBの再作成・更新、D1への登録手順 |
| [比較・検索画面](Aqsh_Shift_Research_v2_Batch02_DB_20261011/comparison.html) | ダウンロード後、ブラウザで開ける静的な閲覧画面 |
| [正本DB](Aqsh_Shift_Research_v2_Batch02_DB_20261011/research.sqlite3) | 出典と判断履歴を含むSQLite DB |
| [DB設計書](Aqsh_Shift_Research_v2_Batch02_DB_20261011/DB_DESIGN.md) | Cloudflare D1向けのテーブル・ビュー設計 |
| [D1初回登録用SQL](Aqsh_Shift_Research_v2_Batch02_DB_20261011/d1/import.sql) | 空のD1にスキーマと全データを登録するSQL |
| [最新の調査報告](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/Batch07_research_report.md) | 様式9算式、管理者MFA、解約時の出力、分類訂正と残課題 |
| [制度の参照データ](Aqsh_Shift_Research_v2_Batch02_DB_20261011/reports/regulation_index.csv) | 様式9の式・除外・丸め・集計期間。製品の実装証拠とは別に保存 |

## ローカルで確認する

```sh
cd Aqsh_Shift_Research_v2_Batch02_DB_20261011
python3 -m unittest discover -s tools -p 'test_*.py' -v
```

DBの再作成・検証にはPython 3の標準ライブラリを使います。元資料のZIPと追加バッチJSONを残しているため、DBを再作成できます。画面テストには別途Node.js、Playwright、Chromeが必要です。

DB、D1用SQL、閲覧画面、出典、調査バッチ、検証記録をGitで管理します。キャッシュ、依存ライブラリ、仮想環境、認証情報を含む環境ファイル、SQLiteの一時ファイルは `.gitignore` で除外しています。`manifest.json` は調査パッケージ内の配布ファイルのサイズとSHA-256を記録しています。

本番・検証D1への登録と全件照合の記録を含みます。公開資料での確認と、独立した動作・性能試験の結果は区別しています。

Webアプリの開発・検証・復旧手順は [apps/web/README.md](apps/web/README.md)。GitHub ActionsはDB再構築・原本保持・公開投影・ツール契約・型・ビルドの検証だけを行い、本番認証情報を保持しません。
