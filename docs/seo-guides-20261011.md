# 用途別の選び方・公式紹介リンク・登録状況の確認

2026年10月11日。公開サイト https://shift.aqsh.co.jp/ の4用途ページを拡充し、Aqsh公式サイトの関連ページから紹介リンクを追加しました。製品データはB07-20261011-pub2（50提供単位・1,664調査記録・188公開文書）のままです。新たな製品実動作検証や制度適合認定は行っていません。

## 公開した解説

| 用途 | 主な確認点 | URL |
| --- | --- | --- |
| 医療・看護 | 夜勤・資格別配置、実績と様式9の算式、管理者MFA、解約時出力 | https://shift.aqsh.co.jp/categories/medical/ |
| 介護・福祉 | サービス種別・兼務、常勤換算、勤務形態一覧表、提供予定との区別 | https://shift.aqsh.co.jp/categories/care/ |
| 店舗・幅広い業種 | 希望回収・勤務表作成・業務割当の違い、多拠点、勤怠連携、総額 | https://shift.aqsh.co.jp/categories/general/ |
| API・開発者向け | 入力制約・返却状態、独立検証、再試行・保管、商用再提供・β条件 | https://shift.aqsh.co.jp/categories/api/ |

各ページに、選定の4工程、比較表、公開資料の確認例2件、販売元への質問4件、FAQ2件、関連する機能検索を追加しました。確認例は順位や推奨の認定ではありません。すべての本文をサーバーで描画し、JavaScriptなしでも目次・FAQ・製品リンクを利用できます。長い解説を経由せず製品一覧へ進むリンクも設けました。

既存URLと検索対象の62URLを維持し、タイトル・説明・CollectionPage・パンくずを更新しました。実際に拡充した4用途だけに2026-10-11のlastmodと編集者・更新日を設定しました。ページごとのCSSを追加し、解説によるJavaScriptやD1の追加問い合わせはありません。用途ページのD1往復は1回です。

## 公式サイトの紹介リンク

対象は https://aqsh.co.jp/workforce-design/ 固定ページID1203225です。「時間不足」「配置不足」を含む8分類の表の直後に、比較サイトの範囲、調査時点、無料・会員登録不要を説明する紹介欄を追加しました。リンクは通常のa要素で、nofollowは付けていません。

最新本番本文と原本を照合し、私有バックアップ、競合検査、dry-run、WordPressの保存API、対象URLだけのキャッシュ削除を実施しました。保存本文は計画のSHA-256と一致しています。主要投稿フィールドと全postmetaを保持し、AIOSEOの差分は自動更新されたimage_scan_date・updatedのみです。SEOタイトル・説明・canonicalなどの設定は保持しています。

公開ページでHTTP200、H1・canonical・タイトル、既存の30万円の料金、紹介リンク1件と正しいhrefを確認しました。1280pxと390pxで横はみ出しはありません。公式サイトの原本 `wordpress-source/workforce-design.blocks.html`、対象マニフェスト、`wordpress-source/shift-intro-20261011/PUBLICATION-2026-10-11.md` も同期しました。このリポジトリには、公開可能な追加HTMLと差分だけを `official-link-20261011/` に保存しています。私有バックアップ・更新スクリプトはGit対象外です。

## Googleタグの案内メールについて

メールのG-E205Y93JB7は既存GA4と同じ測定IDです。当サイトは基本の同意モードを採用し、同意するまでGoogleタグを読み込みません。メール送信システムが何を判定したかは確認できませんが、同意操作をしない自動検出や通知の時間差で未設置と判断された可能性があります。Googleの基本同意モードは同意までタグを遮断する方式です：[Google公式説明](https://developers.google.com/tag-platform/security/concepts/consent-mode)。

実サイトを新しい匿名ブラウザで検査し、同意前・拒否後のGoogle通信0件、同意後のgtag.js読み込み1回、測定ID一致、page_viewへのHTTP204応答を確認しました。通常のブラウザでもタグURLを確認し、GA4リアルタイム画面に新しい医療向け解説のタイトルとpage_viewの実受信を確認しました。数字は検証の閲覧を含み、一般利用者の流入成果とは扱いません。メールのコードを重ねて追加せず、同意方式を維持しています。

## 検証と公開環境

- Astro検査：0 errors・0 warnings。Nodeテスト14件成功。
- 公開ブラウザ検証：12件成功。解説の目次、FAQ、リンク、JavaScript無効、幅320／390／768／1440、WCAG AA自動検査、D1回数、既存製品の検索・比較・SEOを確認しました。
- 全62URLの匿名HTML検査：問題0件。タイトル・説明の重複、canonical、robots、構造化データを確認しました。
- 最終の表記調整・サイトマップ整理後にも、用途別の本番検証を実施しています。
- モバイルLighthouse：性能97・アクセシビリティ100・ベストプラクティス100・SEO100。LCP 1.85秒、CLS 0、TBT 0ms。実通信の数値も対応する検証JSONに保存しています。Lighthouseはシミュレーションで、実利用者のCore Web Vitalsや順位の保証ではありません。
- 本番Worker：aqsh-shift-research、バージョン861a2a11-fc03-43d1-8989-9071830059bd。検証環境バージョン052b8e52-0926-4658-b563-056b194ffab0。

詳細：`seo-guides-verification-20261011.json`、`seo-guides-pages-verification-20261011.json`、`seo-guides-browser-verification-20261011.json`、`seo-guides-live-qa-20261011.json`、`seo-guides-lighthouse-verification-20261011.json`。

## Googleの登録状況

サイトマップは成功・62URL検出です。URL検査ではトップ、製品一覧、Nafty製品詳細、4用途すべてのページを登録済みと確認しました。全体集計はまだ処理中のため、62URLすべての登録完了とは判断できません。今回確認した7URLは登録済みです。医療・介護・APIは登録依頼の受理も確認しました。店舗は依頼中に確認タブが閉じたため受理ダイアログは未確認ですが、その後のURL検査で登録済みを確認しています。用途ページの最新の状態・登録依頼結果は検証JSONに個別記録しています。登録依頼の受理とインデックス登録は区別します。

今後は集計が利用可能になった時点の登録数・除外理由、検索クエリと掲載ページ、実利用者の表示速度を確認します。既に依頼したURLへ同じ依頼を繰り返す必要はありません。掲載・順位は保証されず、Google公式説明ではクロールに数日〜数週間かかる場合があります：[Googleの再クロール案内](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)。
