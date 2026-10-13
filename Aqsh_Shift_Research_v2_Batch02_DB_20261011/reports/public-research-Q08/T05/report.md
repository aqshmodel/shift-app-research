# Q08 T05/5 Timefoldの課金Resourcesとプラン利用枠の区別

0限定公開質問完了・1正式資料待ち。未完941。作業コピーB62-20261013へ反映し、DB/FK/SQL往復・履歴/119価格行保持・再投入の冪等性を確認。

- [P02] 一般規約2.2は、利用/契約方式をOrderに記載し、unique planning valuesをResourcesとして課金モデルに関連付ける場合があると説明する。
  - 出典: https://timefold.ai/terms — General Terms 2.2 Usage model / Order / Resources
  - 留保: 全Employee Shift Scheduling API契約が同一の従量方式とは断定しない。職員ID/登録/稼働/計画期間・再計算の重複計数・測定窓は未確認。
- [P02] Spark/Flow/Horizonの文書はsolver threads最大1/5/20、1/2/3 tenants、Sparkの1 seat・1 configuration profileを区別する。
  - 出典: https://docs.timefold.ai/timefold-platform/latest/plans — Infrastructure表 / Collaboration / Configuration
  - 留保: 同時処理資源・環境数・プラットフォーム利用者の枠であり、職員数/課金Resources/最低人数/請求単位ではない。最新ページは版固定なし、改定日不明。
- [P02] 価格/プラン説明はSparkのAPIのみ、FlowのUI/複数利用者、Horizonの高度な分析を示すが、Employee Shift Scheduling固有のResourcesの計数期間・課金単価・最低数量をこの公開範囲から確定できない。
  - 出典: https://timefold.ai/pricing — Pricing for APIsのSpark/Flow/Horizon / Plans reference / 規約2.2
  - 留保: Solver Community/Plus/EnterpriseのライセンスとホストAPIを分ける。UIのseat数を職員課金人数としない。税は一般規約8.7で別、対象Orderの額/通貨/適用は未確認。

元課題・受入条件・変更前後・再開条件はindividual-review.json、history-preservation.json、ledger.jsonを参照。閲覧2026-10-13。日付不明は取得日で補わない。独立製品試験0。
