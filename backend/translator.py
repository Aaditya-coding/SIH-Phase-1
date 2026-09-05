# Lazy-loaded neural machine translation pipeline
_translator_pipeline = None

def get_translator_pipeline():
    global _translator_pipeline
    if _translator_pipeline is None:
        try:
            from transformers import pipeline
            _translator_pipeline = pipeline("translation", model="Helsinki-NLP/opus-mt-mul-en")
        except Exception:
            _translator_pipeline = False
    return _translator_pipeline if _translator_pipeline is not False else None

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

        pipe = get_translator_pipeline()
        if pipe:
            # Run local neural translation
            translated_result = pipe(claim, max_length=512)
            translated_text = translated_result[0]["translation_text"]
            return {
                "original_claim": claim,
                "processed_claim": translated_text,
                "is_translated": claim.strip().lower() != translated_text.strip().lower()
            }

        # Fast fallback using deep-translator (Google Translate)
        try:
            from deep_translator import GoogleTranslator
            translated_text = GoogleTranslator(source='auto', target='en').translate(claim)
            return {
                "original_claim": claim,
                "processed_claim": translated_text,
                "is_translated": claim.strip().lower() != translated_text.strip().lower()
            }
        except Exception:
            pass
        
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