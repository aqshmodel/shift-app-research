# B62までの本番反映（2026年10月14日）

[shift.aqsh.co.jp](https://shift.aqsh.co.jp/) と検証環境を `B62-20261013-pub2` へ更新しました。50提供単位、2,274文書記録、379調査文書、119料金明細です。調査基準日は2026年10月13日です。

反映前の本番はB41でした。今回は文書記録85件と調査文書16件を追加し、料金明細は119件を保持しました。GitHub mainはB36のままだったため、ソース保存にはB37〜B62の調査・公開資料と原本も含みます。各調査報告の「本番未反映」はその報告時点の状態です。

Nursegridの無料Appと組織契約、UKGの導入設定数と製品上限、Smartlinxの打刻許可条件、RosterElfの通常人数とFlex条件、Timefoldのsolver資源と職員課金などを区別しています。未確認、正式仕様待ち、限定公開課題の終了はそれぞれの記録を維持しました。調査結果は製品の独立試験や個別契約の保証ではありません。

## 更新と復旧

本番・検証D1の完全エクスポート、Time Travelブックマーク、稼働Worker版を更新前に保存しました。最新のB41完全エクスポートからガード付き差分を生成し、検証環境で照合してから本番へ適用しました。本番適用直前にも全43テーブルの変更がないことを確認しました。

差分は808文、最大87,926 bytes、SHA-256 `cdd50e6d480c6b51af9570d63a8953d24d9bb58b04b248052537d1f8da6416e9` です。ローカルSQL往復、変更前の値と件数、新版の未存在、全39研究表の一致、外部キー0件を確認しました。初期import.sqlは再投入していません。

旧 `web_snapshots`、`web_products`、`web_categories` は全行保持し、`web_live` を切り替えています。アプリコードと配信設定は既存版と一致しているため、Worker/Pagesの再デプロイは不要でした。

本番D1差分の実績は39,307行読取、2,486行書込、更新後29,716,480 bytesです。検証環境も同じ差分です。バックアップと認証を含む運用ログは `.release-backups/B62-20261014/` に保持し、GitHubへ含めません。

公開版だけの復旧は保持済みB41へのweb_live切替で行えます。研究表と根拠履歴も戻す必要がある場合は、保存したTime Travelブックマークと完全エクスポートを基点に整合性を確認します。

## 検証

- ローカル75テスト（研究17・Web Python36・Node22）成功。Astro 58ファイルで診断0件、ビルド成功、公開SQL/manifestの再生成はbyte単位一致。
- 本番・検証とも全39研究表が正本と一致。外部キー違反0、integrity_checkはok。旧公開履歴を保持。
- APIで全50サービスの料金概要・詳細、公開版、日付、件数、評価状態を照合して一致。
- 本番・検証それぞれ38ブラウザテスト成功。検索、比較、JavaScriptなし操作、同意、アクセシビリティ、WebMCP、320〜1440pxを確認。
- 追加記録のある20サービスを320/390/768/1440pxの80表示で確認。見出し、本文の折返し、横幅を検査。直近5サービスのPC・スマホ画面10枚を保存。
- 公開62ページのHTTP/canonical/メタ情報/構造化データを検査し問題0件。Googleの登録・順位・流入効果はこの検証の対象外。

これはChromeでの表示検証です。各サービスの実機試験、個別契約、iPhone Safariの検証とは区別します。

## 費用とGit保存

作業直前にCloudflare料金画面の従量利用コスト・予測がともにUSD 0、既存枠内であることを確認しました。既存Workers Paidの月額USD 5基本料は変わりません。今回の差分・全件照合・ブラウザ検証に保守的な利用予算を加えても含まれる枠内です。表示の集計遅延と将来のアクセス増は別に扱います。

[Workers公式料金](https://developers.cloudflare.com/workers/platform/pricing/) と [D1公式料金](https://developers.cloudflare.com/d1/platform/pricing/) を照合しました。GitHubは公開リポジトリの標準ubuntu-latestを使用し、キャッシュ約286MB、成果物保存なし。[GitHub公式料金](https://docs.github.com/en/billing/concepts/product-billing/github-actions) の無料範囲です。PagesのGit ProviderはNo、WorkerのGitビルド接続なしを確認しました。

Git保存は公開用コピーで行い、元の作業フォルダのHEADとindexを保持します。公開原本801ファイルのmanifestとGit blobのハッシュ、機密情報混入、空白を検査して保存します。GitHub mainへの反映と対象コミットのCI成功は完了記録で確認します。

詳細：[検証概要](research-b62-publication-verification-20261014.json)、[本番API](research-b62-production-api-verification-20261014.json)、[本番D1](research-b62-production-d1-verification-20261014.json)、[旧公開行保持](research-b62-production-preservation-verification-20261014.json)、[ブラウザ](research-b62-production-browser-verification-20261014.json)、[SEO](research-b62-production-seo-verification-20261014.json)、[80表示](research-b62-production-layout-verification-20261014.json)。
