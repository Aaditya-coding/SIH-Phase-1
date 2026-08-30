# 🔍 Truth Intelligence - Automated Fake News Detection Engine

A robust, full-stack application designed to combat misinformation by extracting claims from text/screenshots, retrieving live web evidence using RAG, and cross-verifying facts utilizing advanced AI pipelines.

---

## ✨ Key Features

* **Multi-Modal Claim Extraction:** Intelligently extracts claims from raw text input and supports OCR processing (`multimodal/ocr_reader.py`) for visual content extraction.
* **Live RAG Web Retrieval:** Leverages custom search engines and RAG rankers (`retrieval/`) to fetch real-time, context-aware web evidence.
* **Benchmark & Evaluation Suite:** Includes an automated evaluation harness (`evaluation/run_benchmark.py`) to measure system accuracy against test cases.
* **AI-Powered Fact-Checking:** Analyzes extracted claims against retrieved evidence to generate a final verdict, confidence score, and detailed reasoning.
* **Seamless Local Launch:** Includes a custom Windows batch script (`Truth_Intelligence.bat`) to boot up both the FastAPI backend and Streamlit frontend concurrently with a single click.

---

## 🛠️ Tech Stack

* **Frontend:** Streamlit (Python) (`frontend/app.py`)
* **Backend:** FastAPI (Python) (`backend/main.py`)
* **Search & Retrieval:** DuckDuckGo Search, Custom RAG Rankers
* **AI & OCR:** Custom Claim Extractor, Verifier, and Multimodal OCR Reader

---

## 📁 Project Structure

```text
TRUTH-INTELLIGENCE/
│
├── ai/
│   ├── claim_extractor.py   # Extracts core claims from text
│   └── verifier.py          # AI fact-checking verification engine
│
├── backend/
│   └── main.py              # FastAPI application & API routing
│
├── docs/
│   └── api.md               # API documentation
│
├── evaluation/
│   └── run_benchmark.py     # Evaluation and benchmark harness
│
├── frontend/
│   ├── app.py               # Streamlit user interface
│   └── users.py             # User management UI logic
│
├── multimodal/
│   └── ocr_reader.py        # OCR module for screenshot text extraction
│
├── retrieval/
│   ├── rag_ranker.py        # RAG evidence ranking module
│   ├── search_engine.py     # Web search integration
│   └── source_ranker.py     # Source authority ranking
│
├── tests/
│   └── test_claims.json     # Test data for claims validation
│
├── .env                     # Local environment variables
├── .env.example             # Template for environment variables
├── docker-compose.yml       # Docker orchestration setup
├── Dockerfile.backend       # Backend container definition
├── Dockerfile.frontend      # Frontend container definition
├── README.md                # Project documentation
├── requirements.txt         # Python package dependencies
└── Truth_Intelligence.bat   # Windows one-click app launcher
```
---

## ⚙️ Quick Start
1. Clone the repository and install requirements:
   ```bash
   git clone https://github.com/Aaditya-coding/SIH-Phase-1
   cd SIH-Phase-1
   pip install -r requirements.txt
   ```
2. Then open the "Truth_Intelligence.bat" file to execute the program
```
