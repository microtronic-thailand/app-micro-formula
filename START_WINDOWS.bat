@echo off
echo ======================================================
echo    MicroFormula - Starting System...
echo ======================================================

:: Check for Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker not found! Please install Docker Desktop first.
    echo Opening download page...
    start https://www.docker.com/products/docker-desktop
    pause
    exit
)

:: Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Please install Node.js.
    start https://nodejs.org/
    pause
    exit
)

echo [1/3] Starting Database...
docker-compose up -d

echo [2/3] Installing Dependencies (if needed)...
npm install --production

echo [3/3] Launching App...
echo Browser will open at http://localhost:3000
start http://localhost:3000
npm run dev

pause
