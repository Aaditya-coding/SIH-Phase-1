from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from celery.result import AsyncResult
from backend.celery_app import celery_app, is_celery_available
from backend.tasks import run_claim_analysis_task, execute_claim_analysis
import sys
import os
import io
import uuid
import threading
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

# In-memory task registry for resilient deployment when Celery/Redis is not running
in_memory_tasks: dict = {}

# Enable CORS for frontend connectivity (supports Vercel, localhost, and custom domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClaimRequest(BaseModel):
    claim: str

@app.get("/")
def root():
    """Root health endpoint for Render deployment monitoring."""
    return {
        "status": "online",
        "service": "Truth Intelligence Forensic Engine",
        "version": "1.0",
        "endpoints": ["/health", "/analyze", "/task/{task_id}", "/ocr", "/api/generate-pdf"]
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

class AnalyzeRequest(BaseModel):
    input_type: str = "text"
    content: str

def _run_in_memory_pipeline(task_id: str, content: str):
    """Executes the analysis in a background thread when Celery is not configured."""
    def on_progress(step: str, progress: int):
        if task_id in in_memory_tasks:
            in_memory_tasks[task_id]["status"] = "PROGRESS"
            in_memory_tasks[task_id]["step"] = step
            in_memory_tasks[task_id]["progress"] = progress

    try:
        result = execute_claim_analysis(content, task_id=task_id, progress_callback=on_progress)
        in_memory_tasks[task_id] = {
            "task_id": task_id,
            "status": "SUCCESS",
            "progress": 100,
            "result": result,
            **result
        }
    except Exception as exc:
        in_memory_tasks[task_id] = {
            "task_id": task_id,
            "status": "FAILURE",
            "error": str(exc),
            "result": None
        }

@app.post("/analyze")
def submit_claim_analysis(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Submits claim for analysis.
    If Celery/Redis is available, offloads to Celery.
    If Redis/Celery is unavailable (e.g., Render Free tier), runs seamlessly via background thread.
    """
    # 1. Try Celery if Redis broker is reachable
    if is_celery_available():
        try:
            task = run_claim_analysis_task.delay(request.content)
            return {
                "task_id": task.id,
                "status": "QUEUED",
                "message": "Claim analysis successfully enqueued for processing via Celery."
            }
        except Exception as e:
            print(f"Celery dispatch failed ({e}), falling back to background thread.")

    # 2. Resilient In-Memory Fallback
    task_id = f"task_{uuid.uuid4().hex[:12]}"
    in_memory_tasks[task_id] = {
        "task_id": task_id,
        "status": "PENDING",
        "step": "Initializing forensic pipeline...",
        "progress": 5,
        "result": None
    }
    background_tasks.add_task(_run_in_memory_pipeline, task_id, request.content)
    return {
        "task_id": task_id,
        "status": "QUEUED",
        "message": "Claim analysis enqueued via background execution worker."
    }

@app.post("/ocr")
async def extract_text_from_image(file: UploadFile = File(...)):
    """Extracts text strings from uploaded screenshots or images via Tesseract OCR with graceful fallback."""
    try:
        import pytesseract
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        extracted_text = pytesseract.image_to_string(image).strip()
        return {
            "extracted_text": extracted_text if extracted_text else "No readable text detected in image."
        }
    except Exception as e:
        err_str = str(e)
        if "tesseract is not installed" in err_str.lower() or "not in your path" in err_str.lower():
            return {
                "extracted_text": "Tesseract OCR engine is not installed on this cloud environment. Please paste the claim text directly into the analysis terminal."
            }
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {err_str}")


def create_pdf(report_data):
    from fpdf import FPDF
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import tempfile
    import os
    
    class ResearchPaperPDF(FPDF):
        def header(self):
            self.set_font("Times", "B", 10)
            self.cell(0, 5, txt="Journal of Truth Verification & Intelligence", ln=True, align="L")
            self.set_font("Times", "", 9)
            date_str = str(report_data.get("timestamp", ""))[:4] 
            self.cell(0, 5, txt=f"ISSN: 2026-XXXX | Volume 1 Issue 1 Year {date_str}", ln=True, align="L")
            self.set_line_width(0.3)
            self.line(15, 22, 195, 22)
            self.ln(10)

        def footer(self):
            self.set_y(-15)
            self.set_font("Times", "I", 8)
            self.cell(0, 10, f"Page {self.page_no()}", 0, 0, 'C')

    pdf = ResearchPaperPDF(format="A4")
    pdf.add_page()
    pdf.set_margins(15, 25, 15)
    pdf.set_auto_page_break(auto=True, margin=20)
    
    def sanitize(text):
        if not text: return ""
        clean_text = str(text).encode('latin-1', 'replace').decode('latin-1')
        words = clean_text.split()
        safe_words = [w if len(w) <= 65 else w[:62] + "..." for w in words]
        return " ".join(safe_words)
    
    pdf.set_font("Times", "B", 16)
    pdf.multi_cell(0, 8, txt="Research Report on Artificial Intelligence Automated Verification", align="C")
    pdf.ln(3)
    
    pdf.set_font("Times", "", 11)
    pdf.cell(0, 6, txt="Generated by: Truth Intelligence System", ln=True, align="C")
    pdf.ln(8)
    
    pdf.set_font("Times", "B", 12)
    pdf.cell(0, 6, txt="Abstract", ln=True, align="C")
    pdf.set_font("Times", "", 11)
    
    claim = sanitize(report_data.get("claim", ""))
    verdict = str(report_data.get("verdict", "UNKNOWN"))
    conf_str = str(report_data.get("confidence_score", "0%"))
    conf_val = float(conf_str.replace('%', '')) if '%' in conf_str else 0.0
    
    abstract_text = (
        f"This report investigates the following submitted claim: '{claim}'. "
        f"Utilizing advanced artificial intelligence and automated web scraping algorithms, "
        f"the system evaluated the veracity of the statement against retrieved digital evidence. "
        f"The verification pipeline concluded with a final verdict of {verdict}, yielding a "
        f"system confidence score of {conf_str}."
    )
    pdf.multi_cell(0, 6, txt=abstract_text, align="J")
    pdf.ln(8)
    
    fd_pie, temp_pie_name = tempfile.mkstemp(suffix=".png")
    os.close(fd_pie)
    
    fd_bar, temp_bar_name = tempfile.mkstemp(suffix=".png")
    os.close(fd_bar)
    
    try:
        plt.figure(figsize=(4, 4))
        labels = ['System Confidence', 'Uncertainty Margin']
        sizes = [conf_val, 100 - conf_val]
        colors = ['#4F81BD', '#D0CECE']
        plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
        plt.title('Algorithm Verdict Confidence')
        plt.tight_layout()
        plt.savefig(temp_pie_name, dpi=150)
        plt.close()
        
        sources = report_data.get("evidence_sources", [])
        source_names = []
        source_scores = []
        for i, s in enumerate(sources[:5]): 
            name = s.get("source", f"Source {i+1}")
            score = s.get("similarity_score", 0.5)
            score = float(score) if score is not None else 0.5
            source_names.append(name[:15] + "..." if len(name) > 15 else name)
            source_scores.append(score)
            
        if not source_names:
            source_names = ["No Sources"]
            source_scores = [0]
            
        plt.figure(figsize=(6, 3))
        plt.barh(source_names[::-1], source_scores[::-1], color='#4F81BD', height=0.5)
        plt.xlabel('Relevance Score (0.0 - 1.0)')
        plt.title('Distribution of Source Relevance')
        plt.tight_layout()
        plt.savefig(temp_bar_name, dpi=150)
        plt.close()

        pdf.set_font("Times", "B", 12)
        pdf.cell(0, 8, txt="1. QUANTITATIVE ANALYSIS", ln=True)
        
        y_before_charts = pdf.get_y()
        pdf.image(temp_pie_name, x=15, y=y_before_charts, w=80)
        pdf.image(temp_bar_name, x=100, y=y_before_charts + 5, w=95)
        pdf.ln(85) 

    finally:
        if os.path.exists(temp_pie_name):
            os.unlink(temp_pie_name)
        if os.path.exists(temp_bar_name):
            os.unlink(temp_bar_name)

    pdf.set_font("Times", "B", 12)
    pdf.cell(0, 8, txt="2. METHODOLOGY & VERIFICATION PIPELINE", ln=True)
    pdf.set_font("Times", "", 10)
    pdf.multi_cell(0, 5, txt="The figure below illustrates the article selection and fact-checking flow process utilized by the Truth Intelligence engine to arrive at the final verdict.")
    pdf.ln(5)
    
    flow_x = 55
    current_y = pdf.get_y()
    
    steps = [
        "1. Claim Identification & Extraction",
        "2. Semantic Web Search & Source Retrieval",
        "3. Cross-Referencing & Context Analysis",
        f"4. Final Output: {verdict}"
    ]
    
    for step in steps:
        pdf.set_fill_color(240, 240, 240)
        pdf.rect(flow_x, current_y, 100, 10, 'DF')
        pdf.set_xy(flow_x, current_y + 2)
        pdf.cell(100, 5, txt=step, align='C')
        
        if step != steps[-1]: 
            pdf.line(flow_x + 50, current_y + 10, flow_x + 50, current_y + 18)
            pdf.line(flow_x + 48, current_y + 16, flow_x + 50, current_y + 18)
            pdf.line(flow_x + 52, current_y + 16, flow_x + 50, current_y + 18)
            current_y += 18
        else:
            current_y += 15
            
    pdf.set_y(current_y + 5)

    pdf.set_font("Times", "B", 12)
    pdf.cell(0, 8, txt="3. QUALITATIVE EXPLANATION", ln=True)
    pdf.set_font("Times", "", 11)
    safe_exp = sanitize(report_data.get("explanation", ""))
    pdf.multi_cell(0, 6, txt=safe_exp, align="J")
    pdf.ln(8)
    
    pdf.set_font("Times", "B", 12)
    pdf.cell(0, 8, txt="4. REFERENCES", ln=True)
    pdf.set_font("Times", "", 10)
    
    for idx, item in enumerate(report_data.get("evidence_sources", []), start=1):
        source_name = sanitize(item.get("source", "UNKNOWN"))
        title = sanitize(item.get("title", "Link"))
        url = sanitize(item.get("url", "#"))
        citation = f"[{idx}] {source_name}. \"{title}.\" Retrieved from: {url}"
        pdf.multi_cell(0, 5, txt=citation)
        pdf.ln(3)
        
    return bytes(pdf.output())


@app.post("/api/generate-pdf")
async def generate_pdf_endpoint(report_data: dict):
    """Generates and returns an academic-style research report PDF."""
    try:
        pdf_bytes = create_pdf(report_data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=threat_intelligence_report.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/task/{task_id}")
async def get_task_status(task_id: str):
    """Consolidated endpoint that polls status, checking both in-memory registry and Celery."""
    # 1. Check in-memory task registry first
    if task_id in in_memory_tasks:
        return in_memory_tasks[task_id]

    # 2. Check Celery task result
    try:
        task_result = AsyncResult(task_id, app=celery_app)
        if task_result.state == 'PENDING':
            return {
                "task_id": task_id,
                "status": "PENDING",
                "step": "Task initializing in queue...",
                "progress": 0,
                "result": None
            }
        elif task_result.state == 'PROGRESS':
            return {
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
            if isinstance(task_result.result, dict):
                response.update(task_result.result)
            return response
        else:
            return {
                "task_id": task_id,
                "status": task_result.state,
                "error": str(task_result.info),
            }
    except Exception as exc:
        return {
            "task_id": task_id,
            "status": "FAILURE",
            "error": f"Error querying task status: {str(exc)}"
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)