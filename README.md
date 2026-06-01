# My Report Archive

PDF形式のレポートを整理・閲覧するための、パスワード付き個人アーカイブです。

## できること

- ログイン後だけPDF一覧とPDFビューアーを表示
- タイトル、分野、要旨、キーワードで検索
- PDFの追加と一覧データの保存
- 削除用パスワードを設定した場合のみPDF削除
- ローカル起動、または一時公開用の Cloudflare Tunnel 起動

## 必要なもの

- Node.js 18 以上

追加ライブラリは使っていません。

## ローカルで起動する

```bash
REPORT_PASSWORD="好きなログイン用パスワード" \
DELETE_PASSWORD="好きな削除用パスワード" \
SESSION_SECRET="長いランダム文字列" \
npm start
```

ブラウザで http://127.0.0.1:3000 を開きます。

削除機能を使わない場合、`DELETE_PASSWORD` は省略できます。

## 環境変数

| 名前 | 内容 |
| --- | --- |
| `REPORT_PASSWORD` | ログイン用パスワード。公開時は必ず変更してください。 |
| `DELETE_PASSWORD` | PDF削除用パスワード。未設定の場合、削除機能は無効です。 |
| `SESSION_SECRET` | Cookie署名用の長いランダム文字列。 |
| `HOST` | 待ち受けホスト。ローカルでは `127.0.0.1`、公開サービスでは `0.0.0.0`。 |
| `PORT` | 待ち受けポート。未設定時は `3000`。 |

設定例は `.env.example` にあります。

## フォルダ構成

```text
.
├── assets/              # 画像などの静的ファイル
├── data/papers.json     # レポート一覧データ
├── pdfs/                # 最初から置くPDF
├── uploads/             # 画面から追加されたPDF
├── index.html           # アーカイブ画面
├── login.html           # ログイン画面
├── server.js            # Node.jsサーバー
└── styles.css           # 画面デザイン
```

## GitHub に載せるときの注意

- `.env` や実行ログは `.gitignore` で除外しています。
- `uploads/` は個人データが増えやすいため、基本的に除外しています。
- 現在の一覧で使っている2つの追加PDFだけは例外として含める設定にしています。
- PDFを新しくGitHubにも載せたい場合は、`.gitignore` の `uploads/` 設定を調整してください。

## 一時公開URLを作る

macOS では `start-public.command` をダブルクリックすると、ローカルサーバーと Cloudflare Tunnel を起動します。
停止するときは `stop-public.command` を使います。

この方法は一時共有用です。常設公開する場合は、Render、Railway、Fly.io などのNode.js対応サービスで環境変数を設定して起動してください。
