# 🔍 Truth Intelligence — AI-Powered Fake News Detection & Verification

Truth Intelligence is a full-stack, AI-powered misinformation detection and fact-verification system designed to analyze claims from **text and images/screenshots**, retrieve supporting or contradicting evidence from the web, and generate an explainable verification result.

The system combines **FastAPI, Next.js, Streamlit, Retrieval-Augmented Generation (RAG), vector search, graph-based knowledge storage, OCR, NLP, web search, and AI-powered verification** into a unified pipeline.

---

## ✨ Key Features

### 🧠 AI-Powered Claim Extraction

Extracts meaningful factual claims from user-provided text and prepares them for verification.

* Claim extraction and normalization
* AI-assisted analysis
* Claim-level verification
* Confidence scoring
* Explainable reasoning

### 🔎 Live Web Evidence Retrieval

The retrieval pipeline searches the web for relevant evidence and ranks the results according to relevance and source quality.

* Live web search
* Semantic retrieval
* RAG-based evidence ranking
* Source authority/ranking
* Evidence aggregation
* Relevant context extraction

### 🖼️ Multimodal Verification

Truth Intelligence can process information from images and screenshots using OCR.

```text
Image / Screenshot
        ↓
      OCR
        ↓
Extracted Text
        ↓
Claim Extraction
        ↓
Evidence Retrieval
        ↓
AI Verification
```

The OCR functionality is implemented in the `multimodal/` module.

### 🌐 Multilingual Processing

The project includes NLP and translation functionality to process claims that may not initially be in English.

The translation pipeline can convert supported input into a form suitable for downstream claim analysis and retrieval.

### 🕸️ Knowledge Graph

Neo4j is used to store and relate extracted entities, claims, evidence, and other verification-related information.

This allows the system to maintain relationships between information rather than relying exclusively on flat text retrieval.

### 🗄️ Vector Search

Qdrant is used as the vector database for semantic similarity and retrieval operations.

The system can represent textual information as embeddings and use vector similarity to retrieve relevant information.

### ⚡ Asynchronous AI Processing

Long-running claim-analysis operations are handled using **Celery** with **Redis** as the message broker/result backend.

```text
User
  ↓
Next.js / Streamlit
  ↓
FastAPI
  ↓
Celery Task
  ↓
Redis
  ↓
Celery Worker
  ↓
AI + Retrieval Pipeline
  ↓
Qdrant / Neo4j / Web Evidence
  ↓
Result
```

### 📊 Evaluation & Benchmarking

The repository contains an evaluation framework for testing the verification pipeline against predefined claim test cases.

The evaluation code is located in:

```text
evaluation/
```

---

# 🏗️ System Architecture

The current application consists of multiple components working together:

```text
                         USER
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
      Next.js Web UI               Streamlit UI
      web-frontend/                 frontend/
             │                           │
             └─────────────┬─────────────┘
                           │
                           ▼
                    FastAPI Backend
                      backend/main.py
                           │
                           ▼
                    Celery Task Queue
                           │
                           ▼
                         Redis
                           │
                           ▼
                    Celery Worker
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          AI Pipeline   Retrieval    Multimodal
              │            │            │
              │            ▼            ▼
              │          Qdrant       OCR
              │            │
              ▼            ▼
          Verification   Web Search
              │
              ▼
            Neo4j
              │
              ▼
       Final Verification Result
```

---

# 🛠️ Technology Stack

| Component                     | Technology               |
| ----------------------------- | ------------------------ |
| Web Frontend                  | Next.js / React          |
| Python Frontend               | Streamlit                |
| Backend API                   | FastAPI                  |
| Background Processing         | Celery                   |
| Message Broker / Task Backend | Redis                    |
| Vector Database               | Qdrant                   |
| Graph Database                | Neo4j                    |
| AI / LLM                      | OpenAI API               |
| Embeddings                    | Sentence Transformers    |
| NLP                           | spaCy / Transformers     |
| Web Search                    | DDGS / DuckDuckGo search |
| OCR                           | Tesseract + Pytesseract  |
| Image Processing              | Pillow                   |
| Data Processing               | Pandas / NumPy           |
| Vector Similarity             | FAISS                    |
| Evaluation                    | scikit-learn             |
| Visualization                 | Plotly / NetworkX        |
| Containerization              | Docker / Docker Compose  |
| Web Frontend Package Manager  | npm                      |

---

# 📁 Project Structure

```text
SIH-Phase-1/
│
├── ai/
│   ├── claim_extractor.py       # Claim extraction
│   └── verifier.py              # AI-powered verification
│
├── backend/
│   ├── main.py                  # FastAPI application and API endpoints
│   ├── celery_app.py            # Celery application configuration
│   ├── tasks.py                 # Background claim-analysis tasks
│   ├── vector_db.py             # Qdrant/vector database integration
│   ├── graph_db.py              # Neo4j/graph database integration
│   ├── ner_service.py           # Named-entity recognition
│   ├── translator.py            # Translation functionality
│   └── ...
│
├── frontend/
│   ├── app.py                   # Streamlit application
│   └── users.py                 # Streamlit user-related functionality
│
├── web-frontend/
│   ├── app/                     # Next.js application routes/pages
│   ├── components/              # Reusable React components
│   ├── lib/                     # Frontend utilities/API logic
│   ├── public/                  # Static assets
│   ├── package.json             # Node.js dependencies and scripts
│   └── ...
│
├── retrieval/
│   ├── rag_ranker.py            # RAG / semantic ranking
│   ├── search_engine.py         # Web search integration
│   └── source_ranker.py         # Source credibility/ranking
│
├── multimodal/
│   └── ocr_reader.py            # Image/screenshot OCR
│
├── evaluation/
│   └── run_benchmark.py         # Evaluation and benchmark runner
│
├── tests/
│   └── test_claims.json         # Claim test cases
│
├── docs/
│   └── api.md                   # API documentation
│
├── docker-compose.yml           # Local multi-service orchestration
├── Dockerfile.backend           # Backend Docker image
├── Dockerfile.frontend          # Frontend Docker image
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variable template
├── .gitignore                   # Git ignore rules
├── Truth_Intelligence.bat       # Windows launcher
└── README.md                    # Project documentation
```

---

# ⚙️ Prerequisites

Before running Truth Intelligence locally, install:

### Required

* Python 3.10 or 3.11
* pip
* Docker Desktop
* Node.js and npm
* Git
* Tesseract OCR

### External/API requirements

Depending on the enabled features, the application also requires credentials for the configured AI and search services.

---

# 🚀 Quick Start — Docker

Docker Compose is the recommended way to run the complete local environment because the project uses multiple services.

### 1. Clone the repository

```bash
git clone https://github.com/Aaditya-coding/SIH-Phase-1.git
cd SIH-Phase-1
```

### 2. Configure environment variables

Create a `.env` file from the provided template:

```bash
copy .env.example .env
```

On Linux/macOS:

```bash
cp .env.example .env
```

Open `.env` and provide the required API keys and configuration values.

**Never commit real API keys or passwords to GitHub.**

### 3. Start the application

```bash
docker compose up --build
```

To run in the background:

```bash
docker compose up -d --build
```

### 4. Check running containers

```bash
docker compose ps
```

### 5. View logs

```bash
docker compose logs
```

Backend logs:

```bash
docker compose logs backend
```

Redis logs:

```bash
docker compose logs redis
```

Qdrant logs:

```bash
docker compose logs qdrant
```

Neo4j logs:

```bash
docker compose logs neo4j
```

---

# 🐍 Manual Python Setup

If you want to run the Python components without Docker:

### 1. Create a virtual environment

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

Linux/macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Upgrade pip

```bash
python -m pip install --upgrade pip
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Install the spaCy model

```bash
python -m spacy download en_core_web_sm
```

### 5. Configure Tesseract

Install Tesseract OCR separately.

On Windows, make sure the Tesseract executable is installed and that the configured path in the OCR module matches your installation.

---

# 🌐 Running the Next.js Frontend

The project contains a separate Next.js web application in:

```text
web-frontend/
```

Move into the frontend directory:

```bash
cd web-frontend
```

Install Node dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

The exact API URL used by the frontend should be configured according to the project's frontend environment configuration.

---

# 🖥️ Running the Streamlit Frontend

The project also contains a Streamlit frontend:

```text
frontend/app.py
```

Run it with:

```bash
streamlit run frontend/app.py
```

Streamlit normally starts at:

```text
http://localhost:8501
```

---

# ⚡ FastAPI Backend

The FastAPI application is located at:

```text
backend/main.py
```

Run it directly with:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

Alternative OpenAPI documentation:

```text
http://localhost:8000/redoc
```

---

# 🔄 Claim Verification Pipeline

A typical verification request follows this process:

```text
User Claim
    │
    ▼
Claim Extraction
    │
    ▼
Claim Normalization
    │
    ▼
Semantic / Vector Retrieval
    │
    ▼
Live Web Search
    │
    ▼
Evidence Ranking
    │
    ▼
Source Ranking
    │
    ▼
AI Verification
    │
    ├── Verdict
    ├── Confidence
    ├── Evidence
    └── Explanation
    │
    ▼
Result Returned to User
```

For image-based input:

```text
Image / Screenshot
        │
        ▼
      OCR
        │
        ▼
Extracted Text
        │
        ▼
Claim Extraction
        │
        ▼
Verification Pipeline
```

---

# 🔁 Asynchronous Task Processing

Truth Intelligence uses Celery for claim-analysis tasks.

The FastAPI server can create a background task rather than performing the entire analysis directly inside the HTTP request.

```text
POST /analyze
      │
      ▼
FastAPI
      │
      ▼
Celery Task
      │
      ▼
Redis
      │
      ▼
Celery Worker
      │
      ▼
AI / RAG / Database Pipeline
      │
      ▼
Task Result
```

The client can subsequently query the task status/result.

This architecture prevents long-running verification operations from blocking the main API process.

---

# 🗄️ Database Services

## Redis

Redis is used by Celery for task queuing and result handling.

Local default:

```text
redis://localhost:6379/0
```

---

## Qdrant

Qdrant is the project's vector database.

It is used for semantic/vector retrieval and similarity-based operations.

Typical local configuration:

```text
http://localhost:6333
```

Qdrant's web/API interface can be accessed through its local service port.

---

## Neo4j

Neo4j is used as the project's graph database.

Typical local configuration:

```text
bolt://localhost:7687
```

The Neo4j browser is normally available at:

```text
http://localhost:7474
```

Credentials should be configured through environment variables rather than hard-coded in production.

---

# 🔐 Environment Variables

Create a `.env` file using `.env.example` as the template.

Typical configuration includes:

```env
OPENAI_API_KEY=
SEARCH_API_KEY=

REDIS_URL=
QDRANT_URL=
QDRANT_API_KEY=

NEO4J_URI=
NEO4J_USER=
NEO4J_PASSWORD=

BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
```

The exact variables required depend on which services and features are enabled.

### Security

Never commit:

```text
.env
```

or any file containing:

* API keys
* passwords
* database credentials
* access tokens
* private secrets

Only commit:

```text
.env.example
```

with placeholder values.

---

# 🧪 Evaluation & Benchmarking

The repository contains an evaluation framework under:

```text
evaluation/
```

The benchmark runner is:

```text
evaluation/run_benchmark.py
```

Test claims are stored under:

```text
tests/
```

The evaluation system can be used to measure the behavior and accuracy of the claim-verification pipeline against predefined examples.

---

# 🧰 Useful Development Commands

### Start Docker services

```bash
docker compose up
```

### Rebuild Docker services

```bash
docker compose up --build
```

### Run in background

```bash
docker compose up -d
```

### Stop services

```bash
docker compose down
```

### Stop and remove containers

```bash
docker compose down --remove-orphans
```

### View all logs

```bash
docker compose logs -f
```

### Check containers

```bash
docker compose ps
```

### Run FastAPI locally

```bash
uvicorn backend.main:app --reload
```

### Run Streamlit

```bash
streamlit run frontend/app.py
```

### Run Next.js

```bash
cd web-frontend
npm install
npm run dev
```

---

# 🐛 Troubleshooting

## Backend connection refused

If you see an error such as:

```text
Failed to connect to backend
Connection refused
localhost:8000
```

make sure FastAPI is running:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

If using Docker:

```bash
docker compose ps
docker compose logs backend
```

---

## Redis connection error

Check:

```bash
docker compose ps
```

Make sure Redis is running.

Restart if necessary:

```bash
docker compose restart redis
```

---

## Qdrant connection error

Check:

```bash
docker compose logs qdrant
```

and verify that Qdrant is available on:

```text
localhost:6333
```

---

## Neo4j connection error

Check:

```bash
docker compose logs neo4j
```

Verify that Neo4j is available on:

```text
localhost:7474
```

and Bolt is available on:

```text
localhost:7687
```

---

## Celery tasks are not completing

Check both Redis and the Celery worker.

```bash
docker compose ps
```

Then inspect worker logs:

```bash
docker compose logs -f
```

A common cause is that the worker and FastAPI process are not using the same Redis configuration.

---

## OCR is not working

Verify that:

1. Tesseract OCR is installed.
2. `pytesseract` is installed.
3. The Tesseract executable can be found by the application.
4. The image format is supported.

Test Tesseract from the command line:

```bash
tesseract --version
```

---

## Python import errors

Activate your virtual environment and reinstall dependencies:

```bash
pip install -r requirements.txt --upgrade
```

Check the Python version:

```bash
python --version
```

Python 3.10 or 3.11 is recommended.

---

## Next.js dependency errors

From the frontend directory:

```bash
cd web-frontend
npm install
```

Then:

```bash
npm run dev
```

If the dependency installation is corrupted:

```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```

On Linux/macOS:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

# 🔒 Development vs Production

The repository is currently optimized primarily for **local development and testing using Docker Compose**.

Local architecture:

```text
Docker Compose
│
├── FastAPI
├── Celery
├── Redis
├── Qdrant
├── Neo4j
└── Frontend services
```

For production/cloud deployment, services using:

```text
localhost
```

must be replaced with appropriate hosted service URLs and credentials.

Do not expose development database credentials or API keys publicly.

---

# 🤝 Git Workflow

Create a feature branch before making significant changes:

```bash
git checkout -b feature/your-feature-name
```

After making changes:

```bash
git status
git add .
git commit -m "Describe your change"
git push origin feature/your-feature-name
```

Before working on an existing branch, update your local repository:

```bash
git pull origin main
```

For team development, use separate feature branches and merge tested changes into `main`.

---

# 📌 Current Project Components

Truth Intelligence currently combines:

```text
AI
├── Claim Extraction
└── Verification

Backend
├── FastAPI
├── Celery
├── Redis integration
├── Qdrant integration
├── Neo4j integration
├── NER
└── Translation

Retrieval
├── Web Search
├── RAG Ranking
└── Source Ranking

Multimodal
└── OCR

Frontends
├── Next.js / React
└── Streamlit

Evaluation
└── Benchmarking

Infrastructure
├── Docker
└── Docker Compose
```

---

# 🎯 Project Goal

Truth Intelligence aims to provide an explainable fact-verification workflow rather than simply returning a binary "fake" or "real" label.

The system combines:

```text
Claim
  +
Web Evidence
  +
Semantic Retrieval
  +
Source Quality
  +
Knowledge Graph
  +
AI Reasoning
  =
Explainable Verification
```

The final output is intended to provide the user with a **verdict, confidence, supporting evidence, and reasoning** that can be inspected rather than relying solely on an unexplained classification.

---

# 📄 License

See the repository for the applicable project license and licensing information.

---

# 👥 Team

**Truth Intelligence — SIH Phase 1**

Repository:

https://github.com/Aaditya-coding/SIH-Phase-1
