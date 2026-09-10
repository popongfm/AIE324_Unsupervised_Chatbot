# Unsupervised Learning 3D Visualizer & AI Tutor

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![Plotly](https://img.shields.io/badge/Visualization-Plotly.js%203D-3F4F75.svg?style=flat&logo=plotly)](https://plotly.com)
[![Ollama](https://img.shields.io/badge/Local%20AI-Ollama%20RAG-orange.svg?style=flat)](https://ollama.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An interactive, scientific-grade web application inspired by the **Dash Brain Viewer** dark-theme interface for exploring **Unsupervised Machine Learning** concepts hands-on.

Features **interactive 3D/2D Scatter Plots**, **drag-and-drop CSV/XLSX data upload**, a complete **Unsupervised ML Suite** (Dimensionality Reduction, Clustering, and Outlier Detection), and an integrated **Local AI Tutor** (RAG over course lecture slides with a **Two-Layer Prompt Injection Guardrail**).

---

## Features

- **Dash Brain Viewer Aesthetic:** Dark laboratory theme (`#141414`) with custom 3D orbit controls, dynamic colorscale switcher, and point-level click inspector.
- **Universal Tabular Upload:** Drag-and-drop `.csv`, `.xlsx`, and `.xls` files with automatic column statistics and missing-value handling.
- **3-in-1 Unsupervised ML Suite:**
  - **Dimensionality Reduction:** PCA, t-SNE, and UMAP for 2D/3D projection.
  - **Clustering:** K-Means (with auto-suggested best k via Silhouette score), DBSCAN, and Agglomerative Hierarchical.
  - **Anomaly Detection:** Isolation Forest and Local Outlier Factor (LOF) highlighting outliers as vivid diamond markers.
- **Interactive 3D Annotations:** Click any data point on the 3D graph to inspect its raw JSON attributes and pin a callout annotation.
- **Local AI Teaching Assistant:** 100% private, free, and local RAG powered by **Ollama (`llama3:8b` / `qwen2.5:7b`)** + **ChromaDB**, grounded in course lecture slides with live on-screen data awareness.
- **Two-Layer Injection & Scope Guardrail:** Pre-filters prompt injections, jailbreaks, and off-topic questions, automatically providing relevant suggested prompts.

---

## Quick Start

### 1. Prerequisites
- **Python:** 3.10+
- **Ollama:** Download from [ollama.com](https://ollama.com)

Pull the required local AI models:
```bash
ollama pull nomic-embed-text
ollama pull llama3:8b
```

---

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Ingest course lecture PDFs into local ChromaDB vector store
python ingest_lectures.py

# Start the FastAPI server (bind to 0.0.0.0 to support both IPv4 and IPv6)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

### 3. Interactive API & Testing (Backend)

Once the backend is running, you can access the interactive Swagger API documentation:
- Open **`http://localhost:8000/docs`** in your browser to test all endpoints (`/api/upload`, `/api/run-ml`, `/api/chat`).

You can also test uploading and checking health directly via terminal:
```bash
# Test health check
curl http://localhost:8000/health

# Test file upload with sample dataset
curl -X POST -F "file=@sample_data.csv" http://localhost:8000/api/upload
```

---

## Quick Test with Sample Data

A pre-packaged sample dataset with normal clusters and extreme outliers is included at [`sample_data.csv`](sample_data.csv).
You can inspect the dataset structure and test the unsupervised algorithms via the API or Python scripts directly.

---

## Verifying Prompt Injection Defense

The backend includes a dedicated unit test verifying the Two-Layer Guardrail:
```bash
python3 backend/test_guardrail.py
```
**Test Results (15/15 Passed):**
- [Blocked] "Ignore all previous instructions", "Reveal system prompt", "Act as DAN", and off-topic queries (recipes, gaming, politics, crypto).
- [Allowed] Questions regarding K-Means, Silhouette score, PCA, Isolation Forest, and uploaded dataset features.

---

## Project Structure

```
unsupervised_chat_bot/
├── backend/
│   ├── requirements.txt         # Python dependencies
│   ├── schemas.py              # Pydantic validation schemas
│   ├── guardrail_service.py    # Layer 1 Pre-filter & Injection detector
│   ├── ml_service.py           # PCA, t-SNE, UMAP, K-Means, IsoForest
│   ├── rag_service.py          # Layer 2 Hardened Prompt & ChromaDB RAG
│   ├── ingest_lectures.py      # PDF text extractor & vector indexer
│   ├── main.py                 # FastAPI REST API routes
│   └── test_guardrail.py       # Guardrail test suite
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Dark theme & custom scrollbars
│   │   └── page.tsx            # Dash Brain Viewer 2-column layout
│   └── components/
│       ├── FileUpload.tsx      # Drag-and-drop CSV/XLSX uploader
│       ├── ScatterViewer.tsx   # 3D/2D Plotly canvas & 3D pin inspector
│       ├── MLControlPanel.tsx  # Algorithm & hyperparameter controls
│       └── AIChatbot.tsx       # AI Tutor chat with guardrail alerts
│
├── sample_data.csv             # Test dataset
└── README.md                   # Quick start documentation
```

---

## Course Reference
Developed for **AIE324 — Unsupervised Machine Learning**, School of Engineering, Artificial Intelligence Engineering and Data Science.

Reference materials:
- `Lecture-3_Dimensionality_Reduction.pdf` (PCA, t-SNE, UMAP, Scree plots)
- `Lecture-4_Anomaly_Detection-V2.pdf` (Isolation Forest, LOF, One-Class SVM)
- `Lectue-5_Clustering.pdf` (K-Means, DBSCAN, Hierarchical, Silhouette score)
