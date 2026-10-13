# 第34バッチ調査報告（C05T01）

2026-10-13 UTC、Connecteam Operations Hub Expertの未着手C05/K01を公式4新規文書で限定調査。6記録（すべて部分確認）、新規4調査文書。TASK-RES01220/01236を未着手→確認中、完了0、新規課題/料金/制度/独立製品試験0。既存Scheduling Rules/Expert資料2件は対照のみで、文書増加や一般ルール根拠の追加へ数えない。優先度1未完29はすべて確認中で、非公開条件の反復巡回を行わない。

## 追加根拠

- C05：APIガイドはminHoursBetweenShiftsを時間単位の数値と定義する。会社方針と個人customの同じ休息ルールが重なる場合は大きい値を採用し、個人GETは有効な会社/個人ルールを返す。無効な方針は適用されない。

  留保：終業→次始業の差の実計算、等号・端数丸め、夜勤跨日/月境界/DST、複数勤務表の対象勤務対は未試験。11.0はAPI例で既定/法定値ではない。helpの複数方針追加案内とAPIの会社方針1件/再割当置換は表面仕様が異なり、実整合未確認。 [公式資料](https://developer.connecteam.com/docs/company-policies-scheduling-rules)

- C05：休息ルールにもpreventClaimがあり、trueは違反するOpen Shift応募を阻止し、falseは管理者へ報告して応募を阻止しない。ガイドの既定はtrue、休息11.0時間の例はfalse。APIにはschedulerApi利用条件がある。

  留保：APIのenforcesという総括を全手動操作のhard拒否へ拡張しない。既存helpは草案保存/公開時に管理者へ警告と説明し、応募阻止も選択式。無条件hard制約・Expert全契約のAPI権・実API応答は未確認。設定もAPI呼出しも行っていない。 [公式資料](https://developer.connecteam.com/docs/company-policies-scheduling-rules)

- C05：2026-08-12のIssues説明は、勤務間の最低時間をScheduling Rules違反の対象に含め、その種類に必要な機能はExpertからと明記する。一般Issuesは全プランで、種類ごとの表示は設定でON/OFFにできる。

  留保：違反の表示を隠す操作と休息ルールの無効化・応募阻止を同一視しない。最低休息の数値域、実警告文、無効化時のhard動作、境界テスト未確認。既存の一般ルール/警告説明を再登録せず、今回の追加事項は休息種類のプラン境界と表示切替。 [公式資料](https://help.connecteam.com/en/articles/9745134-job-schedule-issues)

- K01：2025-08-25の取込手順はテンプレートの1行を1勤務として編集し、CSVへ保存してアップロードする。日付/開始終了/休憩分/Job/場所等を扱い、識別子をmappingして職員へ紐付け、確認後も草案となる。Basic Operations以上が対象。

  留保：ExpertはBasic/Advanced機能を含むという既存公式資料と整合するが、xlsx直接取込の証明ではない。セル結合・独自勤務記号・複数シートの元表保持、変換工数・導入時間・再取込更新/重複は未確認。テンプレート取得/製品取込試験なし。 [公式資料](https://help.connecteam.com/en/articles/6518011-job-scheduling-learn-how-to-import-shifts-from-excel)

- K01：障害解説はExcel/PDF/Numbers形式を不可としてCSVを要求し、Job/Shift title両列の存在と少なくとも一方の値を必要とする。未知Jobは新規作成/既存対応/無視、Sub-job列はnote/既存field/無視を案内する。

  留保：同日付の取込記事はJob/Sub-jobを列挙し、未知parent/sub-jobは既存Jobへ対応または無視とする。新規作成可否・Sub-job専用取込に説明差があり、版/データ条件/誤記のどれかは未確定。CSVを既存Excel表直接対応へ読み替えない。 [公式資料](https://help.connecteam.com/en/articles/8343742-troubleshooting-i-can-t-import-shifts-to-the-job-schedule)

- K01：日付形式の不一致や日付なしは取込当日へ、職員名不明は未割当へ、開始/終了時刻不足はアカウント既定時間へ補完されると障害解説が説明する。

  留保：補完が既存勤務表の意図を保持する保証ではない。日付設定・職員識別・欠落値を確認する必要がある。日跨ぎ/タイムゾーン/文字コード/大量行/境界の実取込、エラー拒否と補完の詳細条件、工数は未測定。 [公式資料](https://help.connecteam.com/en/articles/8343742-troubleshooting-i-can-t-import-shifts-to-the-job-schedule)

## 判断・検証・保全

休息の数値/重複時の優先と応募阻止の選択、違反種類のプラン境界・表示切替を確認したが、実時刻の差、等号/端数/DST/跨日/複数表境界、手動hard拒否は未試験。APIガイドのenforcesという総括はpreventClaim=falseや既存helpの手動警告を置き換えない。APIの会社方針1件/再割当置換と既存helpの追加/上書き案内の実整合も未確認。

取込はExcelというUI名称だがテンプレート→CSVが条件。Job/Sub-jobの列挙/未知対応と障害解説の新規Job作成/Sub-job専用取込不可には同日付の説明差がある。原因を版差/誤記と決めず、mappingや補完で元表の意味を保てると推測しない。両課題の境界試験・導入工数等が不足するため完了にしない。公開本文の要約・URL・版条件・locator・取得日を保存、全文/hash/公式原本画像は未保存。APIのv1経路は顧客runtime版ではなく、相対更新日から確定日を作らない。問い合わせ/登録/試用/API/設定なし。

72回帰（研究14・Web Python36・Node22、既存SQL5含む）合格。39表のB33既存全行保持、integrity/外部キー/SQL往復、非null ingest hash32件合格。50料金サマリーと118明細不変、50詳細のSQLite投影で6根拠・対象条件/相違/留保保持。保存B33→B34は172文、保存B18→B34は1070文、最大89,651バイト（100,000上限内）、往復と旧公開行保持合格。公開SQL再適用後50製品/仮行0。ライブAPIを検証した結果ではない。

PC1440/スマホ390で追加6ID・6リンク/4URL、休息未知・API条件/応募阻止選択・Expert表示条件・xlsx直接未確認・Sub-job説明差・旧履歴/価格をDOMと画像で確認。横幅超過なし、console警告/エラー0。CUA画像は会話出力で目視、原本未保存。検索role/exact IDの初回probe不一致は観測済みID/部分文字列で修正。localhost bindはsandboxで拒否、承認レビューで許可された隔離コピーのloopbackで実行。viewport/タブ/一時サーバー終了。型・両ビルド・隔離D1/API・全38ブラウザ/62SEOはC05T05または実装変更時に実施し、C04T05の結果を今回の実行結果へ転記しない。

累積50提供単位、2,141記録、346調査文書、118料金、39表/12view、制度17、独立試験0。未着手648→646、確認中252→254、停止78・完了2、未完978、優先度1未完29。共通資料部分採用615→617/2,000は完了・品質点数ではない。

開始時798ファイルの全hashがC04最終inventoryと一致。AGENTS.mdはcwd/祖先に存在せず、.agents/skillsもなし。C04のhandoff/verification/cycle-changesとprogressを読み、並行45ファイル・root/Web README保留・過去成果を保持。開始/反映前backupと検証ログは.local/research-backups/C05T01へ保存。HEAD/対象hashを反映直前に照合し、検証済み対象だけ反映。復旧は後続hash照合後に対象限定、Git reset/cleanやDB全体を後続調査へ上書きしない。

本番反映は本人担当。B18は本人報告として把握し再監査せず、以後の公開版を推測しない。本人は反映直前の最新研究39表＋公開4表の完全exportから差分を再生成し、保存baselineを現在本番の代用にしない。schema/対象hash/競合/履歴/SQL上限/往復を照合し、研究と公開投影を同じ版にする。空DB用d1/import.sqlを既存D1へ再投入しない。commit/push/CI/deploy/remote DB/課金/認証権限変更/外部連絡なし。旧費用記録のみ参照し、現行費用・アカウント再確認なし。

## 次ターン

C05は1/5でT02〜T05は親の逐次指示待ち。次候補はConnecteam未着手L01（TASK-RES01239）/K03（TASK-RES01237）：本人スマホからの希望提出の操作と、顧客/ベンダーの初期設定作業分担を新しい公開helpから限定確認。既存の一般可用性/管理権限の再登録や非公開契約巡回は避け、工数/対象プラン/権限試験は未測定のまま扱う。親の別高優先対象を優先。T05も実質追加調査を行ってから包括検証とdocs/checkpoints/C05/引き継ぎを保存し5/5で停止する。T02は開始していない。
