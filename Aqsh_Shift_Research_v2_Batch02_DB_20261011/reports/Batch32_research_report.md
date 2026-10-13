# 第32バッチ調査報告（C04T04）

2026-10-13 UTC、Timefold未着手K01/M08を公式6資料で限定調査し、6記録（部分確認4・未確認2）を追加。新しい正規化調査文書4、B30 Dataset details/B31 Profilesの2文書は新しい出口範囲のため再利用するが文書増加に数えない。2課題（TASK-RES01286/01292）を確認中へ変更、完了0・新規課題0・料金追加0・制度追加0・Timefold独立製品試験0。K01の支持はunknownのまま。連携主体/role/key scope/profile作成/採点API一般を再登録せず、非公開契約の同じ巡回もしていない。

## 事実と適用条件・未確認

- K01（未確認）：1.35.xの導入例はemployees/shiftsを含むsample.jsonを作成し、New planのCustomからJSONをアップロードする手順を示す。今回確認した入力案内では、セル結合・独自記号・複数シートを含む既存Excel勤務表の直接取込/自動変換仕様を確認できなかった。

  留保：構造化JSONの投入は既存Excelの読取対応ではない。今回の公開手順・入力検証・OpenAPIの限定確認で、製品全体にExcel機能がないとは断定しない。顧客側変換器や別商品/個別開発の存在、書式対応、変換精度/工数、実画面・ファイル試験と適用プランは未確認。B31の一般連携主体を再登録しない。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/getting-started-with-employee-scheduling)

- M08（部分確認）：Plans overviewは検索/フィルターに一致したデータセットをExport CSVで出力するが、対象は直近100件までと説明する。Plansは関連solveの連鎖ごとに最新revision、Revisionsは各revisionを表示する。

  留保：Platform latestの一覧CSVに関する上限で、希望・規則・設定・全履歴を内包した全量アーカイブを保証しない。画面のrevision表示とCSV列/全revision出力は別で、100件超の分割取得・整合性・削除済み範囲・CSV実試験・顧客プランは未確認。解約後の可用期限/費用も未確認。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/how-tos/categorizing-runs)

- M08（部分確認）：設定プロファイルは名称・説明・制約重み・モデル設定・solve設定を含む全体をJSONへExportし、read-onlyのStandardも対象とする。再Importは常に新規プロファイルを作り、既存へ上書き/mergeせず、元のdefault指定を自動継承しない。

  留保：Platform latestの個別profile移送。別モデルや一致しないparameterは汎用import error、同一モデルのminor版間移送等が推奨される。勤務表/希望/データセット履歴/権限等が同梱される保証や全profile一括出口、再現互換性、解約期限/費用・プランは未確認。B31の作成/選択/優先順位を再登録せず、既存正規化文書を再利用する。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/how-tos/configuration-parameters-and-profiles)

- M08（部分確認）：データセットのOutputでは計画の全詳細をJSONファイルとしてダウンロードできると説明する。Visualizationは出力品質のspot-check用として別に案内される。

  留保：Platform latestの単一計画solution outputで、全テナントの入力希望/規則/実効設定/全revision/監査を同梱する全量出口ではない。1件の計画のfull detailsを契約終了時のfull exportへ拡張しない。実ファイル・プラン・解約後の取得期限/費用は未確認。B30の採点/justification一般を再登録せず既存文書を再利用する。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/how-tos/interpreting-model-run-results)

- M08（部分確認）：公開OpenAPIのGETはID単位で/inputをEmployeeSchedule、/configをModelConfiguration2、/logsをLogInfo、/model-requestを完全入力requestのJSONとして返す仕様を示す。個別datasetの入力と実効設定とsolveログを別に取得する設計が確認できる。

  留保：info.version=v1の可変公開specで固定ESS1.35.xのruntime認定ではない。仕様閲覧のみでAPI実行/認証なし。入力・実効設定・solveログ・完全requestは別artifactで、solveログをtenant監査にしない。404/401/403/429等を定義し、終了契約下の可用性/全revisionの完全列挙/解約費用期限/実取得や復元性は未確認。 [公式資料](https://app.timefold.ai/openapis/employee-scheduling/v1)

- M08（未確認）：監査ガイドはテナントごとに設定イベントを閲覧し、APIキー・profile・member/model・secrets等の種別とactor/IP/time等を確認する手順を示す。今回の公開入出力資料では、希望・規則・設定・全履歴/監査を機械可読で解約時に全量取得する範囲、費用、期限を確認できなかった。

  留保：監査の画面閲覧を監査export保証にしない。限定公開文書の未確認結果で、解約出口機能の不存在や無料/無期限を断定しない。個別契約の追加権利/代行費用/期限、tenant-wide archive・全revision/削除済みデータ保持・実可搬/復元性は未確認。既存B21の非公開条件巡回や営業連絡は行わない。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/how-tos/audit-log)

固定ESS1.35.xのJSON投入手順、Platform latestの一覧/個別output/profile/監査、info.version=v1の可変OpenAPIを別適用範囲として保存。v1はモデルrelease1.35.xや顧客現行版を認定しない。直接Excel/CSV変換と既に整形されたJSON、最新100件の一覧と全revision archive、個別profileと実効dataset設定、solveログとtenant監査を分ける。一般的なAPIの存在から全量出口・無料・無期限を推論しない。

## 対照と未解消の記述差

Model API usage末尾はPlatform APIでaudit/tenant/member/key管理と説明するが、Platform API usageの注意はそれらを別model APIsと説明する。公開raw Platform specも対照閲覧したが、今回audit endpoint所在と全量取得は認定しない。権限調査を増やさずretrieval_checksへURLと相反を保存。[Model API](https://docs.timefold.ai/timefold-platform/latest/api/model-api-usage)、[Platform API](https://docs.timefold.ai/timefold-platform/latest/api/platform-api)、[公開spec](https://app.timefold.ai/openapis/platform)。

B30で残したavailable/unavailable両配列の記述差は、固定input-validationで両方定義をWARNING/処理可能と説明する第三の資料があった。専用availabilityの併用不可と今回も整理できず、実入力を認証しない。K01のExcel変換とJSON検証の対照として読み、既存可用/入力検証を新規観測・文書件数へ追加しない。[固定入力検証](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/user-guide/input-validation)。

Web本文と通常ChromeはCSV100件上限・profile全体JSON/Standard/new/no merge/default不継承を照合できた。ChromeのNew plan説明はWeb抽出より詳細で相反ではない。六資料のURL/版/locator/取得日/方法/要約/留保を保存。公開/更新日未表示。全文・本文ハッシュ・公式原本画像未保存。公式公開OpenAPIを取得しただけで、Timefold model/API実行・認証・試用・Upload・キー/PAT生成・設定変更・問い合わせなし。

## 検証

72回帰（研究14・Web Python36・Node22、SQL分割の新5試験を含む）合格。分割コードとfixtureはB31の検証済み状態から不変。DB整合性/外部キー/SQL往復、39表の既存全行保持（指定可変欄だけ）、非null ingest hash30バッチを照合。旧B01/B02 nullを検証済み入力件数へ含めない。50料金・118明細はB31から不変、Timefold構造化価格0。公開投影50詳細の内容hash、4採用部分根拠、K01 unknownとK01/M08各context_count2を確認。2未確認記録は文脈として研究DB/静的比較に残す。

静的比較のPC1440/スマホ390pxで6ID・6根拠リンク、K01未確認、M08部分と全量未知、最新100上限、profile/版/ログ/費用期限の境界、B31履歴を確認。文書/詳細横幅超過なし、返されたconsole error/warning0。スクリーンショットはCUA出力で目視し原本保存なし。ロゴ可用は独立検査していない。一時favicon404のみ。検証後viewport解除、エージェントタブ・127.0.0.1サーバー停止。

型/両ビルド・実際の隔離D1/API・全ブラウザ/SEOはコード不変のためC04T05包括検証で繰り返す。本ターンの投影/価格/hash検査をライブAPI検査とは呼ばない。B31→B32差分177文、保存B18→B32差分969文、最大SQL文86,116バイト（上限100,000以下）、往復/旧公開行保持が合格。現行本番完全exportに基づく差分ではなく、反映担当は最新baselineから作り直す。空DB向けimport.sqlを既存DBへ再投入しない。

累積50提供単位、2,129文書記録、337調査文書、118料金明細、39表/12view、制度17、独立試験0。未着手652→650、確認中248→250、停止78・完了2、未完978・優先度1未完29。共通資料採用612→613/2,000は部分採用で全要件確認/品質点数/課題完了ではない。

## 保護と停止

開始746ファイルをC04T03最終inventoryと照合してバックアップ。反映直前にHEAD/対象hash/他者変更を照合し必要な対象だけ反映する。並行45、root/Web README保留、既存未コミット成果、過去turn/checkpointとSQL分割修正を保持。耐久バックアップ/作業ログは.local/research-backups/C04T04。復旧時は後続変更hashを確認して対象だけ戻し、全DB/Git reset/cleanで巻き戻さない。

旧費用記録/本人報告のみ参照。現在の費用/アカウント/使用量調査・課金API/インストール/認証権限/プラン変更・外部連絡・commit/push/CI/deploy/remoteDB操作なし。本番B18は本人報告として把握のみ、以降の公開状況は推測せず本番反映は本人担当。

C04は4/5、T05開始は親指示待ち。次候補はTimefold未着手C01（TASK-RES01263）/I06（TASK-RES01283）。公開の交代/rotation設定と、人員資格・曜日・時間追加のwhat-if比較を限定調査し、一般シフト表現と病棟混在体系、追加人員比較と採用必要数の証明を分ける。既存勤務時間/採点/タグ一般は反復しない。公式の新規根拠が不足なら別未着手公開候補を報告。T05も実質追加調査を含め、その時点の72回帰/型/両ビルド/価格/履歴/manifest/D1/API/全ブラウザ/SEO/表示の包括検証、docs/checkpoints/C04/引き継ぎを保存し5/5で停止する。
