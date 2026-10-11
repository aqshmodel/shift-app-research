# 独自ドメインの公開接続記録

2026年10月11日、[Aqsh シフトづくりサービス比較](https://shift.aqsh.co.jp/)を指定ドメインで公開しました。Cloudflare Pagesの表示は「アクティブ・SSL有効」です。

## DNSとHTTPS

ムームードメインのaqsh.co.jpへ、次の1レコードを追加しました。

| 種別 | ホスト | 内容 | TTL |
|---|---|---|---|
| CNAME | shift | aqsh-shift.pages.dev | 3600秒 |

管理画面の追加前21件・追加後22件のカスタムレコードを照合し、既存21件の変更がないことを確認しました。重複したshiftレコードはありません。apexのネームサーバーはdns01.muumuu-domain.com、dns02.muumuu-domain.comのままです。

保存確認ダイアログをブラウザ操作ツールで確定できなかったため、ユーザーが確認操作を行いました。その後、両権威DNS、1.1.1.1、8.8.8.8、端末の名前解決を確認しました。証明書の検証を有効にした通常接続でHTTPS 200を確認しています。TLS 1.3、証明書の対象名はshift.aqsh.co.jp、発行者はGoogle Trust Services WE1です。

## 公開ドメインでの検証

20件のHTTP確認では、トップ・一覧・詳細・用途・Web MCP・運営情報の200応答、公開ページのindex設定とcanonical、robots Allow、62件のサイトマップ、D1の掲載版B07-20261011-pub2、静的素材の配信とキャッシュを確認しました。HTTPからHTTPSへの転送とWorkers別名からの301も確認しました。検索・任意比較はnoindex、Pages別名はnoindexとrobots Disallowです。

ブラウザ検証14項目はすべて成功しました。初回はDNS伝播中のgetaddrinfo ENOTFOUNDで4項目が失敗し、10項目が成功しました。端末の名前解決が反映した後、失敗した4項目だけを再確認し、すべて成功しています。50製品の詳細SSR、検索・比較、無JS、API境界、Web MCPの5ツール・キャンセル・非対応環境、320/390/768/1440px、WCAG AA自動チェック、数字フォント、D1呼出回数を含みます。

公開ドメインのモバイルLighthouse 13.5.0は、性能100、アクセシビリティ100、ベストプラクティス100、SEO100でした。FCP0.9秒、LCP1.1秒、TBT0ms、CLS0です。単回の模擬モバイル計測であり、実ユーザーのCore Web VitalsやGoogleのインデックスを示すものではありません。

## Google Search Console

既存のドメインプロパティsc-domain:shift.aqsh.co.jpにアクセスできることを確認しました。https://shift.aqsh.co.jp/sitemap.xmlを送信し、送信完了の表示を確認しています。Google側の初回読み込みは「取得できませんでした」で、検出ページ数は0でした。サイト側のXML・62 URL・robots・TLSは正常です。

20:10（日本時間）のGoogleライブURLテストでは「URLはGoogleに登録できます」「ページをインデックスに登録可能です」と表示されました。トップページのインデックス登録をリクエストし、「リクエスト済み・優先クロールキューに追加」の確認画面を保存しました。その後、初回取得が失敗したサイトマップを1回再送信し、送信受付を確認しました。最終確認時もサイトマップの表示は「取得できませんでした・検出0件」です。原因は未確定で、Google側の取得成功は後日の確認が必要です。Googleの実際のインデックス登録や検索順位もまだ確認できていません。

## 記録

- [DNS・TLS・HTTP・ブラウザ・Lighthouseの検証記録](custom-domain-verification-20261011.json)
- [公開画面](screenshots/custom-domain-20261011.png)
- [Googleインデックス登録リクエストの受付画面](screenshots/google-index-request-20261011.png)
- Worker版：3819b736-ea47-424e-883d-92be4a90b883
- Pages入口：https://6e301253.aqsh-shift.pages.dev/

今回の変更はDNS接続と公開確認の記録です。調査データ、Workerの実装、D1への登録内容は変更していません。未確認優先課題30件、独立製品動作試験、実機Safari・Firefox、一般のAIによる自然言語ツール選択、受賞、Googleのインデックスと順位は未確認です。
