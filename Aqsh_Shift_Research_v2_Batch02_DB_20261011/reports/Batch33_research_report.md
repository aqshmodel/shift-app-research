# 第33バッチ調査報告（C04T05）

2026-10-13 UTC、最終ターンでもTimefold未着手C01/I06へ実質追加調査を実施。新規公式5文書から6部分確認を追加し2課題開始、完了0。ESS固定1.35.x2文書の週次/CUSTOM rotationと勤務列から3記録、Platform latest3文書の技能別入力what-if/preview Experiments/Comparisonsから3記録。rotation1文書は2つの異なる条件を持ち、文書数へ重複計上しない。新規料金/制度/課題0、独立製品試験0。

## 根拠・条件・不足

- C01：1.35.xはcontractsのshiftRotationRulesにWEEKLY/CUSTOMと複数rotationGroupsを定義し、勤務タグで勤務種別をまとめる。週次REQUIREDはある期間の1groupから次期間は別groupへ移るhard制約で、違反する割当は未割当になる。PREFERREDはsoft条件である。

  留保：モデル化された勤務種別の交代を部分確認したが、病棟内の二交代/三交代混在プリセット、日本の夜勤体系/境界日/祝日跨ぎ・時差/DST・複数契約競合の実試験は未確認。rotationGroupのANYやinclude/exclude排他はこのルールの条件で、既存B29のタグ一般を反復しない。固定文書版は顧客実行版/プランの認定ではない。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/shift-rotations-and-patterns/shift-rotations)

- C01：CUSTOM REQUIREDのrequiredRotationPeriodMaxSizeInDaysは同じrotationGroupの期間の最大日数を定める。公式例は1月1/2/3/5日の朝勤務を5日間、1月8/10/11/13日の午後勤務を6日間と数え、異なるgroup期間の間の1月6/7日の休日を含めない。

  留保：最大日数は割当勤務の件数や連続勤務日数と同じではない。期間内の空き日とgroup間の休日の扱いを混同しない。夜勤跨日・ローテーション開始/終了境界・前月からの継承・複数体系混在/三交代固定順序は未検証。PREFERREDのmin/maxをREQUIREDの最低日数保証にしない。週次とCUSTOMを1観測に混ぜず、同一文書数を水増ししない。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/shift-rotations-and-patterns/shift-rotations)

- C01：multiDayShiftSequencePatternRulesを契約に設定し、職員へ契約を紐付け、勤務タグに一致するONとOFFの順序を定義する。PREFERREDは部分的なpattern要素にsoft報酬、UNPREFERREDは完全一致した列にsoft罰則、PROHIBITEDは翌日のLate→Early等の列をhard条件で禁じる例を示す。

  留保：勤務列の表現・例を部分確認しただけで、混在交代制度・臨床配置基準・法令適合・月境界/夜勤日帰属の保証ではない。PROHIBITEDの説明はmulti dayとsingle dayの制約名を併記しており、名称の誤記/実制約対応は未確定。soft条件は満たされなくても割当され得る。実出力、顧客現行版/プランは未確認。 [公式資料](https://docs.timefold.ai/employee-shift-scheduling/1.35.x/employee-resource-constraints/shift-rotations-and-patterns/multi-day-shift-sequence-patterns)

- I06：公開ガイドは特定技能を持つ職員を追加/削除した入力を送って生産性の変化を比較し、勤務pattern・skill mix・team構成を変えるwhat-if simulationを案内する。Experimentsで変種を体系的に比較する導線も示す。

  留保：候補条件を利用者が用意する比較手順で、最適な採用資格/曜日/時間や最小採用必要数を自動算出/証明するとは確認できない。曜日/時間の可用条件・契約・費用・需要/期間を揃えた候補別実評価、改善量の統計確度、プラン/実行版とpreview利用権は未確認。B29技能やB30採点の一般事項は再登録しない。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/guides/uncovering-inefficiencies-in-operational-planning)

- I06：previewのExperimentsは既存dataset IDを参照し、新しい入力は先にsolveせず登録する。入力変種とmodel version/profile/overrideを定義するscenarioを組み合わせ、M datasets×N scenariosのsolveを行い、scenarioごとの集計指標とbaseline差分を比較する。作成はAPI、結果参照はUIと説明する。

  留保：入力を作り分ける操作とscenarioの解き方設定を区別する。API例はscenarioごとのdatasets配列だが文章は全M×Nであり、異なる集合の実行網羅性は未試験。集計指標を個別資格/曜日/時間の不足原因や最小採用数の証明へ拡張しない。preview・早期利用問い合わせ・プラン/費用/資源配分は未確認。API/実験/キー/権限変更なし。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/how-tos/experiments)

- I06：previewのComparison UIは選択datasetの人員/仕事数等のinput metricsとoutput metrics・scoreを比較する。列は単一または複数datasetの平均で、上限10列・1列50dataset。実効configurationは単一dataset列でのみ表示し、個別職員指標/資源割当の比較は対象外と明記する。

  留保：高水準の比較で、採用候補ごとの勤務成立/不足解消の因果や資格・曜日・時間の必要人数を直接証明しない。平均による不足ピークの隠れ・期間/需要/制約/版の差を別に評価する必要がある。previewと商用プラン/実動作は未確認。CSV/exportは本ターンの観測へ重複追加せず、M08の全量出口保証にも使わない。 [公式資料](https://docs.timefold.ai/timefold-platform/latest/how-tos/comparing-runs)

病棟内の二交代/三交代混在プリセット、夜勤跨日/日帰属/前月継承、複数契約競合、臨床配置/法令適合を一般的なtag/contract/pattern入力から保証しない。CUSTOM期間は勤務件数/連勤日数と別で、同group内の空き日とgroup間休日を分ける。技能別入力追加/削除・scenariosの解き方設定と、最小採用数や資格/曜日/時間の不足原因の証明を分ける。preview利用権と顧客現行版/プラン・費用は未確認。

勤務列PROHIBITED節はmulti dayとsingle dayの制約名を併記し、通常Chromeでも一致した。誤記/内部対応/別版を推測しない。補足として同ページはREQUIRED不支持、OFF開始/終了はplanningWindowが必要、同日の複数勤務にはshiftMatchesがありshiftTagMatchesと別と記す。これらは追加観測を水増しせずsource_verificationの補足に保存。Experiments文章は全M×N、POST例はscenarioごとのdatasets配列で、異なる集合時の実網羅性は未試験。preview・集計・平均・単一列だけのconfig・10列/50dataset上限を保持する。

公式URL/版/locator/取得日/方法/要約/留保を保存。全文・本文hash・公式原本画像は未保存。公開/更新日未表示。登録/キー/認証権限/設定/Timefold API/実験/問い合わせなし。

## 最終包括検証

72回帰（研究14・Web Python36・Node22、SQL分割の新5試験を含む）、型58ファイルでerror/warning/hint0、staging/production2ビルドとWorker名/ENVIRONMENT/D1 ID/staging GA4非継承の照合が合格。既存node_modulesを隔離コピー、インストールなし。T05コード変更なし。B31の分割SQL生成器/fixture修正を保持した。

DB整合性/外部キー/SQL往復、B32およびC04基点B28から39表の既存全行保持（指定可変欄のみ）、非null ingest hash31バッチを照合。B01/B02旧nullを検証済み件数に含めない。全50料金はB32/B28から不変、118明細・Timefold構造化価格0を保持。50詳細の投影/hash・6採用部分根拠/旧contextを確認。空の隔離ローカルD1のみ初期化し39表一致、実際のローカルWorker API50料金/50詳細/版/hashが一致。全ブラウザ/画面検証後もD1/APIを再照合。

38ブラウザ全成功・retry/skip/flaky0。PC/スマホ、JSなし、比較/履歴/価格、WebMCP/取消、同意、WCAG自動検査を含む。外部DNSはloopback以外を遮断、計測の本番風URLはmockだけ。62ページのmetadata/canonical/JSON-LD/H1/重複は問題0、local devのnoindexヘッダー62件は期待値で本番検索登録の再監査ではない。CUA PC1440/スマホ390pxで新6本文・5unique URL・混在/必要人数/preview/価格/旧全量未知の留保を確認、幅超過なし・console error/warning0。スマホC01見出しをviewport内で目視した。外部ロゴ可用は独立未検証。タブ/viewport/サーバーを停止。

初回価格probeはComparisons留保にない「最小」という語を期待して止まり、実際の「必要人数」へ照合を修正。B33入力/DB/公開SQL/実装は変えない。SEO初回はsandboxのlocal socket拒否で止まり、レビュー許可済みloopback読取で62合格。自動承認レビュー拒否を迂回していない。

B32→B33差分176文、保存B18→B33差分1021文、最大86,116バイト/100,000以下、SQL往復/旧公開行保持合格。現行本番完全exportをbaselineとした差分ではなく、最新完全exportから差分を作り直す。初期化用import.sqlを既存DBへ再投入しない。

累積50提供単位、2,135記録、342調査文書、118料金、39表/12view、制度17、独立試験0。未着手650→648、確認中250→252、停止78・完了2、未完978、優先度1未完29、資料部分採用613→615/2,000。

## サイクル・保護・停止

C04全5ターンで31記録（部分27・未知4）、28出典取得、新しい調査文書25件、登録文書26件（B30対照専用1を別計上）。全てTimefoldの新しい設問範囲で、10課題を確認中へ変更し完了0。docs/checkpoints/C04/に全サイクルの根拠/状態/残数/SQL修正/変更/未確認/公開差分条件/バックアップを保存。T01〜T04開始・反映前の全backup hashを再照合。T05開始767ファイルを保持、反映直前にも照合し対象だけ反映。並行45、root/Web README保留、過去turn/checkpoint/既存未コミット成果を保護。

SQL修正はB31候補の101,655バイト文が100,000上限で止まったため、仮slug/length付きappend/JSON検査の分割生成を採用。完成行に触れず中断/再開/再適用を保護し、同じB31の前後で全公開表/JSON bytes/研究・内容hashを保持した。上限緩和/根拠削除/ingest入力変更なし。B33は新しい根拠を追加した別hashであり、B31と同hashという意味ではない。

本番B18は本人報告のみ、以後の公開版は推測しない。今回本番/API再監査/remoteDB/公開/commit/push/CI/課金API/アカウント費用確認/認証権限/プラン変更/外部連絡なし。C04は5/5で停止し次サイクル/新チャットを自動開始しない。本人が次サイクルを依頼した場合の候補はConnecteam Expertの未着手C05（TASK-RES01220）/K01（TASK-RES01236）。公開helpの休息設定/警告とExcel取込条件を限定調査し、hard/警告・自由形式/定型・Expertプランを分ける。高優先29件でも新しい公開根拠があれば優先し、非公開契約の巡回や営業連絡へ置換しない。
