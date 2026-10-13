# 第37バッチ調査報告（C05T04）

2026-10-13 UTC、Connecteam Operations Hub Expertの未着手D01/B06を公式4新規文書で限定調査。6記録（部分確認5・未確認参考1）、4新規調査文書。TASK-RES01221/01215を未着手→確認中、完了0。Job適格者/募集枠と医療資格人数、共有Job設定/一元Jobs Tab/他表表示と共有職員同時最適化を区別する。料金/制度/新規課題/独立製品試験追加0。

## 追加根拠・参考の境界

- D01（部分確認）：JobのQualified欄で利用者・Smart Groupまたは両方を選ぶ。Sub-jobの適格者は既定で親Jobと同じで、Use same settings as parent jobを外すと別の利用者/群へ変えられる。

  留保：適格者の管理指定で、医療資格マスターとの照合・期限/失効の自動更新・資格AND/OR・職種組合せの必要人数/違反検出ではない。Smart Groupの所属変更反映時点、親設定変更/既存勤務への影響、顧客版/Expert権利・実拒否は未確認。既存自動割当の一般適格性を再登録しない。 [公式資料](https://help.connecteam.com/en/articles/10550418-qualifying-users-to-jobs)

- D01（部分確認）：Open Shiftは勤務のJobを指定してavailable spotsを設定し、未充足枠数を表示する。公開・応募はそのJobの適格者が対象で、通常は先着応募で本人の勤務表へ追加される。Open ShiftはOperations Basic以上、承認付きはAdvancedからと説明する。

  留保：1つのJobに対する募集枠と適格者範囲の部分確認。枠数は臨床配置基準・資格別最低人数や同一勤務の資格構成比ではない。資格失効/兼務二重計上・未充足違反の独立検算、実応募/Expert個別契約/上限/顧客版は未確認。既存一般Open Shift承認やC05応募制限は反復しない。 [公式資料](https://help.connecteam.com/en/articles/6441778-how-to-create-open-shifts)

- B06（部分確認）：Resource/Jobの作成時に、適格者と割り当てるTime Clock・Job Schedulerを選べる。同じJobを編集すると、そのJobを利用する他のTime Clock・Schedulerにも影響すると説明する。

  留保：共有するのはJob設定オブジェクト。施設/職種名をResourceとして表すことと、共有職員を複数表同時に最適化することは別。編集反映の原子性・既存割当再計算・アクセス範囲/顧客版/プラン・実境界は未試験。医療施設間移動/合算人数を推測しない。 [公式資料](https://help.connecteam.com/en/articles/8529732-scheduler-understanding-resources-jobs-clients-projects-sites-vehicles-and-how-to-use-them)

- B06（部分確認）：Time ClockまたはJob Schedulerが複数あるaccountでは、全Clock/SchedulerのJobを一元管理するJobs Tabを表示する。各1個だけのaccountでは独立Jobs Tabを表示せず、各機能内から管理する。

  留保：一元管理はJob/適格者の設定場所で、一括勤務計画や同時ソルバー実行ではない。表をまたぐ職員需要の統合・同時更新・全施設最適性/不足充足は未確認。UI条件とライセンスの最大表数を混同せず、既存12スケジュールの根拠は追加しない。 [公式資料](https://help.connecteam.com/en/articles/10550418-qualifying-users-to-jobs)

- B06（部分確認）：他表データを含める設定は勤務表ごとに有効化し、他表の草案勤務を含めるかも選択する。Cross-schedule events表示はView by Usersでのみ現れ、View by Jobには現れない。Time Off表示にはSchedulerとTime Clockの同期条件がある。

  留保：他表情報の可視化条件を確認しただけで、一括最適化の実行範囲ではない。表示OFF/草案除外と内部自動割当の考慮を同一視しない。複数表の休息/最大時間/移動・同時編集・time-off種類/同期遅延は未試験。Cross Schedule IssuesはOperations Expertから、顧客の現行版/契約は未確認。 [公式資料](https://help.connecteam.com/en/articles/6081010-cross-schedule-issues)

- B06（未確認参考）：Cross Schedule Issuesは他表の勤務/不可等を通知するが、通知にかかわらず管理者が配置しても阻止しないと明記する。この本文から共有職員を複数表で同時最適化する実行・結果は確認できない。

  留保：手動配置の通知は自動割当のhard条件/他表再配分の試験ではない。相互の未割当勤務をまとめて解くAPI/UI、全表共通目標/優先度、同時実行/更新競合、独立検算は未確認。既存の重複警告という一般事実を水増しせず、今回追加は明示的手動overrideと一括実行の留保。非対応とは断定しない。 [公式資料](https://help.connecteam.com/en/articles/6081010-cross-schedule-issues)

## 判断・検証・再開と保全

Job/Sub-jobのQualified Usersは管理者が利用者/Smart Groupを指定する設定。親Job継承と個別設定、Job適格者に公開する募集人数枠/未充足表示とBasic/Advanced境界を部分確認。医療資格の期限/失効自動判定・同一勤務の資格別最低人数/構成比・配置基準違反の独立検算や実応募は未確認で完了にしない。

同じJobを複数Clock/Schedulerに割り当て編集が他表へ及ぶ設定と、複数機能があるaccountの統合Jobs Tabを確認。これはJobカタログの共有/一元管理で、全施設の共有職員を同時最適化する実行ではない。他表表示は各勤務表の有効化・草案含有・Users表示専用・Time OffのClock同期が条件。通知が出ても管理者配置を阻止しない明記は未確認参考へ保存し、B06の一括solver/全表共通目標・再割当/不足充足/同時更新は確認できない。既存一般資格/重複警告/最大12表/応募制限は再登録しない。

Resources説明は旧6111368→8529732、適格者説明は旧6440898→10550418、crossは同じ6081010の新slugへredirect、取得後canonicalを保存。Resources Tabありという対象条件・相対更新表示から確定日を作らない。Scheduler文脈でthis time clockという語が混在し、プラン/顧客版/実反映を推測しない。要約・URL・版条件・取得日・locator/方法・留保を保存。全文/本文hash/公式原本画像未保存。動画/デモ/製品試験/API/設定操作/問い合わせなし。

72回帰（研究14・Web Python36・Node22、SQL5含む）合格。39表のB36既存全行保持、integrity/外部キー/SQL往復、非null ingest hash35件合格。50料金/118明細はB36不変、50詳細のSQLite投影で5limited根拠（D01=2/B06=3）、B06 context_count=2（新参考1＋旧placeholder）、前turnF04/F05はunknown/context_count=3を保持。ライブAPI検証ではない。

新Connecteam公開行109,549バイトは6文に分割、最大50,176。途中3文から再開して全フィールド/JSON bytesが一致し、再適用で50行/仮行0、B36公開行保持。Timefold119,943も分割。生成器/入力内容の変更なし。保存B36→B37は177文、保存B18→B37は1205文、全SQL最大86,116（100,000以内）・往復/旧行保持合格。split証拠はbatch37_sql_split.json。

PC1440/スマホ390で6追加ID/6リンク/4URL、部分/参考ラベル、Job枠/適格者と臨床資格未知、共有カタログと同時最適化未知、草案/表示/同期・manual override・プラン条件、B36履歴/旧価格をDOMと画像で確認。横幅超過なし、console警告/エラー0。CUA画像は会話出力で目視し原本未保存。viewport/タブ/一時サーバー終了。型/両ビルド/隔離D1/API/38ブラウザ/62SEOはT05包括検証、C04の結果を今回の実行結果へ転記しない。

累積50提供単位、2,157記録、356調査文書、118料金、39表/12view、制度17、独立試験0。未着手642→640・確認中258→260・停止78/完了2、未完978、優先度1未完29。部分資料採用619→621/2,000は完了・品質点数ではない。

開始865ファイルの全hashがC05T03最終inventoryと一致。途中で親から利用上限による停止位置確認/再開指示（Sentinel_670d7cdb38488191b91f331eb5b7d0e6、2026-10-13 15:36 JST）を受け、正本B36/active T04、HEAD、開始台帳・backup865全hash、B37 ingest hash、既存source/price/split/72回帰ログ/両幅CUAを照合。競合/削除0、既知server/testはexit0、読み取り許可済みfocused pgrepにも残プロセスなし。B37再生成/再ingestや検証済み調査の再取得はしない。現在のツール実行は成功し、購入/利用枠reset/別executor/別経路への切替はなし。実利用枠の解消・残量を推測せず、新しい利用エラーなら止める。resume-review記録を保存。

並行45・root/Web README保留・過去成果を保持。開始/反映前backup・ログは.local/research-backups/C05T04。反映前HEAD/対象hashと他者変更を照合し検証対象のみ反映。復旧は後続hash確認後に対象限定、Git reset/cleanやDB全体の後続上書きなし。本番は本人担当、B18本人報告のみで再監査/以降公開版推測なし。本人は最新研究39表＋公開4表完全exportから差分再構築しschema/競合/hash/履歴/文サイズ/往復を照合、研究と投影を同じ対象へ揃える。空DB用d1/import.sqlを既存D1へ再投入しない。commit/push/CI/deploy/remote DB/課金/認証権限/外部連絡なし。旧費用記録のみ参照、アカウント/利用枠/費用の再確認なし。

## T05候補・停止計画

C05は4/5、T05は親の指示待ち。次候補Connecteam未着手N05（TASK-RES01244）：KB Agentの公開外部LLM処理/学習利用/保持に関する新しい出口事項と、公式のAI条件/プライバシー資料を照合。回答系と勤務最適化系/Hub・委託先・処理条件・対象契約を分け、FAQの一般表現をすべてのAIや顧客契約へ拡張しない。非公開契約の巡回やAPI/製品AI/認証設定操作なし。親の別候補を優先。T05も実質追加調査後に72回帰/型/両ビルド/39表履歴/隔離D1/API50/38ブラウザ/62SEO/manifest/両幅の包括検証、C05合計/変更/backup照合とdocs/checkpoints/C05/引き継ぎを保存して5/5停止。T05は未開始。
