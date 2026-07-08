#!/usr/bin/env bash
# Field Sync Notebook — start both services (Linux / macOS)
# Run this from the repo root.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting backend on :8030..."
cd "$REPO/backend"
python3 -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q -r requirements.txt
uvicorn app.main:app --reload --port 8030 &
BACKEND_PID=$!

echo "Starting frontend on :5173..."
cd "$REPO/frontend"
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend:  http://127.0.0.1:8030"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
