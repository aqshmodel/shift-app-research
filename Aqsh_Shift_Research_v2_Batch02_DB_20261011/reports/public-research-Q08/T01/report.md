# Q08 T01/5 Nursegrid Managerと無料個人アプリ・役割別機能の境界

1限定公開質問完了・0正式資料待ち。未完943。作業コピーB58-20261013へ反映し、DB/FK/SQL往復・履歴/119価格行保持・再投入の冪等性を確認。

- [B07] Managerは組織の勤務表作成・配布、自己申請・交代承認、Nursegrid Appとの連携を案内し、スタッフ1人月5ドルの利用料金と30日試用を表示する。
  - 出典: https://nursegrid.com/for-organizations/nursegrid-manager/ — Managerの機能紹介 / Why Nursegrid manager / FAQ料金 / 30日試用
  - 留保: 通常の組織利用と無料試用を分ける。ドル通貨記号・税・請求/最低契約の個別適用はこの機能確認では確定しない。自動最適化の証明ではない。
- [B07] 個人向けNursegrid Appは、看護師・医療従事者に無料と明記し、個人カレンダー、同僚との比較/交代、資格情報の管理を紹介する。
  - 出典: https://nursegrid.com/for-nurses/nursegrid-app/ — Appの機能 / FAQ「Is the app really free?」
  - 留保: 個人アプリ無料をManagerの組織契約無料に読み替えない。Learnの講座/CEやTalentは別サービス。
- [B07] ManagerヘルプはRestricted Userに空きシフトが届かないと明記する。ヘルプ全体の注意は一部機能が追加または役割別で、利用できない場合があると示す。
  - 出典: https://healthstreamhelp.mcoutput.com/nursegridmanager/Content/NG_Manager/User_Management/Restricted_Users.htm — Restricted Users本文 / optional or role-specific共通注意 / 更新9/9/2025
  - 留保: Restricted Userを無料アカウントや一般の権限階層と同一視しない。全機能のプラン別包含・現在の契約版は不明。
- [B07] Schedule Builderは最大6週間の草案と自己申請の設定を説明する。必要人数欄の空白は申請人数無制限、0は申請禁止と区別する。
  - 出典: https://healthstreamhelp.mcoutput.com/nursegridmanager/Content/NG_Manager/Schedule_Mgmt/Creating_a_Draft_Schedule_with_the_Schedule_Builder.htm — Schedule Builder / self-schedulingのcoverage欄 / 更新9/9/2025
  - 留保: 利用者の自己申請枠の仕様。未入力を必要人数0や無限の職員登録としない。勤務表自動最適化・現在プラン包含・動作検証とは別。

元課題・受入条件・変更前後・再開条件はindividual-review.json、history-preservation.json、ledger.jsonを参照。閲覧2026-10-13。日付不明は取得日で補わない。独立製品試験0。
