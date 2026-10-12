# 第22バッチ調査報告（C02T04）

2026-10-12、RosterElfの既存 `B04-20261011-TASK005` を限定調査した。8出典から9記録（部分確認6、相反1、未確認2）を追加した。課題は確認中を継続し、完了0・新規課題0・新規料金明細0。独立製品試験は未実施。

## 確認した範囲

| 項目 | 今回の追加根拠と留保 |
|---|---|
| 年契約席の計数 | 選択した契約席数が年額の基準。実有効職員数の減少だけでは購入席数が減らない。[最低方針](https://www.rosterelf.com/support/knowledge-base/billing-and-subscription/minimum-monthly-fee) |
| 閲覧会計者の例外 | My Accountant経由の1名のみ請求人数から除外。一般Admin無料席とは別。[会計者の説明](https://www.rosterelf.com/support/knowledge-base/account-setup-and-admin/assigning-accountant-bookkeeper-advisor-permission) |
| 増席・超過・減席 | 設定画面での購入は即時、有効職員の超過は5日後の精算、減席は次回請求日。離職者を先にアーカイブして入替え、同時有効数が超過しない場合は追加不要。[年席変更](https://www.rosterelf.com/support/knowledge-base/billing-and-subscription/update-annual-plan-seats) |
| 途中増員の例 | 12→14席の残期間について旧席数の未使用分控除と新席数の料金加算。差額2席の日割りで、開始終了日・丸め・税・実請求額は不足し金額計算しない。[請求例](https://www.rosterelf.com/support/knowledge-base/billing-and-subscription/understanding-your-prorated-invoice) |
| 請求税地域 | Australia設定時だけAustralian GSTを加算する製品説明。設定変更は次回請求から。各国の税義務・VAT免除や通貨を確定しない。[税地域](https://www.rosterelf.com/support/knowledge-base/billing-and-subscription/set-country-specific-tax-settings-in-rosterelf) |
| SMS表示 | 通知ヘルプに「$0.05 per SMS」、既定未選択、Email/Push無料の表示。ISO通貨・税・宛先国・文字分割・送信失敗・Flex適用を確定せず構造化価格に追加しない。[通知ヘルプ](https://www.rosterelf.com/support/knowledge-base/notifications-and-alerts/roster-notifications-for-staff) |

料金ページの既存Core月8/年6、Full Suite月10/年7、Flex10.60 AUD、GST別、月3人・年10席、一般管理者の課金、5日猶予だけの再確認は重複追加しなかった。年額の月換算と月次支払、active staffとFlexのrostered staffを分けた。UKへの誘導で地域を切り替えず、Australia (Global)の既存価格範囲を維持した。[料金ページ](https://www.rosterelf.com/pricing)

## 未解決と完了条件

Flex固有の最低人数・最低請求額は未確認。最低方針のall plansと月3 active staffの説明を、別のrostered staff方式のFlexへそのまま適用しない。SMSは表示金額の発見で前進したが、Flex専用契約の通貨・税・対象宛先・数量計数と適用が必要。両者は無料・最低なし・含むとはしない。

料金FAQのプラン変更は次周期という総括と、詳細ガイドの即時/月・年アップグレード/増席、次回/年ダウングレード/減席の区分は相反として保持した。詳細の条件付き根拠も消さず、対象契約・変更種別の照合を継続する。[料金FAQ](https://www.rosterelf.com/pricing)、[変更ガイド](https://www.rosterelf.com/support/knowledge-base/billing-and-subscription/changing-plans)

変更ガイドはWeb取得で2026-05-22、公開ブラウザの現行本文と公式記事一覧は2026-10-01を表示した。取得日を改定日に置換せず、今回のsource.updated_onは公開ブラウザ表示を用いた。価格ページの更新日は未表示のまま。全文・原本画像・本文ハッシュは保存していない。

## ローカル検証と保存範囲

DB整合性・外部キー・SQL往復、39表の既存行保持、全バッチ入力ハッシュ、回帰67件（研究14/Web Python31/Node22）が合格。全50料金表示はB21から不変で、既存RosterElf料金8件・全料金明細118件を保持。作業用静的画面を1440/390pxで確認し、追加9記録・出典・旧料金・履歴・未確認と相反・横幅収まりを確認。ブラウザのエラーログ取得は0件。一時サーバーは停止した。型検査・両ビルド・全38ケースは実装変更のない本ターンでは追加実行せずT05で実施する。

B21→B22および保存したローカルB18→B22の差分はSQL往復・旧公開行保持を検証した。本番の最新エクスポートから作ったSQLではないため、そのまま本番へ適用する前提にはしない。初回 `d1/import.sql` は空DB向け。遠隔DB・本番API・CI・デプロイ・コミット・プッシュは未実施。

累積50提供単位、2,068文書観測、297調査文書、118料金明細、39表・12ビュー、共通40項目の資料採用595/2,000。未着手674・確認中226・停止78・完了2、未完了978、優先度1未完了29。資料の部分採用と課題完了を混同しない。

開始時・反映直前のバックアップとハッシュ競合確認を行い、対象のみ正本に反映する。以前の20ファイルとルートREADME/Web READMEの保留を保持。詳細は `docs/research-turns/C02T04-local-apply.json`。本番B18・2,037記録はユーザー報告として把握するのみで、再監査しない。ローカルB19〜B22は未公開で、本番反映はユーザーが行う。

## C02T05の限定対象

ShiftWizard `B14-20261012-TASK003`（OF-US12/O04）の製品案内7〜19時CSTと1月通知の平日7〜18時CTを、窓口・対象契約・現行時間・休日例外に限って追加照合する。T05にも実質的追加調査を含めたうえで、67回帰・型検査・両ビルド・全50料金/詳細・39表・manifest・全38ブラウザケースの包括検証とC02引き継ぎを保存する。公開・本番再監査・次サイクル開始は行わない。
