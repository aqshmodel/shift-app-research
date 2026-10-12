# 第8バッチ：未完了課題の継続調査

> 公開状況の追記（2026年10月12日）：第8〜12バッチは本番に反映済みです。以下の本番未反映の記述・検証JSONは調査作成時点の状態を保持しています。現在の公開状況は [本番反映記録](../../docs/research-b12-publication-20261012.md) を参照してください。

追補と最新のデータ・検証状況は [第9バッチ調査報告](Batch09_research_report.md)。第8バッチの課題進捗2件は第9バッチで訂正し、元のバッチ・記録は保持した。

2026年10月12日、10サービスの公開一次資料24件を確認し、51記録を追加した。内訳は資料で確認37、記載未確認8、資料の不一致6。Airシフトの業務割当を勤務表自動割当から分ける分類訂正も1件追加した。

正本DBは50提供単位、1,716文書記録、199調査文書、88料金明細、制度参照17件。文書記録の増分52件には、51件の追加調査と1件の分類訂正記録が含まれる。共通40項目の資料採用は523/2,000枠。未解消の矛盾と分類訂正を反映した結果であり、対応率や性能の点数ではない。

## 今回確認できたこと

| サービス | 確認結果と比較時の留意点 | 一次資料 |
| --- | --- | --- |
| シンクロシフト | 公開後の修正は職員アプリへ自動反映されず、再度の展開が必要。希望休の申請状態にも変更通知はない。信頼済みデバイスは30日間コード入力を省略できる。システム管理者の解除不可という説明とメール削除・アプリ解除の説明の適用範囲は未確定。 | [展開手順](https://support.synchroshift.jp/portal/ja/kb/articles/1076)、[希望休](https://support.synchroshift.jp/portal/ja/kb/articles/1037)、[PC認証](https://support.synchroshift.jp/portal/ja/kb/articles/1008)、[アプリ認証](https://support.synchroshift.jp/portal/ja/kb/articles/1009) |
| らくしふ | 人数・役割・禁止条件・優先順位による勤務表の自動割当を確認。自動作成は2タイプで、提供機能と料金が異なる。一般契約への内包と具体的な追加費用は未確認。 | [自動作成](https://rakushifu.jp/function/ai-gen/)、[資料の内容](https://rakushifu.jp/info-download/) |
| Airシフト | 希望シフトの自動下書き化、固定シフトからの下書き、管理者による手動作成・依頼・確定通知を分けて確認。複数グループの自動下書きはメイングループだけ。ワークスケジュールは作成済みシフト内の業務割当。勤務表全体の自動最適化は引き続き記載未確認。 | [自動下書き](https://faq.airshift.jp/hc/ja/articles/50609646888857-%E5%B8%8C%E6%9C%9B%E3%82%B7%E3%83%95%E3%83%88%E3%82%92%E8%87%AA%E5%8B%95%E3%81%A7%E4%B8%8B%E6%9B%B8%E3%81%8D%E3%82%B7%E3%83%95%E3%83%88%E3%81%AB%E3%81%99%E3%82%8B-%E3%81%97%E3%81%AA%E3%81%84)、[業務割当](https://airregi.jp/shift/function/workschedule/) |
| シフト屋さん Public API / MCP | 無料βで、正式料金は準備中。公式MCP READMEは、受理しても適用しない制約を3種類挙げる。MCPクライアントのMIT表示と、API・最適化本体の利用権は別に扱う。 | [公開API](https://platform.shiftyasan.com/)、[公式README](https://github.com/shiftyasan/mcp-server)、[一般規約](https://shiftyasan.com/terms) |
| Deputy Core | 一般記事の冒頭は暦日、詳細は任意の24時間という不一致を確認。Enterprise記事は24時間窓。夜間休息と全シフト間のgap、管理者の警告上書き、予定時間と給与・実績の違いを追加した。Enterpriseの説明をCore契約へ拡張しない。 | [一般のStress Profile](https://help.deputy.com/hc/en-au/articles/4658226793999-Set-up-stress-profiles-and-fatigue-management)、[Enterprise](https://help.deputy.com/hc/en-au/articles/4755140064911-Enterprise-Stress-profiles-and-employee-set-up) |
| Lantum In-Genius Rota | Whittington Health自身による小児科の試行報告を取得。3施設・2 on-call拠点、各医師の休暇希望の70〜100%（平均90%）、臨時職員費用65,000削減の記載がある。試行年・希望件数分母・費用の比較基準がなく、取得本文の通貨記号も文字化けしているため通貨は確定しない。 | [導入病院の発信](https://www.whittington.nhs.uk/default.asp?c=45969) |
| When I Work | 管理者を含む課金人数、PremiumのAPI・Webhook・SAML/SSOを追加確認。EssentialsカードとFAQの複数拠点・勤怠含有の差は未解消。 | [料金・FAQ](https://wheniwork.com/pricing) |
| RosterLab AI | 米国向けページ内に15 USD/人/月のカードと20 USD/userの比較表が同時にある。課金対象はAI勤務表に含まれる職員で、勤務表に含まれない管理者は無料。現行適用額・最低人数・請求周期は未確定。 | [米国向け料金](https://rosterlab.com/us/pricing) |
| Connecteam Operations Hub Expert | 2つの公式ヘルプで全管理者のダッシュボード2FA設定を確認。Basicから利用可能とするヘルプと、Enterprise欄に掲載する料金表の差は残る。Expert契約の適用、解除・復旧・既存セッションは未確認。 | [2FA](https://help.connecteam.com/en/articles/3112479-two-factor-authentication-2fa)、[Security Settings](https://help.connecteam.com/en/articles/6435553-set-your-app-s-security-settings)、[料金](https://connecteam.com/pricing/) |
| Planday | 契約書は1件ずつ、プロフィール添付は一覧だけ、シフト履歴は画面閲覧という出力境界を確認。全設定・全添付・履歴を再構成できる一括dumpは未確認。解約後120日以内の削除は、120日間のアクセス保証とは扱わない。 | [出力手順](https://help.planday.com/en/articles/30428-how-to-access-and-export-your-data)、[解約手順](https://help.planday.com/en/articles/30211-how-to-cancel-your-planday-subscription) |

## 課題の完了と残る確認

優先度1の課題12件に進捗を追記した。らくしふの「希望転記の先に全体の自動割当があるか」は、公式の機能説明で確認できたため、資料に記載された存在確認として完了にした。契約内包・料金・生成結果の品質まで完了にしたものではない。タイプ別の料金確認を優先度2の別課題として登録した。

シフト屋さんには、MCP READMEが未適用とする `avoided_shift`、`working_days_per_week.max`、`employee_pairings.require` を現行APIの生成結果と警告で照合する優先度2の課題を追加した。APIのスキーマが受理することと、最適化時に制約を実施することは分けて検証する。

優先度1の未完了課題は30件から29件になった。必要な確認方法は次のとおり。

| 確認方法 | 件数 | 残る確認の例 |
| --- | ---: | --- |
| 販売元の仕様・契約資料 | 16 | MFAの適用プラン・解除・復旧、様式9の製品内採用版、解約出力の形式・期限 |
| 現行見積 | 4 | 自動作成に必要な機能・人数・地域・請求周期・初期費用を揃えた価格 |
| 合成データによる試験 | 4 | 様式9境界値、最適化器と独立した違反照合、解約データの件数・再構成 |
| 権限別デモ | 3 | 公開後修正・通知・確認記録、管理者認証の解除可否、許容違反の範囲 |
| 利用施設側の追加資料 | 1 | Lantumの試行年・費用比較・休暇希望の件数分母 |
| 公開資料 | 1 | Nafty常勤換算の正式公開日と医療様式9との提供範囲 |

一般的な設問の未着手課題779件もDBに残る。今回の10サービスを調べたことを、全50サービス・全設問の調査完了とは扱わない。独立試験は14シナリオを設計済み、実施結果は0件。営業連絡、会員登録、個別見積の取得は行っていない。

## 分類訂正・出典の扱い

Airシフトの `B07-20261011-OBS0024` は、作成済み勤務表に対する業務割当の説明だった。原観測を保持してB04へ訂正記録を追加し、B01の採用根拠から外した。調査DBと公開用データの両方で、勤務表全体の自動割当を記載未確認として保持する。

シンクロシフトの出力フィルタ記事、シフト屋さんのLICENSE原文、QuinyxのMFA記事は今回の本文取得が失敗した。検索抜粋だけの内容は新しい機能観測に採用していない。取得失敗は提供終了・非対応の証拠にはしない。シフト屋さんのMITは公式READMEの表示確認に限る。

出典URL、取得日、原文位置、適用範囲、未確認事項は [B08入力](../batches/B08-20261012.json) とDBに保存した。本文の全文・画像は保存していない。資料の公開日・更新日は、ページに明記された場合だけ保存し、検索エンジンの取得日から推測していない。

## 更新ファイルと検証

正本DB、D1初回登録用SQL、静的比較画面、統計・出典・課題一覧、公開用データを再生成した。公開用データの更新日が2026-10-11に固定されていた処理も、最新の調査バッチの基準日を取得するよう修正した。各出典の取得日は個別に保持している。

検証結果は [B08検証記録](batch08_validation.json)、[DB検証](db_validation_batch08.json)、[履歴保持](batch08_history_preservation.json) に保存した。DBの整合性、外部キー、SQL再読込一致、全バッチからの再構築、過去の観測・出典・判断履歴の保持を確認した。

公開用スナップショットは `B08-20261012-pub2`。研究データSHA-256は `3b8a9af033ac5cd7d2cf92db603a4e320f070a32fe2731618bd8f83fd0fca758`。更新対象はローカルの調査パッケージと公開用データで、今回の追加調査を本番D1・公開サイトへ反映する作業は実施していない。`d1/import.sql` は空DBへの初回登録専用であり、既存の本番D1へ再投入しない。
