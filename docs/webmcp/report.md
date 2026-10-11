# Web MCP実装・検証記録

2026年10月11日。ブラウザネイティブの公開読み取り5ツールを実装した。Chrome 155.0.8059.39のWebMCPTesting実験機能を有効にし、Cloudflare検証環境で登録・実行・画面表示・キャンセル・登録解除を検証した。独立したAIが自然言語からツールを選ぶE2Eは未実施であり、登録確認から成功を推定しない。

## 現行仕様の採用

[2026年10月9日ドラフト](https://webmachinelearning.github.io/webmcp/)と[Chromeの命令的API説明](https://developer.chrome.com/docs/ai/webmcp/imperative-api)を確認した。旧スキルのprovideContext・navigator.modelContextTestingを使わず、document.modelContext.registerTool、登録時AbortSignal、実行時signal、getTools・executeToolの現行APIを採用した。Chrome155での検証ではgetToolsが返したRegisteredToolをexecuteToolへ渡す。入力はJSONへ変換可能なオブジェクトで渡す。実行結果はブラウザからJSON文字列として返された。

Web MCPはW3C標準の完成版ではなく、対応状況は変わる。Origin Trial用トークンは発行していない。フラグを有効にした実験環境での確認であり、未対応ブラウザには通常の検索・比較・詳細を提供する。[公式実装状況](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md)

## 契約と境界

- [ツール契約](tool-contract.json)：検索最大20件、詳細1提供単位、比較2〜4件、根拠10記録、調査範囲。
- closed JSON Schemaを登録し、同じ固定ID・enum・最大長・件数の検証をサーバーでも行う。
- 公開情報のみ、同一オリジンGET、SQLはバインド。任意URL取得やSQL実行、外部へのメッセージ送信、データ更新は提供しない。
- readOnlyHintとuntrustedContentHintを付与。外部本文はテキストDOMへ挿入し、ツールの説明へ連結しない。Permissions Policyはtools=(self)。exposedToの外部公開は行わない。
- 15秒の処理期限、実行キャンセル、pagehideで登録解除、bfcache復帰時に再登録。比較選択はブラウザのsessionStorageへ保存し、解除可能。
- APIは120回/分、IP由来の不可逆キーを一時的に使う。Cloudflare内の配信拠点ごとの制限であり、全世界合算の厳密な制限ではない。独自の生IP・検索履歴・問い合わせログは設けない。

## 実行した確認

| 検証 | 結果 | 証拠 |
|---|---|---|
| スキーマ・入力境界・独自ドメイン入口 | 7テスト合格 | apps/web/tests/*.test.mjs |
| 入力評価ケース | 150ケースを保存、うち100引数ケースの受理・拒否を検証 | eval-cases.json、eval.test.mjs |
| 登録5件・annotations | 合格 | tests/browser/webmcp.spec.mjs |
| 検索・詳細・比較・根拠・調査範囲のネイティブ実行 | 合格、出典と条件付きJSONを返し画面へ反映 | 同上 |
| キャンセル時の遅延表示防止、ページを離れた際の解除 | 合格 | 同上 |
| API不存在・不正ID・重複比較・過大入力・SQL文字列・POST拒否 | 合格 | tests/browser/catalog.spec.mjs |
| Web MCP未対応・JavaScript無効時の通常UI | 合格 | browser tests |
| スマートフォン横はみ出し、検索、比較、50詳細SSR | 合格 | browser tests |
| 静的セキュリティ検査 | 検出0 | ../webmcp-source-audit-20261011.json |
| 独立した対象AIの自然言語ツール選択 | 未実施 | eval-cases.jsonに呼ぶ・呼ばない・曖昧ケースを保存 |
| Safari・Firefox・実機端末 | 未実施 | Chromeによる代替確認のみ |

実行検証で見つかった調査範囲の表示処理（productsが件数であるデータを配列として扱う問題）は修正し、再確認した。部分応答を完全な根拠と誤認しないよう、APIにfindings_total・findings_truncated・summary_truncated・sources_totalを付け、全履歴APIへの導線を渡す。

## 再現と復旧

```sh
cd apps/web
npm test
TEST_BASE_URL=https://aqsh-shift-research-staging.aqsh-reprom.workers.dev npm run test:browser
```

このブラウザテストは実験機能を有効にしたChromeを起動する。独立AIの選択試験を実施したことにはならない。高リスク操作の権限・確認フローは不要な範囲に限定した。

Web MCPのみ止める場合はclient.mjs内のregisterTools呼び出しを停止してビルド・再配信する。通常UI/APIは継続する。全体は前のWorkerデプロイとD1の保持済みweb_live公開版へ戻し、検索・比較・APIとnoindexの状態を再確認する。Cloudflareの集計メトリクスでエラーと利用量を確認し、ブラウザ仕様が変わったときはネイティブ実行テストを再実施する。定期自動監視は作成していない。
