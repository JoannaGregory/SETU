@echo off
title SETU - Education Enablement Platform
echo =========================================================
echo   Starting SETU Platform
echo =========================================================
echo.

cd /d "%~dp0"

:: If frontend/dist is missing and npm is available, build frontend automatically
if not exist "frontend\dist\index.html" (
    echo Building frontend distribution bundle...
    cd frontend
    call npm.cmd install
    call npm.cmd run build
    cd ..
)

cd /d "%~dp0backend"

:: Check if virtual environment exists; if not, create and install
if not exist ".venv\Scripts\activate.bat" (
    echo [1/3] Python virtual environment not found. Setting it up now...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    echo Installing required backend packages...
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate.bat
)

echo [2/3] Starting SETU Backend and Web Server on port 8000...
start "SETU Server" .venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

echo [3/3] Opening browser at http://127.0.0.1:8000 ...
timeout /t 3 /nobreak >nul
start http://127.0.0.1:8000

echo.
echo =========================================================
echo   SETU is live at http://127.0.0.1:8000
echo   API Docs at     http://127.0.0.1:8000/docs
echo =========================================================
echo   Press any key to close this launcher (server stays running).
pause >nul
