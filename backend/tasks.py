from backend.celery_app import celery_app
from backend.vector_db import search_similar_claim, save_verified_claim
from backend.graph_db import save_claim_to_graph
from backend.ner_service import extract_entities
from backend.credibility_engine import analyze_claim_credibility

@celery_app.task(bind=True)
def run_claim_analysis_task(self, claim: str):
    """Background task with semantic cache, advanced NER, and LLM credibility scoring."""
    try:
        # 1. Check Qdrant vector cache first
        cache_check = search_similar_claim(claim)
        if cache_check["is_cached"]:
            return {
                "task_id": self.request.id,
                "status": "SUCCESS (CACHED)",
                "claim": claim,
                "similarity_score": cache_check["score"],
                "verdict": cache_check["payload"]["verdict"],
                "credibility_score": cache_check["payload"].get("credibility_score", 50.0),
                "evidence": cache_check["payload"]["evidence"]
            }

        # 2. Extract advanced entities using spaCy NER
        extracted_entities = extract_entities(claim)

        # 3. Run Credibility & Evidence Analysis Engine
        analysis_result = analyze_claim_credibility(claim)
        verdict = analysis_result["verdict"]
        score = analysis_result["credibility_score"]
        evidence = [analysis_result["explanation"]] + analysis_result["evidence_sources"]

        # 4. Save to Qdrant vector database for semantic caching
        save_verified_claim(claim, verdict, evidence)
        
        # 5. Save relationship mapping to Neo4j graph database with real NER entities
        save_claim_to_graph(claim, verdict, extracted_entities)

        return {
            "task_id": self.request.id,
            "status": "SUCCESS (FRESH)",
            "claim": claim,
            "verdict": verdict,
            "credibility_score": score,
            "evidence": evidence,
            "entities_mapped": extracted_entities
        }
    except Exception as exc:
        raise self.retry(exc=exc, countdown=5, max_retries=3)