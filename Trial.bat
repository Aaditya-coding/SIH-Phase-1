@echo off
echo Starting Truth Intelligence Pipeline...

:: 1. Start Redis (Tries to start existing, creates new if missing)
start "Redis Broker" powershell -NoExit -Command "docker start truth-redis 2>$null; if ($LASTEXITCODE -ne 0) { echo 'Creating new Redis container...'; docker run -d -p 6379:6379 --name truth-redis redis }"

:: 2. Start Celery Worker (Auto-activates virtual environment)
start "Celery Worker" powershell -NoExit -Command "if (Test-Path 'venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 } elseif (Test-Path '.venv\Scripts\Activate.ps1') { .\.venv\Scripts\Activate.ps1 }; python -m celery -A backend.celery_app worker --loglevel=info -P solo"

:: 3. Start FastAPI Server (Auto-activates virtual environment)
start "FastAPI Server" powershell -NoExit -Command "if (Test-Path 'venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 } elseif (Test-Path '.venv\Scripts\Activate.ps1') { .\.venv\Scripts\Activate.ps1 }; python -m uvicorn backend.main:app --reload --port 8000"

:: 4. Start Next.js Frontend
start "Next.js Frontend" powershell -NoExit -Command "cd web-frontend; npm run dev"

echo All services are spinning up!
exit