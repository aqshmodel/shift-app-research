# Q08 T04/5 RosterElfの一般プラン課金人数とFlexの未確認条件

0限定公開質問完了・1正式資料待ち。未完941。作業コピーB61-20261013へ反映し、DB/FK/SQL往復・履歴/119価格行保持・再投入の冪等性を確認。

- [P02] 通常の月払いは最低3 active staff、年払いは最低10 seats。管理者/マネージャーも課金人数に含み、My Accountantから追加した1人の会計/助言者は除外する。
  - 出典: https://www.rosterelf.com/support/knowledge-base/billing-and-subscription/minimum-monthly-fee — minimum staff policy / FAQ admins and managers / 更新2026-09-07
  - 留保: 最低席数と実利用者数は別。Flex固有の契約最低人数に一般プランの閾値を自動適用しない。
- [P02] 料金FAQはログイン有無ではなくactive profileを数え、長期休暇・退職・inactiveを除外する。Flexは当月1シフト以上の職員を月10.60 AUD税別相当で課金し、SMS使用料を別とする。
  - 出典: https://www.rosterelf.com/pricing — 価格ページAUD/GST表示 / What counts as a user? / Flex FAQ
  - 留保: Flexの最低人数・SMS単価・課金契約周期は未公表。既存の料金行を保持し同じ単価行を重複追加しない。長期休暇の判定操作・兼務/複数拠点の数え方は実測なし。
- [P02] 年契約の設定画面で増席すると即時に課金される。先に席を買わず職員をactiveにした場合は5日後に照合し、残っていれば追加席を年契約残期間に比例して請求する。減席は次回請求日から適用される。
  - 出典: https://www.rosterelf.com/support/knowledge-base/billing-and-subscription/update-annual-plan-seats — Update annual plan seats / 手動増席・5日後照合・減席 / 更新2026-09-16
  - 留保: 手動増席の即時請求とactive職員追加後の猶予を混同しない。個別の端数/時刻/実請求例は未確認。
- [P02] Flexは料金表外の問い合わせ契約として説明され、通常月/年契約の最低人数をFlexへ適用する条項とSMS単価は確認した公開資料から確定できない。
  - 出典: https://www.rosterelf.com/pricing — Flex FAQ / 最低人数・年席変更・会計アクセスの4資料照合
  - 留保: SMS別課金という公表事実と単価不明を区別。正式Flex契約・SMS料金資料・請求例で再開。

元課題・受入条件・変更前後・再開条件はindividual-review.json、history-preservation.json、ledger.jsonを参照。閲覧2026-10-13。日付不明は取得日で補わない。独立製品試験0。
