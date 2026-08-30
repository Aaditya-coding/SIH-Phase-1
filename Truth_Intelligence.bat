@echo off
title Fake News Detection App - Launcher

REM Starts the FastAPI backend in a new command window
start "Backend Server" cmd /k "py -m uvicorn backend.main:app --reload --reload-dir backend --port 8000"

REM Starts the Streamlit frontend in a new command window
start "Frontend UI" cmd /k "py -m streamlit run frontend/app.py"

echo Both backend and frontend have been launched in separate windows!
pause