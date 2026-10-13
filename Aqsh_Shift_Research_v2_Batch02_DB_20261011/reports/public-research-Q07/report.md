# Q07 — 公開調査の追加5単位

B52から5単位を進め、B53〜B57へ記録した。公開7課題を個別照合し、4限定公開質問を完了、3件を正式仕様待ちへ整理。累計完了36、未完948→944＝公開789（未照合含む）＋外部72＋条件付き保留83。5/5で停止、6単位目未開始。本番未反映。
完了は公表記載の限定確認の終了であり、元要件全体・契約適用・制度適合・製品動作の認定ではない。原要件、旧判断、残条件、再開条件はledger.jsonとT01〜T05/individual-review.jsonへ保存。旧119価格行と全出典/履歴を保持した。

## 掲載の判断を明確にした点

|単位|公表根拠と確認範囲|留保と処理|
|---|---|---|
|T01 お助けマンDay|[介護向けFAQ](https://www.otasukeman.jp/nursing-home)は資格別スタッフグループと勤務帯別必要人数を利用者が設定し、不足条件を表示する。配置基準自体の判断は各施設が行うと明記。[Day出力一覧](https://www.otasukeman.jp/day)は一般勤務表/時間表/CSVを説明|制度固有の常勤換算/加算/対象帳票は確定できないためTASK-RES00213を正式仕様待ち。一般Excel出力を介護法定帳票や様式9対応としない。未記載を非対応とも判定しない|
|T02 勤夢表VX|[VX機能](https://my-sys.net/2021/?page_id=223)は標準の勤怠データ受渡し・一般Excel出力と、管理日誌/様式9への展開オプションを区別。[サポートセンター](https://ideanexsys.com/勤夢表vxの機能/)でも同じ注記を確認。[Light](https://my-sys.net/2021/?page_id=2036)の記号数制限とVXを区別|TASK-RES00815を限定終了。外部Excel書式の無償提供は製品オプション無料ではない。別製品excel勤夢表の2026年度告知をVXへ流用しない。旧5部署5端末の参考価格6行と税不明を保持、現在の契約額/制度版/算式は留保|
|T03 Optamo for Shift|[共通案内](https://www.optamo.jp/)はスタッフ人数に基づく料金体系とTask/Shiftを説明。[Shift](https://www.optamo.jp/shift/index.html)は利用料金相談・販売パートナー申込を案内|TASK-RES00089/00090を人数方式・公表範囲の限定質問として終了。通常単価/通貨/税/初期費/請求周期/最低数量、管理者/休職/兼務の数え方は不明。スタッフ登録無制限を無料人数としない。追加の価格行なし|
|T04 NTTデータ数理システム|[シフト案内](https://www.msi.co.jp/solution/scheduling.html)は汎用サービスと特殊要件への受託開発を区別し、システム組込やExcel呼出モジュールを提案。[コンサル](https://www.msi.co.jp/solution/consulting.html)/[モデル開発](https://www.msi.co.jp/solution/ai-model-development.html)で個別合意・提供形態を照合|TASK-RES00586を限定終了。全顧客共通のSaaSプランや標準API包含とはしない。シフト案件の仕様/納品/ライセンス/開発・保守費は正式見積待ち。無料相談と開発無料を区別|
|T05 Rotageek|[Healthcare表](https://www.rotageek.com/industries/healthcare)のSSO/API-SFTPは両列にチェック。自動最適化の親行は基本×/追加○、詳細10行は両列○。[Digital](https://www.rotageek.com/solutions/digital-rotas-schedules/)/[Auto](https://www.rotageek.com/solutions/rota-auto-scheduling/)の基本/追加の本文とも照合|B04-20261011-TASK006とTASK-RES01040を正式仕様待ち。親子の記号不一致をdisputedで保存、基本に自動作成標準包含と断定しない。SSO/APIの表記も個別契約への適用・費用・接続実測は未確認。英国医療の記述を日本制度対応としない|

## 記録・終了条件・再開

文書観測17件、出典取得改訂16件を追加。新たな調査文書6件、累計2,257文書記録・379調査文書・119価格行、39表/12view、独立製品試験0。Rotageekの二課題は特定契約版の設問と一般境界の設問をそれぞれ照合し、観測を重複追加せず同じ根拠に紐付けた。既存の外部待ちやQ06の対象を新根拠なく繰り返していない。
元978課題の個別点検は106、未個別点検872。公開789のすべてを解決可能と認定したものではない。条件付き保留83件は不変。
正式資料待ち3件は担当未定。対象サービス種別/制度版、対象地域/Healthcare契約版を指定した現行仕様・契約・見積、対応する公式改定、又は導入判断で残条件が必要になった時に再開。回数を稼ぐ外部待ち巡回やunknownの削除は行わない。
各単位の受入条件・変更前後・旧課題は[T01](T01/report.md)〜[T05](T05/report.md)とledger.jsonへ記録。全単位でDB/FK/SQL往復・旧価格/履歴保持・冪等再投入・対象外課題不変を検証。

## 日付・保護・検証

閲覧日は2026-10-13 UTC。全対象ページの公開/改定日は不明。VXの2014-07-18配布注意、URLの2021、copyright2026、別製品の2026告知を現行VX資料の改定日にしない。Optamo比較表の2024年8月注記は前回の保存資料に残し、今回の料金/人数説明に流用しない。
公開HTML/抽出文は.local/research-backups/Q07-20261013/source-captures、URL/hash/時刻はsource-captures.json。RotageekはChromeで親/詳細の記号を実見し、保存HTMLのincluded/excludedとも照合した（source-table-review.json）。今回はPDFなし。最初のNTT補助URLの404は取得記録に残し、ページ内リンクの正式URLへ訂正して取得した。
作業前1218ファイルをバックアップ。保護45・root/Web README・過去Q01〜Q06/C01〜C05・全非対象をhash照合し、直前バックアップから対象限定で反映する。古いDB全体復元/Git reset/cleanは使わない。
型、回帰75、両ビルド、隔離D1全39表、全50製品API/料金、ブラウザ38、PC1440/スマホ390、比較ビューア、SEO62の最終結果はverification.json/post-apply.json。アプリコード変更なし。
保存B52→B57差分は隔離ローカル基点。本番反映は本人が最新完全本番exportから再生成し、研究39表と公開4表の旧行/hash/FK/1文100,000bytes/SQL往復を確認して同版へ揃える。旧基点や初期化import、guard緩和で反映しない。
適用するAGENTS.mdはcwdと親階層に見つからず、プロジェクト内の.agents/.codexもなし。Q01終了基準・Q06検証/限定反映手順に従った。登録・フォーム送信・問い合わせ・資料請求・課金・Git/CI/デプロイなし。5/5で停止。
