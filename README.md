# 🔍 Truth Intelligence: Automated Fake News Verification & RAG Pipeline

Truth Intelligence is an enterprise-grade multimodal misinformation detection engine combining real-time Retrieval-Augmented Generation (RAG), OCR screenshot extraction, and automated evaluation metrics.

## 🚀 Key Features
* **Multimodal Claim Extraction:** Automatically extracts text from uploaded images and screenshots using Tesseract OCR.
* **Live Web RAG Verification:** Cross-references claims against trusted web sources to classify verdicts (`SUPPORTED`, `REFUTED`, `INSUFFICIENT_EVIDENCE`).
* **Automated Benchmark Harness:** Rigorous evaluation framework built with scikit-learn metrics to track precision, recall, and accuracy.
* **Structured Report Export:** Instantly export comprehensive verification logs as JSON or Markdown.

## 🛠️ Tech Stack
* **Backend:** FastAPI, Python, LangChain
* **Frontend:** Streamlit
* **OCR & Multimodal:** Pillow, Tesseract-OCR
* **Evaluation:** Scikit-Learn

## ⚙️ Quick Start
1. Clone the repository and install requirements:
   ```bash
   pip install -r requirements.txt