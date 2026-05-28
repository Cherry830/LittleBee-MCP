#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PID_DIR="$ROOT/.run"
mkdir -p "$PID_DIR"

stop_one() {
  local name="$1"
  local pidfile="$PID_DIR/$name.pid"
  if [[ -f "$pidfile" ]]; then
    kill "$(cat "$pidfile")" 2>/dev/null || true
    rm -f "$pidfile"
  fi
}

echo "==> Building local-rest-api"
(cd "$ROOT/local-rest-api" && npm ci && npm run build)

echo "==> Building internal-api-mcp-server"
(cd "$ROOT/internal-api-mcp-server" && npm ci && npm run build)

stop_one rest-api
stop_one mcp-server

echo "==> Starting local-rest-api :3200"
(
  cd "$ROOT/local-rest-api"
  set -a && source .env 2>/dev/null || true && set +a
  export PORT="${PORT:-3200}"
  nohup node dist/server.js >>"$PID_DIR/rest-api.log" 2>&1 &
  echo $! >"$PID_DIR/rest-api.pid"
)

echo "==> Starting internal-api-mcp-server :3100"
(
  cd "$ROOT/internal-api-mcp-server"
  set -a && source .env && set +a
  nohup node dist/index.js >>"$PID_DIR/mcp-server.log" 2>&1 &
  echo $! >"$PID_DIR/mcp-server.pid"
)

sleep 2
curl -sf "http://127.0.0.1:3200/health" >/dev/null && echo "REST API OK"
curl -sf "http://127.0.0.1:3100/health" >/dev/null && echo "MCP OK"
echo "Done. Logs: $PID_DIR/*.log"
