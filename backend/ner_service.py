import spacy

# Load spaCy's small English NLP model
nlp = spacy.load("en_core_web_sm")

def extract_entities(text: str) -> list:
    """Extracts meaningful entities (people, orgs, locations, medical terms) from a claim."""
    doc = nlp(text)
    # Extract unique entity text strings
    entities = list(set([ent.text for ent in doc.ents]))
    return entities