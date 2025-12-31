#!/bin/bash
echo "======================================================"
echo "   MicroAccount - Starting System (Linux/Ubuntu)..."
echo "======================================================"

# Check for Docker
if ! [ -x "$(command -v docker)" ]; then
  echo 'Error: docker is not installed. Please install docker first.' >&2
  exit 1
fi

# Detect if we are in a unified directory structure
if [ -f "../docker-compose.yml" ]; then
  echo "[1/2] Starting Unified System (App + DB)..."
  docker compose -f ../docker-compose.yml up -d
  echo "Open browser at http://localhost:3000"
  if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
  fi
else
  echo "[1/3] Starting Local Database..."
  docker compose up -d
  
  echo "[2/3] Installing Dependencies..."
  npm install
  
  echo "[3/3] Launching App in Dev Mode..."
  npm run dev
fi

