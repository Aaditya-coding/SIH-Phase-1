import os
from qdrant_client import QdrantClient
from qdrant_client.http import models

COLLECTION_NAME = "verified_claims"

_qdrant_client = None
_embedding_model = None

def get_embedding_model():
    """Lazy-loads SentenceTransformer so startup is instantaneous and memory is spared if not needed."""
    global _embedding_model
    if _embedding_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            print(f"Embedding model initialization notice: {e}")
            _embedding_model = False
    return _embedding_model if _embedding_model is not False else None

def get_qdrant_client():
    """Initializes Qdrant client supporting both local Docker and cloud (Qdrant Cloud URL + API Key)."""
    global _qdrant_client
    if _qdrant_client is None:
        qdrant_url = os.getenv("QDRANT_URL")
        qdrant_api_key = os.getenv("QDRANT_API_KEY")
        qdrant_host = os.getenv("QDRANT_HOST", "localhost")
        qdrant_port = int(os.getenv("QDRANT_PORT", "6333"))

        # In cloud environments without explicit QDRANT_URL, skip localhost connection
        if not qdrant_url and (os.getenv("RENDER") or os.getenv("VERCEL")):
            _qdrant_client = False
            return None

        try:
            if qdrant_url:
                client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key, timeout=2.0)
            else:
                client = QdrantClient(host=qdrant_host, port=qdrant_port, timeout=1.0)
            client.get_collections()
            _qdrant_client = client
        except Exception as e:
            _qdrant_client = False
    return _qdrant_client if _qdrant_client is not False else None

def init_vector_collection():
    """Ensures the Qdrant collection exists with the correct vector dimensions."""
    client = get_qdrant_client()
    if not client:
        return False

    try:
        collections = client.get_collections().collections
        exists = any(c.name == COLLECTION_NAME for c in collections)
        
        if not exists:
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(
                    size=384,  # dimensionality of all-MiniLM-L6-v2
                    distance=models.Distance.COSINE
                )
            )
        return True
    except Exception as e:
        return False

def search_similar_claim(claim_text: str, threshold: float = 0.92):
    """Searches Qdrant to see if a semantically identical claim was already verified."""
    try:
        client = get_qdrant_client()
        if not client:
            return {"is_cached": False}

        if not init_vector_collection():
            return {"is_cached": False}

        model = get_embedding_model()
        if not model:
            return {"is_cached": False}

        query_vector = model.encode(claim_text).tolist()
        response = client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=1
        )
        
        hits = response.points
        if hits and hits[0].score >= threshold:
            return {
                "is_cached": True,
                "score": hits[0].score,
                "payload": hits[0].payload
            }
    except Exception as e:
        print(f"Vector cache search notice: {e}")
    return {"is_cached": False}

def save_verified_claim(claim_text: str, verdict: str, evidence: list, confidence: float = 88.5, explanation: str = ""):
    """Stores a newly verified claim, its verdict, confidence, explanation, and evidence into Qdrant."""
    try:
        client = get_qdrant_client()
        model = get_embedding_model()
        if not client or not model:
            return

        if not init_vector_collection():
            return

        vector = model.encode(claim_text).tolist()
        point_id = abs(hash(claim_text)) % (10 ** 8)
        
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                models.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "claim": claim_text,
                        "verdict": verdict,
                        "confidence": confidence,
                        "explanation": explanation,
                        "evidence": evidence
                    }
                )
            ]
        )
    except Exception as e:
        print(f"Vector cache save notice: {e}")