#!/bin/bash
echo "========================================================="
echo "  Starting SETU Platform"
echo "========================================================="

cd "$(dirname "$0")/backend"

if [ ! -d ".venv" ]; then
    echo "[1/3] Setting up Python virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

echo "[2/3] Starting SETU on port 8000..."
python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &

sleep 2
echo "[3/3] Opening browser..."
if which xdg-open > /dev/null; then
    xdg-open http://127.0.0.1:8000
elif which open > /dev/null; then
    open http://127.0.0.1:8000
fi

echo "SETU is running at http://127.0.0.1:8000"
