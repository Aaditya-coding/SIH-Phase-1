from fastapi import FastAPI
from pydantic import BaseModel
import sys
import os

#validation safeguard
from dotenv import load_dotenv

load_dotenv()

def validate_environment():
    if not os.getenv("OPENAI_API_KEY"):
        print("WARNING: OPENAI_API_KEY is not set in environment variables.")

validate_environment()

# Ensure modules are discoverable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai.claim_extractor import extract_claims
from retrieval.search_engine import search_claim
from retrieval.rag_ranker import retrieve_evidence
from ai.verifier import verify_claim

app = FastAPI(title="Truth Intelligence API")

class AnalyzeRequest(BaseModel):
    input_type: str = "text"
    content: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/analyze")
def analyze(payload: AnalyzeRequest):
    # 1. Claim extraction
    claims = extract_claims(payload.content)
    primary_claim = claims[0]["claim_text"] if claims else payload.content
    
    # 2. Search retrieval
    raw_evidence = search_claim(primary_claim)
    
    # 3. Evidence ranking
    ranked_evidence = retrieve_evidence(primary_claim, raw_evidence)
    
    # 4. Verification engine
    verification = verify_claim(primary_claim, ranked_evidence)
    
    # 5. Return universal response
    return {
        "status": "success",
        "claims": claims,
        "verdict": verification["verdict"],
        "confidence": verification["confidence"],
        "reason": verification["reason"],
        "evidence": ranked_evidence
    }