# 第36バッチ調査報告（C05T03）

2026-10-13 UTC、Connecteam Operations Hub Expertの未着手F04/F05を公式資料で限定調査。新規2文書から4参考記録（確認範囲で未確認4・採用対応根拠0）。TASK-RES01226/01227を未着手→確認中、完了0。別の公式4文書は対照のみで文書/記録を水増ししない。自然言語による任意勤務ルール変換・構造化解釈承認は確認できず、非対応とも断定しない。料金明細/新規課題/制度/独立製品試験追加0。

## 参考記録と対象境界

- F04（未確認・参考）：公式トップはAIへ必要事項を伝えると勤務表を得られると案内するが、今回取得した本文では自然言語を実際の最適化ルールへ変換する仕様を確認できない。

  留保：宣伝文から任意制約の生成/保存、hard/soft、期間/単位/人数の解釈、例外/矛盾入力、日本語、プラン/preview/地域/顧客版を推測しない。リンク先の勤務製品ページとAI一覧/2025ガイドも対照したが、未記載を非対応にしない。製品AI/デモ実行なし。 [公式資料](https://connecteam.com/)

- F04（未確認・参考）：Knowledge Base AgentのCustom Instructionsは知識庫を変えずに回答の焦点・避ける話題・口調を調整する設定と説明する。ここから勤務最適化ルールへの変換は確認できない。

  留保：文書のrulesという語は回答方針の例。勤務条件のhard/softやソルバー入力ではない。Knowledge Base AgentはCommunications Hub Expert・最大20・SBP対象外という別Hub条件で、Operations Expert標準としない。現在の契約/モデル/日本語/実解釈は未確認。既存policy割当APIの一般事項は再登録しない。 [公式資料](https://help.connecteam.com/en/articles/11112114-connecteam-s-knowledge-base-agent-your-company-s-ai-assistant)

- F05（未確認・参考）：Agent編集は知識庫・名称・Custom Instructions・FAQ例・利用者/グループを選び、summary pageを確認してSave Changesする手順。勤務ルールの構造化解釈を適用前に承認する画面とは確認できない。

  留保：設定の保存前確認と自然言語を解釈した規則の事前確認を区別。確認中の副作用抑止、勤務表生成/公開の承認、誤解釈/取消/競合、承認者権限、実画面と版は未確認。非対応の断定ではない。Agent作成/編集操作なし。 [公式資料](https://help.connecteam.com/en/articles/11112114-connecteam-s-knowledge-base-agent-your-company-s-ai-assistant)

- F05（未確認・参考）：利用者のchatは回答後にview sourcesから参照知識庫へ進める。不満な回答はCustom Instructionsか知識庫を更新して改善する案内だが、勤務条件解釈のプレビュー/確定手順は確認できない。

  留保：出典参照は回答根拠の追跡で、実行する制約・単位・期間・hard/softの構造化表示や承認ではない。確認前の自動適用/公開抑止・取消/復元・プラン/版/権限実挙動は未確認。会話保存や知識庫Q&Aを最適化規則対応へ加点しない。 [公式資料](https://help.connecteam.com/en/articles/11112114-connecteam-s-knowledge-base-agent-your-company-s-ai-assistant)

## 判断・検証・保全

トップのAIに要望を伝える宣伝と、KB Agentの回答Custom Instructions、設定編集summary→Save、回答後view sourcesをそれぞれ区別。回答の話題/口調・FAQ例/閲覧対象を、実時刻/資格/人数/hard-softの勤務制約へ変換することは確認できない。設定のsummary確認や出典追跡も、勤務規則の構造化解釈と実行前承認ではない。F04/F05は公開投影でもunknown・findings空、各context_count=3（新2＋旧placeholder）のまま。対応点を増やさず部分資料採用619/2,000は不変。

対照資料はAI一覧（https://connecteam.com/ai-capabilities/）、AI complete guide（12517029、2025-10-05）、利用者KB guide（12291274、2026-07-14）、トップからリンクされた勤務製品ページ（https://connecteam.com/employee-scheduling-app/）。AI一覧は複数AI機能を別に掲載し、KB詳細はCommunications Expert/最大20/SBP対象外。全premiumをSBP無料とする広い宣伝からKBやOperationsへの利用権を確定しない。既存自動割当/料金/契約一般、回答者レビューや第三者AI連携は再登録しない。KB guideの外部処理/学習事項は今回対象へ混ぜず、必要ならN05の別調査で条件を照合する。

公式本文の要約・URL・版/取得日・locator・方法/留保を保存。トップ公開日/顧客版未表示、KB Updated this weekから確定日を作らない。全文/本文hash/公式原本画像未保存。公開developer llms indexはWeb取得不可だったため公開helpを利用し、未取得を製品不存在へ使わない。動画/製品AI/登録/デモ/問い合わせ/API/設定操作なし。

72回帰（研究14・Web Python36・Node22、SQL5含む）合格。39表のB35既存全行保持、integrity/外部キー/SQL往復、非null ingest hash34件合格。50料金サマリー/118明細はB35不変、50詳細投影が読め、4参考記録は静的比較/研究DBへ保持。公開投影は対応根拠0/unknown/context_countで照合。ライブAPI検証ではない。

B36のConnecteam公開行は分割しなければ100,871バイトとなり既存100,000上限を超える。生成器を変更せず6文へ分割（最大50,176バイト）。途中3文から再開して全フィールド/元JSON bytesが一致し、再適用も同じ50行、仮行0、B35既存公開行保持。Timefold行119,943バイトも分割される。保存B35→B36は163文、保存B18→B36は1157文、全SQL最大86,116、往復/履歴保持合格。分割によって最大文長はB35の99,891より短くなったが情報削除による縮小ではない。証拠はbatch36_sql_split.json。

PC1440/スマホ390で追加4ID/4リンク/2URL、未確認/参考ラベル、Ops/Comms対象差、rule変換未知、設定summaryと回答後出典の範囲、B35履歴・価格をDOMと画像で確認。文書/詳細横幅超過なし、console警告/エラー0。CUA画像は会話出力で目視、原本未保存。隔離localhostのみ、承認レビュー許可。viewport/タブ/一時サーバー終了。型/両ビルド/隔離D1/API/38ブラウザ/62SEOはC05T05か実装変更時に実施。C04の結果を今回の実行結果へ転記しない。

累積50提供単位、2,151記録、352調査文書、118料金、39表/12view、制度17、独立試験0。未着手644→642、確認中256→258、停止78・完了2、未完978、優先度1未完29。開始843ファイルの全hashがC05T02 final inventoryと一致。並行45・root/Web README保留・過去成果を保持。開始/反映前backup・ログは.local/research-backups/C05T03。反映前HEAD/対象hash照合後、検証済み対象のみ反映。復旧は後続hashを確認して対象限定、Git reset/cleanやDB全体の後続上書きなし。

本番は本人担当。B18は本人報告のみで再監査せず、以降の公開版を推測しない。本人は反映前の最新研究39表＋公開4表完全exportから差分再構築し、保存baselineを本番代用にしない。schema/競合/対象hash/履歴/SQL上限/往復を照合、研究と投影を同じ対象へ揃える。空DB用d1/import.sqlの既存D1再投入なし。commit/push/CI/deploy/remote DB/課金/認証権限/外部連絡なし。旧費用記録のみ参照しアカウント費用再確認なし。

## 次ターン

C05は3/5、T04〜T05は親の指示待ち。次候補はConnecteam未着手D01（TASK-RES01221）/B06（TASK-RES01215）。Job適格者指定/必要枠、複数勤務表の考慮を新しい公開helpで照合し、資格別必要人数/医療資格とJob適格性、cross-schedule表示/考慮と一括同時最適化を分ける。既存一般資格/重複警告を再登録しない。親の別対象を優先。T05にも実質追加調査を行った後に包括検証とdocs/checkpoints/C05/引き継ぎを保存し5/5停止。T04は未開始。
