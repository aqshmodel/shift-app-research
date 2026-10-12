# 第18バッチ：Nursegrid Managerの限定追加調査

2026年10月12日。Nursegrid Manager（OF-US08）の自動割当、Mobileとの機能・契約境界、支援に限定しました。公式6本文から6記録を追加し、資料記載の部分確認4件と記載未確認2件を区別しています。累計50提供単位、2,037文書記録、277調査文書、118料金明細。独立製品試験、料金、ロゴ、制度参照の追加はありません。

## 追加した根拠と留保

- [調整・公開手順](https://healthstreamhelp.mcoutput.com/nursegridmanager/Content/NG_Manager/Schedule_Mgmt/Balancing_and_Publishing_a_Draft_Schedule.htm)は、管理者のグリッド操作による割当と人数の不足・充足・超過表示を説明します。[自己割当希望の承認](https://healthstreamhelp.mcoutput.com/nursegridmanager/Content/NG_Manager/Schedule_Mgmt/Reviewing_and_Assigning_Self_Scheduling_Responses.htm)の一括承認後は過剰配置を手動で解除します。全体の制約付き自動最適化、制約検証器、実動作は未確認のままです。
- [Schedule Builder](https://healthstreamhelp.mcoutput.com/nursegridmanager/Content/NG_Manager/Schedule_Mgmt/Creating_a_Draft_Schedule_with_the_Schedule_Builder.htm)は職位・タグ・FTEに応じた自己割当段階を設定し、段階に含まれない職員は自己割当できないと説明します。受付順から勤務量の公平性算式は推定していません。
- [Restricted Users](https://healthstreamhelp.mcoutput.com/nursegridmanager/Content/NG_Manager/User_Management/Restricted_Users.htm)は空きシフト受信を制限する設定です。Mobile未利用、課金対象外、全機能禁止を意味すると扱っていません。
- [AppのFAQ](https://nursegrid.com/for-nurses/nursegrid-app/)の個人向け無料と、組織向けManagerを区別しました。Managerの既存月額USD5/職員の料金記録を保持し、無料へ変更していません。
- [Manager公式案内](https://nursegrid.com/for-organizations/nursegrid-manager/)はManager/App別の公開ヘルプと一般問い合わせ導線を載せています。Manager技術支援の営業時間・応答目標・保証・言語・料金内包は未確認です。営業フォームを技術SLAとして扱っていません。

詳細4ヘルプはWebツールでは取得できず、公式目次から公開ブラウザで本文を確認しました。各本文の更新日は2025-09-09で、任意・役割別機能という既存の注意も保持しています。月5ドル、試用30日、2〜250人、自己割当の一般説明、任意機能の一般注意は再登録せず再確認ログに留めました。全文・本文ハッシュは未保存です。製品ログイン、登録、問い合わせ送信、デモ、営業連絡は行っていません。

## 課題と検証

TASK-RES01168、01171、01200を更新しました。未着手2件を確認中へ進め、既に確認中だった契約境界も継続しています。完了扱い0件、新規課題0件。未着手682、確認中218、取得不可で停止中78、完了2、未完了総数978、優先度1の未完了29件です。共通40項目の資料採用は592/2,000枠で、部分確認を含む資料の充足状況です。

分離ローカルコピーでDB整合性・外部キー・SQL往復、既存39テーブルの行保持、研究14・公開投影と差分更新12・Node22の48テストが成功しました。比較画面とNursegrid詳細を1440px・390pxで確認し、全50サービスの料金概要がB17と一致しました。製品の独立性能試験とは別の検証です。

準備版はB18-20261012-pub2、B12からの差分SQLは1,397文で、全39テーブルの一致と過去の公開版保持を確認しました。最後に検証済みの本番版はB12-20261012-pub2です。B13〜B18を本番・検証環境へ反映していません。コミット・プッシュ・CI・Cloudflare更新・追加有料API利用は行っていません。

型・ビルドはアプリ実装変更がなく今回再実行していません。次のC01T04で公開検証スクリプトのB12固定期待値を選択版へ合わせ、古い期待値・不一致の検証をローカルで行います。C01T05で包括検証と引き継ぎを予定し、公開判断と次のチャット開始は親へ引き継ぎます。

根拠はbatch18_validation.json、batch18_history_preservation.json、batch18_regression.json、batch18_deduplication.json、batch18_source_verification.json、batch18_price_summaries.json、viewer_validation_batch18.json、batch18_viewer_scope.json。ターン記録はdocs/research-turns/C01T03.jsonです。
