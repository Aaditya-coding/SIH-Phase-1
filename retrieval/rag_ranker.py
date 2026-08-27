from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# Load a lightweight, fast embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")

def retrieve_evidence(claim: str, documents: list, top_k: int = 3) -> list:
    if not documents:
        return []

    texts = [f"{doc.get('title', '')}: {doc.get('snippet', '')}" for doc in documents]
    
    # Generate dense vector embeddings
    doc_embeddings = embedder.encode(texts, convert_to_numpy=True)
    claim_embedding = embedder.encode([claim], convert_to_numpy=True)

    # Normalize vectors for Cosine Similarity (Inner Product)
    faiss.normalize_L2(doc_embeddings)
    faiss.normalize_L2(claim_embedding)

    dimension = doc_embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(doc_embeddings)

    k = min(top_k, len(documents))
    scores, indices = index.search(claim_embedding, k)

    ranked_results = []
    for score, idx in zip(scores[0], indices[0]):
        doc = dict(documents[idx])
        doc["similarity_score"] = float(round(score, 3))
        ranked_results.append(doc)

    return ranked_results