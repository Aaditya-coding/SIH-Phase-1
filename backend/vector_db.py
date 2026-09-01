from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer

# Initialize Qdrant client (local docker instance)
qdrant_client = QdrantClient(host="localhost", port=6333)

# Load a lightweight, high-performance embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

COLLECTION_NAME = "verified_claims"

def init_vector_collection():
    """Ensures the Qdrant collection exists with the correct vector dimensions."""
    collections = qdrant_client.get_collections().collections
    exists = any(c.name == COLLECTION_NAME for c in collections)
    
    if not exists:
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=384,  # dimensionality of all-MiniLM-L6-v2
                distance=models.Distance.COSINE
            )
        )

def search_similar_claim(claim_text: str, threshold: float = 0.92):
    """Searches Qdrant to see if a semantically identical claim was already verified."""
    init_vector_collection()
    query_vector = embedding_model.encode(claim_text).tolist()
    
    response = qdrant_client.query_points(
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
    return {"is_cached": False}

def save_verified_claim(claim_text: str, verdict: str, evidence: list, confidence: float = 88.5, explanation: str = ""):
    """Stores a newly verified claim, its verdict, confidence, explanation, and evidence into Qdrant."""
    init_vector_collection()
    vector = embedding_model.encode(claim_text).tolist()
    point_id = abs(hash(claim_text)) % (10 ** 8) # Simple pseudo-unique numeric ID
    
    qdrant_client.upsert(
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