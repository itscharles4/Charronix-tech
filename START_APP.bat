@echo off
echo ===================================================
echo   Charronix System Clean Restart ^& Diagnostic
echo ===================================================

echo [1/4] Killing zombie Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1

echo [2/4] Verifying Database Connection...
cd backend
npx prisma generate

echo [3/4] Starting Backend (Port 5000)...
start /B "" npm run dev

echo [4/4] Starting Frontend (Port 3000)...
cd ..
npm run dev
echo.
echo ===================================================
echo   Servers are starting. 
echo   Please wait 5-10 seconds, then open:
echo   http://localhost:3000
echo ===================================================


