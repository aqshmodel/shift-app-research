# 第25バッチ調査報告（C03T02）

2026-10-12 UTC、Timefold Employee Shift Scheduling APIの未着手C02/C05/E01/F01を限定調査した。7固定1.35.x仕様本文とmutable latestの勤務間隔対照1資料から8記録を追加（文書の部分確認8）。新しい調査文書は7件、登録出典取得8件。カテゴリ・intro・他の探索ページは追加根拠数へ含めない。C02の支援・請求条件やB03の自己割当・変更抑制・ライフサイクルは重複追加しない。

| 設問 | 追加根拠 | 未確認範囲・出典 |
|---|---|---|
| C02 | 期間・rolling windowのルールは、既定のSTART_ONLYでは勤務開始が対象期間内のシフトを数え、前日に始まって翌朝終わる夜勤を翌日の制限に含めないと説明する。periodShiftOverlapKindをSTART_AND_ENDへ変えると、対象期間に重なる夜勤の部分もルールの集計へ含める。 | 1.35.xの期間ルールの集計挙動。職員の明け勤務という別コード・勤務日数の二重計数・給与上の日付帰属を確定しない。分数と日数の集計を一律に同じ計数へ読み替えず、設定対象のルールを特定する必要がある。DST・月境界・最小単位・丸めの製品試験なし。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/work-limits/days-worked-per-period) |
| C02 | minutesWorkedLimit.countOnlyBetweenは日内の指定時間帯と勤務が重なる分だけを数える。開始時刻を含み終了時刻を含まず、終了が開始より前なら22:00〜06:00のように翌日へ跨ぐ。職員のタイムゾーンで解釈し、複数日に跨ぐ勤務は各日で重なりを計算する。 | 1.35.xの特定時間帯の勤務分数制限。夜勤という名称だけで法令の深夜時間を自動設定するとはしない。periodShiftOverlapKindとの組合せ、DSTの重複/欠落時刻、時差変更、丸め、明け後休日の自動生成は未検証。日本の行政・給与算式の適合を示すものではない。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/work-limits/minutes-worked-per-period) |
| C05 | minutesBetweenShiftsRulesは前勤務の終了から後勤務の開始までの分数に最小・最大を設定し、REQUIREDではhard、PREFERREDではsoft制約にする。既定はREQUIRED。scope.durationは前終了＋期間を超えて始まる後勤務との組を除外し、前後の勤務タグでも対象を限定できる。 | 1.35.xのAPI契約モデル内のルールで商用ライセンス契約ではない。例の720分・1440分は法定値や製品固定値ではない。08:00終了と720分の例は20:00以降を許すと説明するが、scopeちょうどの境界、秒精度・重複勤務・計画窓外の前後勤務・pinned例外は独立未検証。タグinclude/excludeの同じ側での併用不可とALL既定を保持。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/shift-rotations-and-patterns/minutes-between-shifts) |
| C05 | 1.35.xのabsenceModeはABSENCE_UNAWAREが既定で勤務間の経過時間を比較する。previewのABSENCE_AWAREはavailableTimeSpansまたはunavailableTimeSpansから不可用分を除き、最小休息の充足にも最大間隔の超過にもその分を数えないと説明する。 | previewは変更対象で安定版の普遍仕様・全顧客で利用可能とはしない。1.35.xは文字列だがlatest対照はtypeを含むオブジェクトとspan.tagsフィルタで、入力形式を混ぜない。対照URL=https://docs.timefold.ai/employee-shift-scheduling/latest/employee-resource-constraints/shift-rotations-and-patterns/minutes-between-shifts。現行実行モデル、移行・既存入力互換、除外時のscope計算と境界実動作は未確認。休暇を休息時間から除くことが日本法で必要と判断しない。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/shift-rotations-and-patterns/minutes-between-shifts) |
| E01 | availableTimeSpansは列挙した期間だけ利用可能、unavailableTimeSpansは列挙した期間だけ利用不可とし、同一職員で両方は使えない。期間は日跨ぎで指定でき終了端はexclusive。不可用との重なりや利用可能期間で覆われない勤務分にはhard制約を適用し、例は必須シフトを未割当にして不可用を守る。 | 1.35.xの可用入力とhard制約。確定済み休暇を不可用へ変換する方法は実装側で設計する必要があり、申請・承認・取消・権限・休暇種類の完成済みワークフローがあるとはしない。明示不可用を単なるsoft希望へ変換しない。既定は不可用指定がなければ勤務可能。タグフィルタの適用漏れと境界の実試験なし。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/employee-availability-and-preferences/employee-availability) |
| E01 | preferredTimeSpansとunpreferredTimeSpansはsoftの勤務希望で、働きたくない期間でも必要なら割当され得る。勤務と希望期間が重なる分数に、期間の重みと職員priority multiplierを掛けて報酬または罰点を付ける。期間の重みは省略時1、指定時は1以上の整数として説明する。 | 1.35.xの希望入力。希望休と確定不可用・有給休暇の承認状態を同一にしない。priorityや重みの大小から希望の全実現・公平性・法令遵守を保証しない。役割・技能・他制約と競合する。希望の収集UI・権限・取消履歴・分母を用いた実現率の独立試験なし。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/employee-availability-and-preferences/employee-preferences) |
| F01 | 制約をhard・medium・softに分け、hard違反はinfeasible、mediumは必須シフトをできるだけ割り当て、softは業務目標を改善すると説明する。hard違反0の解はsoftが低くてもhard違反のある解より良い。スコア値は違反の件数そのものではなく、重み×match scoreで評価する。 | 1.35.xのスコア定義。mandatoryというラベルだけで全シフト充足をhardと判断しない。未割当を含むfeasibleと需要充足・最適性・解なし証明は別。0hardだけで日本の法令・未入力条件を満たすとは保証しない。既存B03の自己割当と変更抑制の一般相反は重複追加せず、今回の三段階定義を補足。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/user-guide/constraints) |
| F01 | 休暇前後のavoidShiftCloseToDayOffRequestRulesは前日の避けるタグと翌日の避けるタグを別々に設定する。PROHIBITEDはhardで違反する割当を避け、UNPREFERREDはsoftで罰点を付けつつ割当され得る。省略時はPROHIBITED、タグのALL/ANYは省略時ALLで、片側のタグがなければその側に効果はない。 | 1.35.xの休暇周辺勤務ルール。休暇自体は職員のavailabilityで定義する説明。夜勤明けの休日を自動作成する完成済み日本向けパターンとはしない。0:00境界へ跨ぐ勤務、部分休・連続休、前後の暦日と職員timezoneの関係、タグ設定漏れ、例外承認は未検証。独立API試験なし。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/time-off/avoid-shifts-close-to-day-off-requests) |

4課題を未着手から確認中へ移し、`TASK-RES01264`（C02）、`TASK-RES01265`（C05）、`TASK-RES01268`（E01）、`TASK-RES01271`（F01）へ進捗を保存。完了0・新規課題0・価格明細追加0・制度追加0・独立製品試験0。資料上のknownは記載された範囲の確認で、境界条件試験や設問の全体完了ではない。

## 版・定義と適用範囲

1.35.xを根拠の版として固定し、latestがその時点の実行モデルや顧客の契約版であるとは判断しない。latestの版メニューは取得したページで1.35/1.34/1.33等の差があり、更新日・現行実行版の代替証拠にしない。勤務間隔previewの1.35.xはabsenceMode文字列、latest対照はtypeを含むオブジェクトとspan.tagsフィルタを説明する。この版差を仕様相反と扱わず、混在入力の互換性も推測しない。[1.35.x](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/shift-rotations-and-patterns/minutes-between-shifts)、[latest対照](https://docs.timefold.ai/employee-shift-scheduling/latest/employee-resource-constraints/shift-rotations-and-patterns/minutes-between-shifts)

時刻端点を含む/含まない、開始日に帰属する/重なりを含む、最小休息/最大間隔/scope、不可用hard/希望soft、mandatory medium/全充足、0hard/法令認定を区別する。API入力のcontractsは勤務ルールのモデルで商用APIの価格・契約条項ではない。例の720分・1440分、2027年勤務日、過去のsubmitDateTimeを法定値・改定日・独立実験結果へ読み替えない。日本の夜勤明け・有給承認・行政/給与算式は実装や別検証が必要。

## 検証

研究14・Web Python31・Node22の67回帰が合格。DB整合性・外部キー・SQL往復、B24から39表の全既存行保持（限定した可変欄のみ更新）、ingest_sha256を持つ23バッチの入力ハッシュ、50サービスの料金サマリー不変と公開投影50詳細を確認。118価格明細を保持し、Timefoldは構造化価格0のまま。PC1440/スマホ390pxで追加8ID・固定版出典8リンク・preview・入力形式差・各留保・旧履歴と横幅を確認。返されたconsoleエラー/警告0。一時localhostサーバーは停止。

実装変更がないため型・両ビルド・実ローカルD1/API・全ブラウザを本ターンでは追加実行せずT05で包括確認する。全50詳細はSQLite公開投影の検査でライブAPI検査ではない。仕様本文は要約・版・URL・locatorを保存したが全文・本文ハッシュ・原本画像は未保存。公開/更新日未表示。認証キー作成・サンプルAPI実行・試用・外部連絡は未実施。

ローカルB24→B25（200文）と保存B18→B25（599文）の差分はSQL往復・旧公開行保持を検証。本番の最新エクスポートから生成していない比較差分で、反映担当は現行完全エクスポートから作り直す。空DB向けd1/import.sqlを既存DBへ再投入しない。コミット・プッシュ・CI・デプロイ・本番DB・認証変更・追加課金なし。本番B18はユーザー報告のみで再監査せず、その後の公開版を推測しない。

累積50提供単位、2,088文書記録、311調査文書、118価格明細、39表・12ビュー。未着手670→666、確認中230→234、停止78・完了2、未完了978、優先度1未完了29。共通資料採用598→602/2,000は部分採用で、品質点数・課題完了ではない。

## 保持・接続通知・次対象

開始時566ファイルをバックアップ。反映直前にHEAD・対象ハッシュ・他者変更を照合し、対象だけ正本へ反映する。T01最終566ファイルのハッシュは着手時一致。既存20ファイルとroot/Web READMEの保留は継続。バックアップ・ログは `.local/research-backups/C03T02`、変更・復旧は `docs/research-turns/C03T02-local-apply.json`。

Mac一時切断通知に対し、既存の実行プロセス・予約・バックアップ・作業用DBを確認。処理は続行しており、重複起動・未保存・登録の重複・停止は確認されなかった。影響確認のためにauthorやingestを再実行していない。

T03候補はoplus（OF-JP18）の未着手E01/H01/N01、`TASK-RES00778/00788/00797`。公式機能別ヘルプ・公開資料で、希望提出と確定休暇、固定勤務入力と自動作成中の固定、閲覧/操作の権限を区別する。公開本文が不足すれば未確認を保持し契約巡回だけで増やさない。T03以降は親の指示待ち。T05にも実質追加調査を含め包括検証・引き継ぎ後5/5で停止する。
