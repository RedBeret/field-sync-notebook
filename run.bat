@echo off
REM Field Sync Notebook — start both services
REM Run this from the repo root. Two terminal windows will open.

echo Starting backend...
start "Field Sync — Backend" cmd /k "cd backend && python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8030"

echo Starting frontend...
start "Field Sync — Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Backend:  http://127.0.0.1:8030
echo Frontend: http://localhost:5173
echo.
echo Close the two terminal windows to stop both services.
