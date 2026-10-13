# 第35バッチ調査報告（C05T02）

2026-10-13 UTC、Connecteam Operations Hub Expertの未着手L01/K03を公式4新規文書で限定調査。6部分記録・新規4調査文書。TASK-RES01239/01237を未着手→確認中、完了0。料金明細/新規課題/制度/独立製品試験追加0。既存Excel取込記事はProリンク導線のみの対照で新規文書・一般取込根拠に数えない。

## 追加根拠

- L01：管理者がAvailabilityと希望提出を有効にした勤務表で、本人はモバイルアプリのMy availabilityから日付・希望/不可・詳細を選びConfirmする。Only meの＋からは不可だけを追加でき、希望はMy availabilityのみ。

  留保：本人アプリの手順を部分確認。iOS/Android別対応・アプリ版・本人ブラウザ提出・承認/確定・追加料金/Expert契約の利用権・権限拒否の実試験は未確認。管理者の設定を本人が変更できるとしない。未記入日の可用扱いや既存の自動割当考慮は再登録しない。 [公式資料](https://help.connecteam.com/en/articles/6569607-allow-users-to-set-their-preferred-working-hours-and-unavailabilities)

- L01：勤務表ごとに不可の追加/編集/削除を日・時間・分の指定期間内で止められる。期限は勤務表タイムゾーンの各日開始から測り、期間内も閲覧は可能。変更ロックはモバイルアプリとdashboard双方に適用されると説明する。

  留保：勤務開始時刻基準や全勤務表共通期限と読み替えない。prefer to workまで同じロックが及ぶか、等号/端数/DST/深夜の境界・管理者代行の例外・Expertの利用権/版は未確認。期間2日は例で既定値/法定値ではない。設定/期限試験なし。 [公式資料](https://help.connecteam.com/en/articles/6489644-starting-guide-to-unavailability)

- L01：本人はアプリMy Availabilityから終日または時間帯の不可を登録できる。既に割当済みの勤務がある場合は不可を記入できず、重複の表示が出ると説明する。管理者/ownerは不可があっても勤務を配置できる。

  留保：希望提出の許否と管理者配置の許否を区別。割当済みの日全体か重複時間帯だけか、複数勤務表・草案/公開済み勤務・代行削除/変更、本人認証と権限は未試験。1月の希望ガイドはGeneral tab、8月の不可ガイドはMobile app tabで設定場所が異なり、現在UIは未確認。 [公式資料](https://help.connecteam.com/en/articles/6489644-starting-guide-to-unavailability)

- K03：公式Proサービスは認定proによるSchedule設定を案内し、勤務・テンプレート・繰返し・view・availabilityを対象に挙げる。50分セッション40 USDと表示し、サービス範囲は購入済みsubscription planに従う。

  留保：製品名Operations Expertと担当者proを混同しない。Expert標準の無料設定代行ではない。全休息/医療制度条件の設定・顧客要件定義/データ準備の分担・必要回数/工数/検収/版は未確認。単価はK03条件として記録し、時間単位の表記差があるため料金明細追加なし。予約/購入なし。 [公式資料](https://connecteam.com/connecteam-experts/)

- K03：FAQは、設定meeting後に必要な作業を認定partnerが単独で続け、成果を提示して調整する方法を説明する。onboarding meetingは顧客へ事業/解決策/設定例を説明し、その後は顧客が独力で継続する方法と分ける。

  留保：外部認定partner経由の代行・指導という選択肢の確認で、ベンダー従業員による一律代行/個別開発/検収保証ではない。専門勤務ルールの設定範囲・顧客側工数/準備・版/Expert契約への適用は未確認。days instead of weeksという広告を測定導入時間にしない。 [公式資料](https://help.connecteam.com/en/articles/9113052-connecteam-pros-purchase-certified-partner-services)

- K03：FAQはProサービスの地域をEMEAとNorth Americaとし、40 USD/hour・meetingは最大50分と表記する。設定依頼はaccount billing内の導線から予約し、請求はConnecteam経由で次回invoiceへ載ると説明する。

  留保：公開LPの40 USD/50min sessionと時間単位が異なり、超過/作業継続分/単価算式・必要回数は未確定。日本からの契約可否・日本語/時差・地域例外・Expertへの含有は未確認。導線の存在を予約/認証権付与/費用発生と混同しない。課金画面へアクセスしていない。 [公式資料](https://help.connecteam.com/en/articles/9113052-connecteam-pros-purchase-certified-partner-services)

## 判断・検証・保全

本人アプリMy availabilityとOnly meの機能差、管理者側の有効化、勤務表の日付開始/TZから測る不可変更期限、割当済み勤務での本人登録拒否を部分確認。本人希望提出と管理者配置を分ける。不可変更ロックを勤務開始時刻基準や希望までのロックへ拡張しない。OS/App版、本人ブラウザ提出、Expert個別契約への権利/追加料金、等号・端数・DST、承認/認証/権限拒否は未試験。希望ガイドのGeneral tabと不可ガイドのMobile app tabの設定位置差を現在UIで解消していない。

初期設定の選択肢は認定partnerによる設定後の単独作業/成果調整と、指導後の顧客独力継続。Operations Expertというプラン名をpro担当者や標準無料設定へ読み替えない。サービスは購入subscriptionに従い、FAQはEMEA/North Americaと説明する。日本での契約可否/日本語/医療勤務ルール/顧客準備/工数/必要回数/検収は未確認。LPの40 USD/50min sessionとFAQの40 USD/hour・最大50分には時間単位の表記差があり、総費用を算定せずK03留保として保存。価格明細は追加しない。広告のdays instead of weeksを測定値にしない。予約/購入/請求画面・API・設定・問い合わせ・製品試験なし。

要約・URL・版/取得日・locator・方法と留保を保存。Prosのcanonical URLは追跡パラメータを除いたページで再取得確認。FAQのUpdated this weekは相対表示で確定更新日を推測せず、LPは公開日未表示。全文/本文hash/公式原本画像未保存。求人・第三者レビューを顧客契約の証拠に採用しない。既存一般可用性/自動割当/権限/Excel/契約根拠は重複追加しない。

72回帰（研究14・Web Python36・Node22、SQL5含む）合格。39表のB34既存全行保持、integrity/外部キー/SQL往復、非null ingest hash33件合格。50料金サマリーと118明細はB34不変、50詳細のSQLite投影で6追加根拠・条件/相違/留保を照合。ライブAPI検証ではない。保存B34→B35は172文、保存B18→B35は1118文、最大99,891バイト（100,000上限内）、往復/旧公開行保持合格。生成器は変更せず、公開SQL再適用後50製品/仮行0。将来大きい行は既存分割ロジックが扱う。

PC1440/スマホ390で追加6ID/6リンク/4URL、本人手順/TZ期限、権利/境界未知、Pro分担・地域・hour/session差、B34履歴と従来価格をDOMと画像で確認。文書/詳細の横幅超過なし、console警告/エラー0。CUA画像は会話出力で目視、原本未保存。承認レビューで許可された隔離コピーのlocalhostのみ。viewport/タブ/一時サーバー終了。型/両ビルド/隔離D1/API/38ブラウザ/62SEOはC05T05か実装変更時に実施し、C04結果を今回の実行結果に転記しない。

累積50提供単位、2,147記録、350調査文書、118料金、39表/12view、制度17、独立試験0。未着手646→644、確認中254→256、停止78・完了2、未完978、優先度1未完29。共通資料部分採用617→619/2,000は課題完了・品質点数ではない。

開始時822ファイルの全hashがC05T01 completion-inventoryと一致。既読C04引き継ぎとC05状態/前turn検証を確認、AGENTS/.agents/skillsは前turnで不存在。並行45・root/Web README保留・過去成果を保持。開始/反映前backup・ログは.local/research-backups/C05T02。反映直前のHEAD/対象hashを照合し、検証済み対象だけ反映。復旧は後続hash照合後に対象限定、Git reset/cleanやDB全体を後続へ上書きしない。

本番反映は本人担当。B18は本人報告のみで再監査せず、以降の公開版を推測しない。本人は反映前の最新研究39表＋公開4表完全exportから差分再構築し、保存baselineを現在本番の代用にしない。schema/履歴/競合/対象hash/SQL上限/往復を照合し、研究と投影を同じ対象へ揃える。既存D1へ空DB用d1/import.sqlを再投入しない。commit/push/CI/deploy/remote DB/課金/認証権限変更/外部連絡なし。旧費用記録のみ参照し、アカウント/費用再確認なし。

## 次ターン

C05は2/5、T03〜T05は親の指示待ち。次候補Connecteam未着手F04（TASK-RES01226）/F05（TASK-RES01227）：公開AI/agent説明の会話入力と実ルール変換、構造化解釈プレビュー/承認の対象を限定確認。Agentが既存policyを割り当てる行為を任意ルール生成へ拡張しない。プラン/提供状態/preview/操作境界を留保し、製品AI操作/認証変更や非公開契約巡回なし。親の別対象を優先。T05も追加調査後に包括検証とdocs/checkpoints/C05/引き継ぎを保存して5/5停止。T03は未開始。
