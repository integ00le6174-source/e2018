#!/bin/zsh
set -e

cd "$(dirname "$0")"

LOG_DIR="./run-logs"

stop_process() {
  local name="$1"
  local pid_file="$2"

  if [ -f "$pid_file" ]; then
    local pid
    pid=$(cat "$pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid"
      echo "$name を停止しました。"
    else
      echo "$name はすでに停止しています。"
    fi
    rm -f "$pid_file"
  else
    echo "$name の起動記録がありません。"
  fi
}

stop_process "公開トンネル" "$LOG_DIR/tunnel.pid"
stop_process "ローカルサーバー" "$LOG_DIR/server.pid"

echo ""
echo "停止処理が完了しました。"
read "?Enterキーで閉じます。"
