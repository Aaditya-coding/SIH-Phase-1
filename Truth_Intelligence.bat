@echo off
title Truth Intelligence App - Full Stack Launcher

REM 1. Starts the Celery Background Task Worker in a new window
start "Celery Worker" cmd /k "py -m celery -A backend.celery_app.celery_app worker --loglevel=info -P solo -I backend.tasks"

REM 2. Starts the FastAPI backend server in a new window
start "Backend Server" cmd /k "py -m uvicorn backend.main:app --reload --reload-dir backend --port 8000"

REM 3. Starts the Streamlit frontend UI in a new window
start "Frontend UI" cmd /k "py -m streamlit run frontend/app.py"

echo ========================================================
echo All 3 services (Celery Worker, FastAPI, and Streamlit) 
echo have been launched in separate terminal windows!
echo ========================================================
pause