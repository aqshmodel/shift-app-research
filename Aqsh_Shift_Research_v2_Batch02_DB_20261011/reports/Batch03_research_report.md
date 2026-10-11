# 第3バッチ追加調査・DB更新

この報告は第3バッチ時点の記録です。現在の件数・出力は[第4バッチ報告](Batch04_research_report.md)を参照してください。

調査日：2026年10月11日。公開一次資料の本文を確認し、製品・設問・提供範囲・出典の取得時点を対応付けて登録した。ログイン後の操作、見積取得、デモ、競合ソルバーの実行、独立性能試験は行っていない。

## 追加量と到達点

| 項目 | 第2バッチまで | 今回追加 | 累積 |
|---|---:|---:|---:|
| 製品・提供単位 | 50 | 0（24対象を追加調査） | 50 |
| 文書調査観測 | 704 | 236 | 940 |
| 共通40項目の資料採用枠 | 395 | 37 | 432 / 2,000 |
| 料金明細 | 62 | 3 | 65 |
| 出典取得履歴 | 99 | 33 | 132 |
| URL正規化後の文書識別子（設計資料含む） | 95 | 19 | 114 |
| 独立性能試験 | 0 | 0 | 0 |

追加236観測の内訳は、記載確認227、記載範囲で未確認6、矛盾3。資料採用37枠の増加に対し、今回失われた採用枠は0。部分確認・提供予定を含む文書の充足率であり、品質・実性能の点数ではない。共通40項目の残る1,568枠は未確定等。

資料を再取得した場合は新しい取得履歴を登録し、同一URLの出典を同一文書に結び付けた。旧版の「参照URL87件」は出典レコード等の集計で、厳密な正規化後の文書数とは一致しない。今回の文書観測に結び付く正規化URLは累積105件。数え方の異なる指標を差し引いて調査量にしない。

## 判断に影響する確認

**提供プランの変化。** PlandayはPlus/Pro向けの新Auto-schedule βを一部地域・顧客に展開している。履歴を使って勤務を生成し、公開前に確認できる。従来のPro向け自動作成との混同を避け、対象条件を残した。[公式ヘルプ](https://help.planday.com/en/articles/760172-how-to-generate-a-schedule-automatically-with-the-new-auto-schedule-beta-plus-pro)

**自動作成と提供範囲。** らくしふの大規模向け案内には自動作成が掲載されている。全プランの利用可否や最適化の仕組みは未確認。一方、Airシフトのワークスケジュールは、決まった勤務時間内の業務を割り当てる機能であり、月間勤務の自動作成とは区別した。[らくしふ](https://rakushifu.jp/)、[Airシフトのワークスケジュール](https://airregi.jp/shift/function/workschedule/)

**未公開の介護機能。** Naftyの特養・老健向け常勤換算はリリース前と明記されている。`planned`として登録。令和8年版様式9の有料アドオンの案内とは別に扱う。計算根拠の行政資料との照合は未実施。[介護向け機能](https://nafty.app/care/)、[様式9](https://nafty.app/youshiki9/)

**制約の強制と警告。** シフト屋さんAPIは条件ごとのhard/softを公開している。Deputyでは休息警告を表示しても管理者が配置を続ける例がある。日最大労働時間の窓は記事内で暦日／連続24時間の説明が相反し、矛盾として残した。警告を必須条件の保証とは扱わない。[API仕様案内](https://platform.shiftyasan.com/)、[Deputy疲労プロファイル](https://help.deputy.com/hc/en-au/articles/4658226793999-Set-up-stress-profiles-and-fatigue-management)

**料金とAPIの境界。** Humanityの年契約料金とプラン別自動割当、SSO、API追加オプションを確認し、年契約の月額相当2件と個別見積1件を料金明細に追加した。When I WorkのプランカードとFAQ、RosterLab米国ページの見出しと比較表には不一致が残り、解消扱いにしていない。[Humanity料金](https://tcpsoftware.com/pricing/)、[When I Work料金](https://wheniwork.com/pricing)、[RosterLab米国料金](https://rosterlab.com/us/pricing)

**運用・セキュリティ。** Shiftmationの操作ログは有料オプション。ConnecteamのSSO/2FAはOperations Enterprise欄で、Expert標準に昇格させない。oplusのログ・保存・バックアップ・障害対応は公式資料の自己申告として記録し、実測や契約保証とは区別した。各該当観測の留保と出典はDBから辿れる。

**海外の現行資料。** QGenda、Smartlinx、ShiftWizard、Patchwork Rota、Lightning Bolt、Humanity、Sonaについて、自己配置、交代、資格条件、需要情報、拠点横断表示、連携を追加確認した。ShiftWizardの旧モバイルページはHealthStreamの現行製品ページへ転送されるため、旧検索抜粋の認証・2020年予定を現行仕様にコピーしていない。OracleのClairvia連携資料も、Clairvia側の現行販売版の証拠には使わない。

## 残る確認

優先度1の課題は13件。公開資料で確認した範囲は進捗として残したが、対象全体を確認できない課題を完了にしていない。全課題は925件（未着手814、進行中33、阻害あり78）。

- 正式契約・見積：商用APIの再提供権とβ終了条件、Planday Proの最低料金、When I WorkとRosterLabの料金矛盾、施設解約時の設定・履歴搬出。
- 仕様・版：Planday βの対象顧客、Deputyの時間窓、Clairvia現行版、Nafty介護機能の公開時期。
- 本文取得：Quinyxの公式ヘルプ、シンクロシフトの本文。今回の取得失敗は非対応・サイト消失を意味しない。
- デモ・独立試験：不足を残す解の扱い、固定勤務の保持、再計算時の変更量、休憩中の資格人数、独立検算、実際の様式9算式。

優先課題の全文：[priority_followups.csv](priority_followups.csv)。採用枠の変化：[coverage_changes.csv](coverage_changes.csv)。今回の出典：[source_index.csv](source_index.csv)。全236観測：[B03-20261011.json](../batches/B03-20261011.json)。対象別件数：[research_stats.json](research_stats.json)。

## DBと検証

36テーブル・11ビューへ更新。元の観測・証拠・料金・採用履歴は保持し、提供単位別の最新参照、明示的な判断順序、URL単位の識別、検索用別名、課題の優先度・必要確認方法、索引を追加した。

SQLite整合性と外部キー、全件SQLの再取り込み同一性、9件の回帰検証を通過。Cloudflare公式Wrangler 4.149.0でローカルD1へ8,861命令を実行し、36アプリ用テーブルの全データと共通40項目の結果が一致した。生成列・ビュー・トリガーも含む。遠隔D1へは登録していない。

詳細は[DB設計](../DB_DESIGN.md)、[DB検証](db_validation.json)、[D1ローカル検証](d1_local_validation.json)を参照。閲覧HTMLは更新し、検索・地域・24対象の追加調査フィルタ、出典、4件比較をブラウザで確認する。
