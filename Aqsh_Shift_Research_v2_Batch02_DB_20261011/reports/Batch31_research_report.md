# 第31バッチ調査報告（C04T03）

2026-10-13 UTC、Timefoldの未着手N01/K03を新規公式6資料（ESS固定1.35.x1・Platform latest5）で限定調査。6部分確認・新規6調査文書を追加し、N01（TASK-RES01293）/K03（TASK-RES01288）を未着手から確認中へ変更。完了0・新規課題0・新料金0・制度追加0・Timefold独立製品試験0。B21の支援/価格/契約一般、B25の重み一般、B29の部署タグ/技能、B30の採点API一般を再登録しない。

## 新しい根拠と適用境界

- N01：Platformはテナントを主な分離境界とし、モデル・データセット・メンバー・APIキー等をテナントごとに保持し、他テナントのデータをDB/アプリ両層で隔離すると説明する。所属する複数テナントの切替は可能。EU/USの名前空間は別で、self-hostedは1設置1テナントと明記する。

  留保：Platform latestの提供者記載で侵入/権限試験や第三者保証ではない。Cloudの複数テナントとself-hostedの単一テナントを同じ条件にしない。業務の施設/部署タグをテナント分離と見なさず、地域間データ同期・テナント数/追加費用・顧客プラン適用は未確認。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/api/integration-scenarios/multi-environment)

- N01：Viewerはテナント内のモデル・全データセット・設定プロファイルを閲覧、Userは作成/再実行/取消や名称・タグ編集、Administratorは設定プロファイル・キー・メンバー・モデル等の管理を追加すると説明する。招待時に期限を指定し、Solutions Engineerの一時アクセスにも利用する案内がある。

  留保：Platform latestの役割一覧。部署/本人単位のデータ行ACL・ロール変更や期限切れの反映時間・運用者の恒常アクセス範囲・実拒否は未確認。Experimentsはpreviewで、通常のtenant role一覧とは別にModel API keyの操作scopeで制御する但し書きがある。Userという名称だけで実験操作可と一律判断しない。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/how-tos/member-management-and-roles)

- N01：Model APIキーはユーザー文脈を持たずテナントと選択モデルへ紐付き、全モデル/選択モデルと全操作/選択操作を選べる。期限未指定は30日、revoke後の後続API呼出は失敗すると説明する。ReadのみではPOST recommendationsやPOST score-analysisを呼べず、作成権限の対象として表記する。

  留保：Platform latestの文書条件で実拒否/期限境界/取消伝播/処理中リクエストは未試験。全管理者にキーがvisibleという記載を秘密値の再表示可否と同一にしない。権限名とHTTPメソッドは単純一致せず、DELETE /idはUpdate、/id/purgeはDelete、取得済みscore-analysisのGETは各操作列で可と表記する。プラン/実行版/外部顧客ACLは未確認。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/how-tos/tenant-api-keys)

- N01：GET /api/aboutmeは現在のキー名、所属テナントとplan、resource/operationsの権限を返す診断方法を案内する。キーがない/未知/期限切れの場合は401と説明し、例のAPIキーcallerはroleやemailがnullでもMODEL/EXPERIMENTの操作権限を別に持つ。

  留保：Platform latestの応答例で今回呼び出していない。例のENTERPRISEや全CRUDを顧客の契約/既定権限にしない。キーcallerのrole=nullを無権限・匿名職員の証明にせず、endpoint応答の権限情報と実データアクセス拒否を分ける。無効化・モデルscope・トークン共有時の実動作は未検証。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/api/model-api-usage)

- K03：1.35.xの統合手順は、顧客システムが業務データを集め入力を作り、Timefoldへ送信し、返された最適化結果を顧客側で処理する流れを説明する。計画データと計画モジュールは顧客自身のbackendまたはCRM内に保持する構成とする。

  留保：顧客側実装を含む手順の部分確認で、完成済み職員UI・マスター作成・日本の勤務規則の自動設定/ベンダー代行を保証しない。B01のAPI分類/M04のREST一般は再登録しない。実際の担当者/代行/共同設定/個別開発、工数・データ整備・移行責任・契約プランの作業分担は未確認。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/user-guide/integration)

- K03：Platformの設定プロファイルはモデル単位で、read-onlyのStandardを既定とし、独自プロファイルを作成/複製して重み・モデル設定・solve設定を保存する。適用はIDまたは名前/画面から選び、入力設定→一時override→profile→親dataset→model既定の順で決まると説明する。

  留保：Platform latestの設定手順で、固定ESS1.35.xモデルの全設定や顧客版を認定しない。Members資料はprofile作成/編集/削除をAdministratorに追加するが、dataset overrideの操作権限の全行列は未確認。入力プロファイルの選択と編集を同一にしない。model/tenant planの上限があり、名前変更で指定先が一致しなくなる留保を保持。作業代行/検収/工数/契約適用は未確認。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/how-tos/configuration-parameters-and-profiles)

Platform latestの役割・設定・テナント/地域/設置境界を、固定ESS1.35.x統合手順の版と同一にしない。顧客の現行版とプランは未確認。テナント隔離は提供者記載の確認で、部署/本人の行ACL、取消/期限境界、内部運用者の権限、実拒否・第三者保証は未試験。Cloudとself-hostedの条件、複数所属の切替と無権限横断を分ける。部署タグから認可を推測しない。

Member一覧のUserは実験view/create/runを含む一方、ExperimentsはpreviewでModel API key operation scopeが制御する明示例外がある。通常roles全文の相反と断定せず、User名称だけで実験を操作できるとも判断しない。API権限名とHTTPメソッドの単純一致も避け、取消DELETE /idとpurge DELETE /id/purge、保存済み採点GETと新規採点POSTを区別。API keysの旧introリンク404は現行のMembers→Model API usage→API Keys導線で補完し、サービス/API終了とはしない。404自体を文書件数に追加しない。

設定主体は顧客側backendの収集/入力/結果処理、モデル単位profileの作成/編集と選択、入力/override/profile/親/モデルの優先順位で部分確認。設定UIがあることを全初期設定代行・日本向け規則マスターの自動整備・契約検収の完成としない。契約別の代行/共同設定/個別開発、工数・プラン・費用の作業分担は不足。契約支援の同じ巡回や営業連絡をしていない。

6資料の本文・URL・版・locator・取得日・方法・留保・要約を保存し、API keysは通常Chrome本文/権限表でも照合。公開/更新日未表示。全文/本文ハッシュ/公式原本画像未保存。アカウント登録・招待・キー生成/認証/権限/設定変更・aboutme等のTimefold API・試用・問い合わせなし。

## 公開SQLの上限修正

追加データで旧公開SQLの1文が101,655バイトとなり、研究差分生成の100,000バイトという保守的上限に止まった。正本への反映前であり、B31入力やingest hashは変えていない。候補SQL/manifest/生成器を耐久バックアップのoversized-candidateへ保存。

build-publication.pyにpublication_sql.pyの分割出力を追加。大きな製品行だけ仮slugで作り、検索/summary/detailの文字列をサイズ付きchunkで組み立て、長さとJSON整合性を満たしてから正規slugへ移す。完成済み行は仮slug条件に一致せず更新しない。live切替も未完成slug/不正JSONの行を数えない。全50公開行・全公開表を旧候補とバイト単位で比較し、研究/内容hashと全情報が不変、再適用でも行が不変、最大1文86,116バイトに収まった。上限の緩和や根拠削除はしていない。

新しい5試験は大きい日本語/引用符の保持、100,000バイト以下のSQL、再適用/既存行保護、中断時の切替防止/再開を検証。既存のfuture snapshot試験はSQL文字列のID置換でchunk長さ条件を壊すため、SQLから完成行を実体化後に合成fixtureのID/価格を変える方法へ修正。試験の価格追従の目的を保持し、正本の過去データを変更していない。変更は生成器・helper・2試験ファイルで、Astro/TS/browser実装変更なし。

## 検証

72回帰（研究14・Web Python36・Node22）合格。型58ファイルでerror/warning/hint0、staging/productionビルド2とWorker名/ENVIRONMENT/D1 ID照合合格。既存node_modulesを隔離コピー、インストールなし。型生成は初回runner未作成、次のsandbox local-listen権限不足で止まり、準備後/レビュー許可済み昇格で合格。自動承認拒否を迂回していない。

DB整合性/外部キー/SQL往復、B30から39表の既存全行保持（指定可変欄のみ）、非null ingest hash29バッチを確認。B01/B02の旧nullを検証済み入力件数にしない。50料金と118明細はB30から不変、Timefold構造化価格0、6部分根拠と旧文脈を保持。SQL投影の内容hashも同じ。空の隔離ローカルD1へだけ初期化し39表一致、ビルド済みWorkerの実API50料金/50詳細/版/hashを照合。

38ブラウザケースのうち初回35合格、3件は相対スクリーンショット保存先がない環境エラー。専用cwdとdocs/screenshotsを隔離側に用意し、この3件だけ再実行して合格、38ユニークケースを確認（skip/flaky0）。JSなし・料金/比較/履歴・WebMCP取消・同意・WCAG検査を含む。外部DNSはループバック以外を遮断し、計測の本番風URLは模擬応答のみ。新規N01/K03の6本文と出典・役割/key/契約留保をCUA DOMで確認。PC1440/スマホ390pxで本文幅超過なし、返されたconsole error/warning0。CUA画像は会話出力で目視、試験自動生成画像/結果/traceは耐久バックアップへ保存。外部ロゴは未検証。

62ページの本文メタ・canonical・JSON-LD・H1・重複検査は問題0。local devのnoindexヘッダー62件は期待どおりで本番の検索登録可否ではない。全ブラウザ後に39表D1と50 APIを再照合、テスト用サーバーとタブを停止しviewportを解除。

ローカルB30→B31差分181文、保存B18→B31差分916文。SQL往復/旧公開行保持が合格。現行本番完全エクスポートに基づく適用差分ではないため、反映担当は最新baselineから作り直す。初期化用d1/import.sqlを既存D1へ再投入しない。研究と公開投影を同じ版へ揃える。

累積50提供単位、2,123記録、333調査文書、118料金明細、39表・12ビュー、制度17・Timefold独立試験0。未着手654→652、確認中246→248、停止78・完了2、未完978、優先度1未完29。共通資料採用610→612/2,000は部分採用で、全要件確認/課題完了/品質点数ではない。

## 保護・停止

開始718ファイルをバックアップしC04T02最終inventoryと一致。反映前HEAD/対象hash/他者変更を再確認し、必要な対象だけ正本へ反映。並行45ファイル、root/Web README保留、以前のターン/チェックポイントを保持。生成器は45保護対象の外で、開始時の既存未コミット内容を基に限定修正。バックアップ/ログ/runtimeは.local/research-backups/C04T03。復旧は後続hashを照合して対象だけ戻し、Git reset/clean、共有DB初期化、後続DBの全体巻き戻しをしない。

旧費用/本人報告だけ参照。現在のアカウント/費用/使用量は再調査せず、今回課金API/プラン/予算/権限認証変更/外部連絡/commit/push/CI/deploy/遠隔DB操作なし。本番B18は本人報告として把握のみ、以降の公開版は推測しない。本番反映は本人担当。

C04は3/5でT04以降は親の指示待ち。候補はTimefold未着手K01（TASK-RES01286）/M08（TASK-RES01292）。公開の入力形式/変換・dataset/profile/ログ等のexportを限定照合し、既存Excelの直接取込とJSON生成、通常exportと解約全量出口を区別する。非公開契約の反復だけなら他の未着手公開項目へ切替候補を報告。T05も実質追加調査を含め、その時点の包括検証とC04引き継ぎを保存して5/5停止。
