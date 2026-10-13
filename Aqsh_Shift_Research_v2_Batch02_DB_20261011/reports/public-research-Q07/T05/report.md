# Q07 T05/5 Rotageek基本/追加機能とHealthcare比較表の不一致

0限定公開質問完了・2正式資料待ち。未完944。作業コピーB57-20261013へ反映し、DB/FK/SQL往復・履歴/119価格行保持・再投入の冪等性を確認。

- [B07] 現行サイトはDigital Schedulingを基本の勤務管理として紹介し、Auto Schedulingを追加機能のナビゲーションへ置く。基本側の本文はドラッグ/複製、勤務表共有、アプリ・休暇申請等を説明する。
  - 出典: https://www.rotageek.com/solutions/digital-rotas-schedules/ — SolutionsナビのAdd-Ons / Digital Schedulingの本文
  - 留保: 製品の位置付けと個別契約の包含を区別。Healthcareの旧/新契約版や追加料金は未確認。日本の様式9/介護制度対応へ広げない。
- [B07] Healthcareの比較表はDigital Schedulingと+Auto Schedulingの2列。SSOとpublic APIs/SFTPの行は、ブラウザ表示とHTMLの両方で両列にチェックがある。
  - 出典: https://www.rotageek.com/industries/healthcare — Integration & access managementを展開 / SSO・Other integration via public APIs or flat file via SFTP
  - 留保: 公開比較表の記号のみ。APIの対象/制限/費用・顧客契約/地域・SSO方式・設定実測は未確定。個別契約への標準包含を認定しない。
- [B07] Roster optimisationの親行は基本列が非対応、追加列が対応。一方、展開した1クリック作成などの詳細10行は両列が対応であり、親子の記号が一致しない。
  - 出典: https://www.rotageek.com/industries/healthcare — Roster optimisation親行と展開詳細10行 / included・excludedクラス / Chrome表示
  - 留保: 表示不一致を保持。詳細行だけから基本プランに自動最適化が標準包含とは断定しない。正式機能表/対象契約版が必要。
- [B07] Auto Scheduling本文はDigital Schedulingへ追加して自動最適化する説明だが、Healthcare表の親子記号の不一致を解消する契約版情報を確認できない。
  - 出典: https://www.rotageek.com/solutions/rota-auto-scheduling/ — Auto Scheduling本文 / Healthcare表との照合
  - 留保: 製品説明だけで不一致を優先順位付けして解消しない。公開/改定日不明、英国医療の記述。正式契約版の表と追加料金を待つ。

元課題・受入条件・変更前後・再開条件はindividual-review.json、history-preservation.json、ledger.jsonを参照。閲覧2026-10-13。日付不明は取得日で補わない。独立製品試験0。
