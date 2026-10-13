# 第30バッチ調査報告（C04T02）

2026-10-13 UTC、Timefoldの未着手G04/F04を公式公開6資料（固定ESS1.35.x4・Platform latest2）で限定調査した。追加6記録（部分確認5・未確認1）。新しい観測根拠の調査文書は5件で、対照用Model input1件は登録文書の増加に含めるがresearch_documentsへ水増ししない。G04（TASK-RES01276）・F04（TASK-RES01272）を未着手から確認中へ変更、完了0・新規課題0・新料金0・制度追加0・独立製品試験0。

## 根拠と留保

- G04（部分確認）：計算済み勤務表のscore-analysisは保存された制約別スコアを取得できる。includeJustifications=trueを指定すると、各制約matchに関係する勤務・職員・時間帯などの具体的オブジェクトを返す例があり、省略時の概要だけの応答と区別する。

  留保：1.35.xの出力仕様。違反箇所の根拠であり、最小の矛盾制約集合や全体の解なし証明ではない。全制約のjustification形状・一意ID/参照完全性・JSONと説明の整合・商用プラン/顧客実行版は独立未検証。B03の手作成表採点一般は再登録しない。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/user-guide/score-analysis)

- G04（部分確認）：特定職員が特定勤務へ割り当てられなかった理由は、その割当を強制した仮の勤務表を作り、POST score-analysis?includeJustifications=trueで最良発見解と比較する方法を案内する。hard違反とsoft悪化を制約・対象オブジェクトへ結び付ける。

  留保：1.35.xの反実仮想比較手順で、元の結果から全代替案を自動列挙する証明ではない。仮の割当以外の入力/設定が同じかを管理する必要がある。局所最良/最良発見解と大域最適は別。最小矛盾集合・独立検算・未入力条件を含む法令適合は未確認。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/user-guide/score-analysis)

- G04（部分確認）：PlatformのScore analysisでは、制約が入力不足や未発火で無効になった場合にeffective weightを0と表示し、設定した重みと区別する。matchedフィルタはスコアに影響した制約、triggeredフィルタは有効だが罰点0の制約も表示する。

  留保：Platform latestのUI説明で固定ESS1.35.x仕様そのものではない。重み0を常に手動無効化とせず、matched一覧にないことを違反検査済みや未定義の証明にしない。API応答そのものが変更されたとの説明ではない。プラン・現行UI/実行版・独立動作未確認。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/how-tos/interpreting-model-run-results)

- G04（部分確認）：recommend-employeesはincludeJustifications=trueを任意に指定でき、省略時は候補別の全体スコア差・制約差・match件数差、指定時はmatchesDiff内に勤務IDとdescription等のjustificationを含む応答例を示す。

  留保：1.35.xの候補比較出力。maxNumberOfRecommendationsで候補数を制限するため全職員の不可能理由一覧ではない。JSON例のscoreDiffを使用し、本文のscoreDiffs表記と混ぜない。導入例の可用/不可用両配列と専用仕様の併用禁止は適用未整理で、実行可能な入力例として認証しない。最小原因集合・大域最適・独立試験なし。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/recommendations)

- G04（部分確認）：Assignability analysisは他の勤務が空という条件で、各勤務へhard違反なく割当可能な職員の割合を入力から計算する。0%はその勤務に資格を満たす職員がいない、0%超は少なくとも1候補と説明し、阻害するhard制約と職員を確認できる。

  留保：可視化はpreview・早期利用は問い合わせで、一般プランへ自動適用しない。各勤務に候補がいても全勤務の同時充足は保証しない。最適化後の結果検証や最小矛盾集合ではない。Include assignedの有効/無効の説明が同じ段落で相反し、フィルタ実動作は確定しない。API詳細スキーマ/独立実行なし。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/user-guide/assignability-analysis)

- F04（未確認）：Platformガイドの会話型計画は、顧客がAI agentで職員の質問や問題提起を受ける利用例である。対照の1.35.x Model inputはcontracts/globalRules等の構造化JSONを説明するが、会話を実際の最適化ルールへ変換する標準機能・入力仕様は取得範囲で確認できない。

  留保：自然言語で理由を聞くこと、条件JSONを開発者が作ること、標準製品で自然言語からルールを生成することを分離する。対照URL=https://docs.timefold.ai/employee-shift-scheduling/1.35.x/user-guide/input-datasets/model-input。解釈プレビュー、誤解/曖昧入力の拒否、修正/承認/取消履歴、日本語、対象プラン/版、外部LLM送信/学習条件は未確認。非対応とも標準ネイティブ提供とも判断しない。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/guides/validating-an-optimized-plan-with-explainable-ai)

## 版・条件と相反記述

ESS固定1.35.xのscore/recommendations/assignabilityとPlatform latestのUIガイドを別範囲として保存。固定文書のラベルは顧客の現行実行モデルの認定ではない。Assignabilityの可視化はpreview・早期利用は問い合わせで、プラン/顧客ごとの適用は未確認。問い合わせや試用はしていない。勤務ごとに他の勤務が空なら割当可能という評価を、全勤務の同時充足・最小矛盾集合・全体の解なし証明としない。機械可読justificationsと生成AIによる自由文、会話型の顧客実装と標準の自然言語ルール生成も同一にしない。

AssignabilityのInclude assignedは「有効ですべて、無効で未割当のみ」と説明した後に逆の説明が同じ段落へ現れる。Web本文と通常Chrome表示が一致したので抽出だけの誤りとはせず、誤記/別操作/別UI版のいずれかを推測しない。対象フィルタの実動作は未確定として、個別勤務の分析内容の部分確認と分けて保持。[固定仕様](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/user-guide/assignability-analysis)

Recommendationsの導入例はAnnへavailableTimeSpans/unavailableTimeSpans両配列を示すが、専用1.35.x Employee availabilityは同一職員の併用不可と明記。メインPOST例は不可用のみ。Recommendations特有の例外/誤記/別版のどれかは公開文書だけでは未整理。この例を有効な実行入力として認証せず、既存B25の可用記録を反復登録しない。本文scoreDiffsとJSON scoreDiffの表記も区別し、今回のフィールドはJSON例を採用した。[Recommendations](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/recommendations)、[可用仕様](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/employee-availability-and-preferences/employee-availability)

6登録資料のURL/版/locator/取得日/方法/留保/要約を保存。既存Availability1資料は相反照合だけでsource_revisionsへ追加せず、探索intro/user guide/検索結果も追加根拠数へ含めない。公開/更新日未表示。全文・本文ハッシュ・原本画像は未保存。サンプルAPI、AI agent、API specの認証操作、デモ、試用、問い合わせ、営業連絡なし。LLM送信/学習条件を未確認のまま保証しない。

## 検証・保護

67回帰（研究14・Web Python31・Node22）合格。B29から39表の既存全行保持（指定可変欄のみ更新）、DB整合性/外部キー/SQL往復、非null入力ハッシュ28バッチを確認。旧null B01/B02を検証済み入力件数にしない。50料金はB29から不変、118明細・Timefold構造化価格0を保持。50詳細はSQLite投影で再照合し、今回の採用5件とF04のunknown/context_count2（既存placeholder+今回未確認）を保持。ライブAPI検査ではない。

静的比較のPC1440/スマホ390pxで追加6ID、6リンク/5新規直接URL、F04未確認、固定ESS/Platform latestの版境界、最小原因集合/同時充足の留保、preview/フィルタ相反、B29履歴、旧料金未知を確認。文書/詳細横幅超過なし、consoleエラー/警告0。CUAスクリーンショットは出力で目視し原本保存なし。viewport解除、検証用タブと一時127.0.0.1サーバー停止。実装変更なしのため型・両ビルド・隔離ローカルD1/API・全ブラウザ/SEOはC04T05で包括確認する。

ローカルB29→B30は176文、保存B18→B30は854文でSQL往復/旧公開行保持合格。現行本番完全エクスポートに基づく適用差分ではないため、反映担当は最新baselineから作り直す。空DB向けd1/import.sqlを既存D1へ再投入しない。累積50提供単位、2,117記録、327調査文書、118料金明細、39表・12ビュー、制度17・独立試験0。未着手656→654、確認中244→246、停止78・完了2、未完978、優先度1未完29。資料採用609→610/2,000は部分採用で、完了・品質点数ではない。

開始698ファイルをバックアップし、C04T01最終inventoryと全ハッシュ一致。反映前にHEAD/対象ハッシュ/他者変更を再照合し、対象だけ正本へ反映する。既存未コミット成果・並行45ファイル・root/Web README保留を保持。耐久バックアップ/ログは.local/research-backups/C04T02。復旧は後続変更を照合して対象だけ戻し、Git reset/clean・共有DB初期化・後続DBの全体巻き戻しをしない。

旧費用確認と本人報告のみ参照、今回アカウント費用/使用量の再確認なし。インストール・課金API・プラン/予算/認証/権限変更・外部連絡・コミット/プッシュ/CI/デプロイ/遠隔DB操作なし。本番B18は本人報告として把握し再監査せず、その後の公開版を推測しない。本番反映はユーザー担当。

## 次候補・停止

C04は2/5でT03以降は親の指示待ち。候補はTimefold未着手N01（TASK-RES01293）/K03（TASK-RES01288）。公式のmember roles/API key scope・設定/統合手順を調べ、テナントとモデルへの認可、業務部署タグとの違い、設定主体/顧客側実装/契約支援の境界を限定確認。実認証/権限変更・非公開契約だけの巡回はしない。親の高優先対象指定を優先する。T05も実質追加調査を含め包括検証とdocs/checkpoints/C04/引き継ぎを作り、5/5で停止する。
