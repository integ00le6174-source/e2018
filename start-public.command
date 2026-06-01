#!/bin/zsh
set -e

cd "$(dirname "$0")"

CLOUDFLARED="/private/tmp/cloudflared-bin/cloudflared"
LOG_DIR="./run-logs"
NODE_BIN=""

mkdir -p "$LOG_DIR"

for candidate in \
  "/Applications/Codex.app/Contents/Resources/node" \
  "/opt/homebrew/bin/node" \
  "/usr/local/bin/node" \
  "$(command -v node 2>/dev/null)"
do
  if [ -n "$candidate" ] && [ -x "$candidate" ]; then
    NODE_BIN="$candidate"
    break
  fi
done

if [ -z "$NODE_BIN" ]; then
  echo "Node.js が見つかりません。"
  echo "Codexアプリ、またはNode.jsをインストールしてから再実行してください。"
  read "?Enterキーで閉じます。"
  exit 1
fi

if [ ! -x "$CLOUDFLARED" ]; then
  echo "cloudflared が見つかりません: $CLOUDFLARED"
  echo "Codexに cloudflared の再セットアップを依頼してください。"
  read "?Enterキーで閉じます。"
  exit 1
fi

echo "公開サイトを起動します。"
echo ""
read -s "?ログイン用パスワードを入力: " REPORT_PASSWORD_VALUE
echo ""
read -s "?削除専用パスワードを入力: " DELETE_PASSWORD_VALUE
echo ""

if [ -z "$REPORT_PASSWORD_VALUE" ] || [ -z "$DELETE_PASSWORD_VALUE" ]; then
  echo "パスワードが空です。起動を中止します。"
  read "?Enterキーで閉じます。"
  exit 1
fi

SESSION_SECRET_VALUE=$("$NODE_BIN" -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")

if [ -f "$LOG_DIR/server.pid" ] && kill -0 "$(cat "$LOG_DIR/server.pid")" 2>/dev/null; then
  echo "ローカルサーバーはすでに起動しています。"
else
  REPORT_PASSWORD="$REPORT_PASSWORD_VALUE" \
  DELETE_PASSWORD="$DELETE_PASSWORD_VALUE" \
  SESSION_SECRET="$SESSION_SECRET_VALUE" \
  "$NODE_BIN" server.js > "$LOG_DIR/server.log" 2>&1 &
  echo $! > "$LOG_DIR/server.pid"
  echo "ローカルサーバーを起動しました。"
fi

sleep 1

if ! curl -fsS http://127.0.0.1:3000/login.html >/dev/null; then
  echo "ローカルサーバーに接続できませんでした。"
  echo "$LOG_DIR/server.log を確認してください。"
  read "?Enterキーで閉じます。"
  exit 1
fi

if [ -f "$LOG_DIR/tunnel.pid" ] && kill -0 "$(cat "$LOG_DIR/tunnel.pid")" 2>/dev/null; then
  echo "公開トンネルはすでに起動しています。"
else
  "$CLOUDFLARED" tunnel --url http://127.0.0.1:3000 --no-autoupdate > "$LOG_DIR/tunnel.log" 2>&1 &
  echo $! > "$LOG_DIR/tunnel.pid"
  echo "公開トンネルを起動しました。URLを取得しています..."
fi

PUBLIC_URL=""
for _ in {1..25}; do
  PUBLIC_URL=$(grep -Eo "https://[-a-z0-9]+\\.trycloudflare\\.com" "$LOG_DIR/tunnel.log" | tail -n 1 || true)
  if [ -n "$PUBLIC_URL" ]; then
    break
  fi
  sleep 1
done

echo ""
echo "ローカルURL:"
echo "http://127.0.0.1:3000"
echo ""
if [ -n "$PUBLIC_URL" ]; then
  echo "公開URL:"
  echo "$PUBLIC_URL"
else
  echo "公開URLをまだ取得できません。少し待ってから $LOG_DIR/tunnel.log を確認してください。"
fi
echo ""
echo "このウィンドウを閉じても起動は続きます。停止するには stop-public.command をダブルクリックしてください。"
read "?Enterキーで閉じます。"
