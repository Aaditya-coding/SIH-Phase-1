from transformers import pipeline

# Initialize a lightweight, local neural machine translation pipeline
try:
    translator_pipeline = pipeline("translation", model="Helsinki-NLP/opus-mt-mul-en")
except Exception:
    translator_pipeline = None

def preprocess_and_translate_claim(claim: str) -> dict:
    """
    Translates regional text to English locally using Hugging Face transformers,
    bypassing external web scraping and rate limits entirely.
    """
    try:
        if not claim or not claim.strip():
            return {
                "original_claim": claim, 
                "processed_claim": claim, 
                "is_translated": False
            }

        # Simple heuristic check: if it's already ASCII/English, skip translation overhead
        if all(ord(char) < 128 for char in claim[:25]):
            return {
                "original_claim": claim, 
                "processed_claim": claim, 
                "is_translated": False
            }

        if translator_pipeline:
            # Run local neural translation
            translated_result = translator_pipeline(claim, max_length=512)
            translated_text = translated_result[0]["translation_text"]
            
            return {
                "original_claim": claim,
                "processed_claim": translated_text,
                "is_translated": claim.strip().lower() != translated_text.strip().lower()
            }
        
        return {
            "original_claim": claim, 
            "processed_claim": claim, 
            "is_translated": False
        }
        
    except Exception as e:
        # Fallback gracefully if translation fails
        return {
            "original_claim": claim,
            "processed_claim": claim,
            "is_translated": False
        }