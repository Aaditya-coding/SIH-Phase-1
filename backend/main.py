from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from celery.result import AsyncResult
from backend.celery_app import celery_app
from backend.tasks import run_claim_analysis_task
import sys
import os
from dotenv import load_dotenv

load_dotenv()

def validate_environment():
    if not os.getenv("OPENAI_API_KEY"):
        print("WARNING: OPENAI_API_KEY is not set in environment variables.")

validate_environment()

# Ensure modules are discoverable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI(title="Truth Intelligence API", version="1.0")

# Enable CORS for frontend connectivity (Pawni's UI layer)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClaimRequest(BaseModel):
    claim: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/analyze")
def submit_claim_analysis(request: ClaimRequest):
    """Offloads claim processing to a background Celery worker via Redis."""
    task = run_claim_analysis_task.delay(request.claim)
    return {
        "task_id": task.id,
        "status": "QUEUED",
        "message": "Claim analysis successfully enqueued for processing."
    }

@app.get("/task-status/{task_id}")
def get_task_status(task_id: str):
    """Polls the status and results of the asynchronous verification task for the frontend UI."""
    task_result = AsyncResult(task_id, app=celery_app)
    
    if task_result.state == 'PENDING':
        response = {"task_id": task_id, "status": "PENDING", "result": None}
    elif task_result.state != 'FAILURE':
        response = {
            "task_id": task_id,
            "status": task_result.state,
            "result": task_result.result,
        }
    else:
        response = {
            "task_id": task_id,
            "status": "FAILURE",
            "error": str(task_result.info),
        }
    return response