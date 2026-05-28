#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PID_DIR="$ROOT/.run"
for name in rest-api mcp-server; do
  pidfile="$PID_DIR/$name.pid"
  if [[ -f "$pidfile" ]]; then
    kill "$(cat "$pidfile")" 2>/dev/null || true
    rm -f "$pidfile"
    echo "Stopped $name"
  fi
done
