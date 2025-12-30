#!/bin/bash
echo "======================================================"
echo "   MicroAccount - Starting System (Linux/Ubuntu)..."
echo "======================================================"

# Check for Docker
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed. Please install docker first.' >&2
  exit 1
fi

echo "[1/3] Starting Database..."
docker compose up -d

echo "[2/3] Installing Dependencies..."
npm install --production

echo "[3/3] Launching App..."
echo "Opening browser at http://localhost:3000"
if command -v xdg-open > /dev/null; then
  xdg-open http://localhost:3000
fi

npm run dev
