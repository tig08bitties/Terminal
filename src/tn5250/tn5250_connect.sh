#!/usr/bin/env bash
set -euo pipefail
HOST=${1:-pub400.com}
PORT=${2:-23}

echo "[check] Testing connectivity to $HOST:$PORT ..."
if command -v nc >/dev/null 2>&1; then
  if ! nc -vz "$HOST" "$PORT" 2>/dev/null; then
    echo "[error] Cannot reach $HOST:$PORT (telnet likely blocked)." >&2
    exit 1
  fi
else
  echo "[warn] nc not found; skipping port check."
fi

echo "[info] Launching tn5250 $HOST ... (Ctrl+] then Enter to exit)"
exec tn5250 "$HOST"
