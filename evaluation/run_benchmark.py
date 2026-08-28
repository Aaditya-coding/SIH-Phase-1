# evaluation/run_benchmark.py
import json
import requests
from sklearn.metrics import classification_report, accuracy_score

BACKEND_URL = "http://localhost:8000/analyze"

def evaluate_pipeline(dataset_path: str = "tests/test_claims.json"):
    with open(dataset_path, "r", encoding="utf-8") as f:
        test_cases = json.load(f)

    y_true = []
    y_pred = []

    print(f"Starting Evaluation on {len(test_cases)} benchmark claims...\n")

    for idx, item in enumerate(test_cases, 1):
        claim = item["claim"]
        expected = item["expected_verdict"]

        try:
            res = requests.post(BACKEND_URL, json={"input_type": "text", "content": claim}, timeout=25)
            if res.status_code == 200:
                pred = res.json().get("verdict", "UNKNOWN")
            else:
                pred = "ERROR"
        except Exception:
            pred = "FAILED"

        y_true.append(expected)
        y_pred.append(pred)
        print(f"[{idx}/{len(test_cases)}] Claim: {claim[:45]}... | Expected: {expected} | Pred: {pred}")

    acc = accuracy_score(y_true, y_pred)
    print("\n" + "="*50)
    print(f"OVERALL ACCURACY: {acc * 100:.2f}%\n")
    print(classification_report(y_true, y_pred, zero_division=0))
    print("="*50)

if __name__ == "__main__":
    evaluate_pipeline()