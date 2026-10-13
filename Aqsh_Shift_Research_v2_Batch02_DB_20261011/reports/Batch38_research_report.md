# 第38バッチ調査報告（C05T05）

2026-10-13 UTC、Connecteam N05へ追加調査。公式5資料（新規4・KB既存1の新段落）から6部分記録、TASK-RES01244を未着手→確認中、完了0。

- 部分確認：KB Agent FAQは回答処理に必要な最小限の関連データをAzure OpenAI/Gemini/OpenAIへ送信し、処理後のLLM基盤で保持せず、モデル学習/改善にも利用しないと説明する。

  留保：対象はCommunications Expert以上のKB Agent（20まで、SBP対象外）。送信フィールド一覧/自動匿名化/実プロンプト・provider別ルート/例外・ログ/Connecteam側履歴保持・顧客契約適用は未確認。Operations Expertの全AI/自動割当へ拡張しない。委託先一覧のAnthropicとの差は別記録へ保存。 [公式資料](https://help.connecteam.com/en/articles/11112114-connecteam-s-knowledge-base-agent-your-company-s-ai-assistant)

- 部分確認：KB Agentは対象Agentの三点メニューからDeactivateでInactiveにし、Activateで再有効化すると説明する。

  留保：個別KB Agentの状態操作であり、全AI/全外部送信の一括停止、既存データ削除/保持終了、Account Ownerの権限試験やスケジュールAI停止ではない。管理画面/送信停止の実観測/顧客版/復帰時挙動は未確認。 [公式資料](https://help.connecteam.com/en/articles/11112114-connecteam-s-knowledge-base-agent-your-company-s-ai-assistant)

- 部分確認：AI特約のContent Rightsは、ConnecteamによるUser ContentでのAI Features横断学習/改善を禁じ、AI委託先のモデル学習/改善を積極的に許可しない一方、User Content/Outputをサービス提供・改善・保守等へ用い得ると記載する。

  留保：公開2026-09-15版の文言で、独立した学習停止保証・全AIのzero retention・改善用途の保存期間を確定しない。FAQのLLM基盤保持とConnecteam内保持は別。対象顧客の締結版/付属契約、匿名化、具体送信項目/委託先別実装/第三者保証は未確認。 [公式資料](https://connecteam.com/ai-terms/)

- 部分確認：利用規約1.7はAI機能がopt-inまたは既定有効になり、既定有効の場合Account Ownerがユーザー設定からopt outできると記載し、AI特約も適用すると説明する。

  留保：設定名/入口/各Hub・機能への反映範囲・権限差/送信停止実測は未確認。AI特約のAgentic機能の既定有効/Administrator権限内実行と、KB個別Deactivateを同一UI/同一機能としない。顧客のOperations Expert提供権利や利用停止によるデータ削除を推測しない。 [公式資料](https://connecteam.com/terms-conditions/)

- 部分確認：公式委託先一覧はAzure OpenAIのSweden Central、生成AI用途のGoogle（米国）、AI機能用途のOpenAI（米国）に加え、AI Agent用途のAnthropic（米国）を載せる。

  留保：KB FAQのAzure OpenAI/Gemini/OpenAI列挙にはAnthropicがなく、資料の対象/版/機能差は未解消。Google会社一覧を全機能のGemini実行と断定せず、顧客ごとのprovider選択/region固定/越境・データ項目/学習・保持条件や第三者保証は未確認。一覧だけで全AI経路/契約を確定しない。 [公式資料](https://connecteam.com/subprocessors/)

- 部分確認：Privacy Noticeは顧客のUser Content等をprocessor/DPAの範囲に分け、processorデータは顧客指示の期間保持すると説明する。サポート等の通信記録による自社AI代表の改善は別のcontroller用途として記載する。

  留保：2026-09-15公開版。自社問い合わせAIの改善用途を顧客KB学習と同一視しない。顧客指示保持はLLM基盤zero retentionとは異なる。KB会話/ログ/埋込/バックアップ等の具体期間・AI送信項目/匿名化、契約版/削除検証/第三者保証は未確認でN05完了にしない。 [公式資料](https://connecteam.com/privacy/)

公開2026-09-15のAI特約・利用規約・Privacyと相対更新のKBヘルプ/日付未表示の委託先一覧を分ける。KB FAQの送信先とAnthropicを含む一覧の対象差は未解消。LLM処理後保持とConnecteam内の顧客データ/サポートAI用途は別。具体送信項目・匿名化・会話ログ等の期間・全機能停止/権限・締結契約/保証は未確認で完了にしない。Hub/版/顧客のOperations Expert提供権を推測しない。全文/本文hash/原本画像未保存、製品/API/設定/外部連絡なし。

72回帰・型58診断0・staging/production両ビルド・B37/B33既存39表保持・非null ingest36件・全118料金保持/50料金投影不変・SQL往復が合格。新Connecteam118,681バイト行は6文（最大50,176）へ分割し途中3文から再開/同JSON bytes・再適用50/仮行0、旧公開行を保持。SQL全体最大86,116/100,000。保存B37→B38は174文、B18→B38は1250文。本番の最新export差分ではなく保存基点のローカル比較。

空の隔離LOCAL D1へ投入し39表一致。実local API50料金/50詳細・版/hash合格、38ブラウザ（retry/skip/flaky0）、62SEO内容問題0/local dev noindex62期待値、PC1440/390でbuilt/staticの6記録/5URL/留保・履歴・価格・幅超過0/console0を確認。ブラウザ後もD1/API再照合。既存依存コピー・インストール/デプロイなし。型初回sandbox socket拒否は許可済みloopbackで再試行。新タブ初期幅/ID完全一致probeはDOMで確認して修正し、入力/実装を変更しない。

親の容量不足による同担当再試行時、正本B37/active T05/HEAD/888対象hashと作業B38 ingest hash・既存処理/ログを照合し競合0。保存済み調査/回帰/型/ビルド/隔離D1を再利用し、実行済み38ブラウザ/62SEOを回収。重複ingest/調査取得/モデル変更/追加課金/利用枠操作なし。resume-reviewを保存。

累積50提供単位・2,163記録・360調査文書・118料金・39表/12view・制度17・独立試験0。未着手639/確認中261/停止78/完了2、未完978・優先度1未完29。部分資料採用622/2,000は完了や品質点数ではない。

C05全5ターンは28記録（部分23・未知5）、機能出典取得19、新規調査文書18、9課題開始・完了0。開始/反映前backup、並行45/README保留/過去成果保持、39表のC05全履歴を照合。C05引き継ぎに合計/変更/未知/backup/最新本番exportからの差分再構築条件を保存し5/5で停止。次サイクル開始なし。本番B18本人報告だけを把握し以後公開版推測/再監査なし。Git/CI/remote DB/公開/課金/認証設定/外部連絡なし。
