import re

_nlp = None

def get_nlp():
    global _nlp
    if _nlp is None:
        try:
            import spacy
            _nlp = spacy.load("en_core_web_sm")
        except Exception as e:
            print(f"spaCy NLP model notice: {e}")
            _nlp = False
    return _nlp if _nlp is not False else None

def extract_entities(text: str) -> list:
    """Extracts meaningful entities (people, orgs, locations, medical terms) from a claim."""
    nlp_model = get_nlp()
    if nlp_model:
        try:
            doc = nlp_model(text)
            entities = list(set([ent.text for ent in doc.ents]))
            if entities:
                return entities
        except Exception:
            pass

    # Heuristic fallback: extract capitalized words / named entities
    words = re.findall(r'\b[A-Z][a-z0-9_]+(?:\s+[A-Z][a-z0-9_]+)*\b', text)
    stopwords = {"The", "A", "An", "In", "On", "At", "To", "For", "Of", "With", "By", "Is", "Are", "Was", "Were", "This", "That", "It", "They", "We"}
    cleaned = [w for w in words if w not in stopwords and len(w) > 2]
    return list(dict.fromkeys(cleaned)) if cleaned else ["Intelligence", "Claim"]