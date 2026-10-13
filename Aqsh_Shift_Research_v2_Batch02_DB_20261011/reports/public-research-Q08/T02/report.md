# Q08 T02/5 UKG標準SOWの購入サービス・Scheduling導入範囲

1限定公開質問完了・0正式資料待ち。未完942。作業コピーB59-20261013へ反映し、DB/FK/SQL往復・履歴/119価格行保持・再投入の冪等性を確認。

- [B07] 標準SOWは対応するOrderで購入したサービスを対象とし、WFMのTimekeeping/AccrualsとPro Schedulingを別の購買項目として列挙する。
  - 出典: https://www.ukg.com/sites/default/files/2026-02/UKG-Pro-Suite-Standard-SOW-2026-02-05.pdf — 物理p.1「Subscription Services in Scope」・if purchased / Order・MSA前提
  - 留保: 製品名が列挙されているだけで全モジュールの契約包含を認定しない。配布URLは2026-02-05、本文の発行/改定日不明。顧客契約への適用は未確認。
- [B07] Pro Schedulingの事前定義導入範囲は最大10 scheduling groups、1テンプレート、1スキル/資格インポートと3ルールセット、1コールリスト、2学校カレンダー、空き/交代/代行の自己サービスを示す。
  - 出典: https://www.ukg.com/sites/default/files/2026-02/UKG-Pro-Suite-Standard-SOW-2026-02-05.pdf — 物理p.7「UKG Pro Scheduling」事前定義の設定範囲
  - 留保: 導入作業の範囲で製品自体の人数/生成/登録上限ではない。上限超過の契約・追加費・医療向け仕様・実測は別確認。
- [B07] SOWは重要な範囲変更や未指定インターフェイスを別Service Requestとし、追加費用/納期変更の可能性を明記する。Global Employeesの事前定義範囲は国別ルールによる勤怠/休暇自動計算を含まない。
  - 出典: https://www.ukg.com/sites/default/files/2026-02/UKG-Pro-Suite-Standard-SOW-2026-02-05.pdf — 物理p.2 Launch Pricing / p.5 assumptions / p.7 Global Employees注記
  - 留保: グローバル従業員はp.2で米国/カナダ外と定義。日本の勤務/給与・様式9対応を推定しない。SOWの固定費と通常サブスク単価を区別。

元課題・受入条件・変更前後・再開条件はindividual-review.json、history-preservation.json、ledger.jsonを参照。閲覧2026-10-13。日付不明は取得日で補わない。独立製品試験0。
