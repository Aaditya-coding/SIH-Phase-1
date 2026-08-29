# retrieval/source_ranker.py

CREDIBILITY_WEIGHTS = {
    "OFFICIAL": 1.35,      # .gov.in, .nic.in, pib.gov.in
    "FACT_CHECK": 1.25,    # boomlive, altnews, snopes
    "NEWS": 1.05,          # Reuters, Hindu, BBC, NDTV
    "UNKNOWN": 0.70        # Random social posts / unverified blogs
}

def apply_credibility_weighting(ranked_evidence: list) -> list:
    """Adjusts FAISS similarity scores using source authority tiers."""
    for item in ranked_evidence:
        source_type = item.get("source", "UNKNOWN")
        weight = CREDIBILITY_WEIGHTS.get(source_type, 0.70)
        raw_score = item.get("similarity_score", 0.5)
        item["weighted_score"] = round(min(raw_score * weight, 1.0), 3)

    return sorted(ranked_evidence, key=lambda x: x["weighted_score"], reverse=True)