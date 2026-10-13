# Q08 — 公開調査5単位

B57からNursegrid Manager、UKG Pro WFM、Smartlinx Scheduling、RosterElf、Timefold ESS APIの5単位を個別照合し、B58〜B62に記録した。公開5課題のうち3限定質問終了・2正式仕様待ち。累計done39、未完944→941＝公開784（未照合含む）＋外部74＋条件付き保留83。5/5で停止、6単位目未開始。本番未反映。
限定終了は公開文書の特定範囲の確認であり、元要件全体・顧客契約・実動作・制度適合の認定ではない。原要件/旧判断/受入条件/残条件/再開条件はledger.jsonとT01〜T05/individual-review.jsonへ保持。元978件の個別点検111・未点検867。公開784全件の重要度や解決可能性を認定したものではない。

## 掲載の範囲を明確にした点

|単位|公式根拠と確認内容|留保・処理|
|---|---|---|
|T01 Nursegrid|[Manager](https://nursegrid.com/for-organizations/nursegrid-manager/)の組織機能と[App](https://nursegrid.com/for-nurses/nursegrid-app/)の個人向け無料を分離。[Restricted Users](https://healthstreamhelp.mcoutput.com/nursegridmanager/Content/NG_Manager/User_Management/Restricted_Users.htm)は空きシフトを受信しない。役割/追加機能の共通注意と[Builder](https://healthstreamhelp.mcoutput.com/nursegridmanager/Content/NG_Manager/Schedule_Mgmt/Creating_a_Draft_Schedule_with_the_Schedule_Builder.htm)の自己申請条件を確認|TASK-RES01171を限定終了。ヘルプは2025-09-09更新表示で現行契約包含・実測は不明。6週間草案は登録職員上限ではない。空白人数欄と0を分け、自己申請を自動最適化としない。Managerのドル表示/税/契約適用は別確認|
|T02 UKG|[公開標準SOW](https://www.ukg.com/sites/default/files/2026-02/UKG-Pro-Suite-Standard-SOW-2026-02-05.pdf)p.1は購入サービスのみを対象としWFM(Timekeeping/Accruals)とSchedulingを別項目にする。p.7のScheduling導入設定数、p.2/5の変更依頼と追加費、Global Employeesの限定を照合|TASK-RES01085を限定終了。最大10グループ等は導入設定の範囲で製品上限ではない。顧客Order/MSA・医療モジュール・追加額・日本制度は未確認。URLの2026-02-05は本文発行/改定日の証明ではない|
|T03 Smartlinx|[Go](https://www.smartlinx.com/solutions/smartlinx-go/)と[Scheduling](https://www.smartlinx.com/solutions/scheduling/)の管理/従業員の役割を区別。[App Store提供元説明](https://apps.apple.com/us/app/smartlinx-go/id1446077536)は打刻を許可がある場合に限り、アプリ入手はFreeとする|TASK-RES00994を限定終了。無料アプリを企業のScheduling/勤怠/給与/EWA契約無料にしない。全機能の標準包含・追加額・有効化・日本制度対応は不明。一般レビュー/星評価を根拠に採用しない|
|T04 RosterElf|[最低人数](https://www.rosterelf.com/support/knowledge-base/billing-and-subscription/minimum-monthly-fee)は月3 active staff/年10 seats、管理者含む・My Accountantの1人を除外。[年席変更](https://www.rosterelf.com/support/knowledge-base/billing-and-subscription/update-annual-plan-seats)で手動増席即時とactive追加後5日猶予を分ける。[料金](https://www.rosterelf.com/pricing)のFlexは当月1シフト以上とSMS別課金|B04-20261011-TASK005は正式Flex仕様待ち。通常プランの最低3/10をFlexに自動適用しない。Flex最低人数・SMS単価/周期/税の適用・具体的請求例は未確認。Australia(Global)表示のAUD/GST条件と旧119料金行を保持|
|T05 Timefold|[一般規約](https://timefold.ai/terms)2.2はOrderの利用モデルとunique planning values(Resources)を説明。[plans](https://docs.timefold.ai/timefold-platform/latest/plans)と[pricing](https://timefold.ai/pricing)のSpark/Flow/Horizonのthread/tenant/seat/UIを照合|TASK-RES01300は正式ESS課金仕様待ち。1/5/20 threadsや1 seatは職員課金人数ではない。ESS固有の計数窓/重複/再計算/最低数量/単価は未確認。Solver版とホストAPI契約も分離。税別一般条項を顧客の通貨/額の確定としない|

## 根拠・日付・検証

追加観測17件・出典取得改訂16件。累計2,274文書観測・379調査文書・119価格行。価格追加/変更0、旧出典・観測・採用履歴を保持。39表/12view、独立製品試験0。旧119行の保持は適用契約/価格の再認定ではない。
閲覧2026-10-13 UTC。Nursegridヘルプ9/9/2025、RosterElf最低人数2026-09-07・年席変更2026-09-16の更新表示を保存。その他の本文発行/改定日不明。copyright・URL日付・App Storeレビュー日を資料更新日にしない。地域/プラン/通貨/税は出典の表示範囲に限定。
一部の直接HTTP取得は403。公式web閲覧結果を保存した箇所は原本HTML保存済みと称さず、index.jsonにweb_tool_available・HTTP状態不明と記録。UKGは公式PDFをChromeで閲覧・ダウンロード後に保存し、9頁全体を抽出、p.1/2/5/7をPoppler画像で確認。PDF原本は[sources/ukg-pro-suite-standard-sow-20260205.pdf](sources/ukg-pro-suite-standard-sow-20260205.pdf)、PDF/画像/hashはsources/pdf-review.json。生HTTP失敗と成功経路を分け、制限回避や認証変更なし。
各単位でDB/FK/SQL往復、課題対象限定、旧119価格/全履歴保持、再投入冪等性を確認。型/回帰75/両ビルド/D1全39表/API全50/ブラウザ38/PC1440・スマホ390/比較ビューア/SEO62の最終結果はverification.json/post-apply.json。
作業前1293ファイルをバックアップ。保護45、root/Web README、過去Q01〜Q07/C01〜C05と全非対象を保持。直前hash照合とバックアップ後、対象だけを限定反映。復旧は後続hash確認後の対象ファイル単位とし、旧DB全復元/Git reset/cleanをしない。
正式仕様待ち2件は担当未定。Flex/SMS正式料金・具体的請求例、ESSモデル/地域/Orderの課金計数・見積、該当公式改定又は導入判断時に再開。3限定終了の残条件も同様に必要時再開。不明・旧不一致をdoneで自動昇格しない。
保存B57→B62差分は隔離ローカル基点。本番は本人が最新完全本番exportから差分再生成し、研究39表/公開4表の旧行/hash/FK/100,000bytes/SQL往復を確認して同版へ揃える。旧基点・初期化import・guard緩和を使わない。
AGENTS.mdは適用階層になく、プロジェクト.agents/.codexもなし。Q01終了基準とQ07検証/限定反映手順を使用。PDFはPDFスキルの読取/画像照合手順を使用。本番/Git/CI/課金/外部問い合わせ/登録/資料請求/フォーム送信なし。5/5で停止。
