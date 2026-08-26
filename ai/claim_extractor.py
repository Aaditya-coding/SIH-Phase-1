# Implement extract_claims(text) using simple NPL or an LLM call to return the core factual statement, entites, numbers, and dates. 
import re

def extract_claims(text: str) -> list:
    """
    Extracts structured factual claims, entities, dates, and numbers.
    """
    # Simple regex extractions for Day-1 baseline
    numbers = re.findall(r'\b\d+(?:,\d+)*(?:\.\d+)?\b', text)
    
    # Capitalized word sequences as basic entities
    entities = list(set(re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)))
    
    return [
        {
            "claim_text": text.strip(),
            "entities": entities,
            "dates": [],
            "numbers": numbers
        }
    ]