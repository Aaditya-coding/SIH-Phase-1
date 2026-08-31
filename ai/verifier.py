import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def verify_claim(claim: str, evidence: list) -> dict:
    if not evidence:
        return{
            "verdict": "INSUFFICIENT_EVIDENCE",
            "confidence": 0.0,
            "reason": "No verifiable external reports were found for this statement."
        }

    evidence_text = "\n".join(
        [f"- [{doc.get('source')}] {doc.get('title')}: {doc.get('snippet')}" for doc in evidence]
    )

    prompt = f"""
You are an unbiased fact-checking verifier.
Analyze the Claim against the provided Evidence ONLY. Do not rely on external assumptions or prior training biases.

Claim: "{claim}"

Evidence:
{evidence_text}

Task: 
Determine if the claim is SUPPORTED, REFUTED, CONFLICTING, or INSUFFICIENT_EVIDENCE based strictly on the evidence above.
Return strictly valid JSON with this format: 
{{
    "verdict": "SUPPORTED" | "REFUTED" | "CONFLICTING" | "INSUFFICIENT_EVIDENCE",
    "confidence": <float between 0.0 and 1.0>,
    "reason": "<1-2 sentence explanation citing the evidence>"
}}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a factual verification assistant. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {
            "verdict": "INSUFFICIENT_EVIDENCE",
            "confidence": 0.5,
            "reason": f"Verification model error: {str(e)}"
        }