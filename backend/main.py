from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from celery.result import AsyncResult
from backend.celery_app import celery_app
from backend.tasks import run_claim_analysis_task
import sys
import os
import io
import pytesseract
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

def validate_environment():
    if not os.getenv("OPENAI_API_KEY"):
        print("WARNING: OPENAI_API_KEY is not set in environment variables.")

validate_environment()

# Ensure modules are discoverable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI(title="Truth Intelligence API", version="1.0")

# Enable CORS for frontend connectivity
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

class AnalyzeRequest(BaseModel):
    input_type: str = "text"
    content: str

@app.post("/analyze")
def submit_claim_analysis(request: AnalyzeRequest):
    """Offloads claim processing to a background Celery worker via Redis."""
    task = run_claim_analysis_task.delay(request.content)
    return {
        "task_id": task.id,
        "status": "QUEUED",
        "message": "Claim analysis successfully enqueued for processing."
    }

@app.post("/ocr")
async def extract_text_from_image(file: UploadFile = File(...)):
    """Extracts text strings from uploaded screenshots or images via Tesseract OCR."""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        extracted_text = pytesseract.image_to_string(image).strip()
        return {
            "extracted_text": extracted_text if extracted_text else "No readable text detected in image."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

@app.get("/task/{task_id}")
async def get_task_status(task_id: str):
    """Consolidated endpoint that polls the status and handles PENDING, PROGRESS, SUCCESS, and FAILURE states for the frontend UI."""
    task_result = AsyncResult(task_id, app=celery_app)
    
    if task_result.state == 'PENDING':
        response = {
            "task_id": task_id,
            "status": "PENDING",
            "step": "Task initializing in queue...",
            "progress": 0,
            "result": None
        }
    elif task_result.state == 'PROGRESS':
        # Extract the granular progress metadata injected from tasks.py
        response = {
            "task_id": task_id,
            "status": "PROGRESS",
            "step": task_result.info.get("step", "Processing..."),
            "progress": task_result.info.get("progress", 50),
            "result": None
        }
    elif task_result.state == 'SUCCESS':
        response = {
            "task_id": task_id,
            "status": task_result.state,
            "progress": 100,
            "result": task_result.result,
        }
        # Unpack the result dictionary so top-level keys like 'verdict' and 'confidence' are accessible directly
        if isinstance(task_result.result, dict):
            response.update(task_result.result)
    else:
        # Handles FAILURE and any other unexpected states
        response = {
            "task_id": task_id,
            "status": task_result.state,
            "error": str(task_result.info),
        }
        
    return response