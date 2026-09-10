import os
import io
import sys
import uuid

# ป้องกันปัญหา TensorFlow C-extension crash บน macOS Python 3.13 เมื่อโหลด umap
if "tensorflow" not in sys.modules:
    sys.modules["tensorflow"] = None

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import UploadResponse, MLRunRequest, MLRunResponse, ChatRequest, ChatResponse, ColumnSummary
from ml_service import MLService
from rag_service import RAGService

app = FastAPI(title="Unsupervised Learning Interactive API")

# อนุญาตให้เชื่อมต่อจาก Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_STORE: dict[str, pd.DataFrame] = {}
rag_service = RAGService()

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Unsupervised Learning ML & RAG Backend"}

@app.post("/api/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(status_code=400, detail="รองรับเฉพาะไฟล์ .csv, .xlsx และ .xls เท่านั้น")

    file_id = str(uuid.uuid4())
    try:
        contents = await file.read()
        if ext == ".csv":
            try:
                df = pd.read_csv(io.BytesIO(contents))
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(contents), encoding="latin1")
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        DATA_STORE[file_id] = df
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"อ่านไฟล์ล้มเหลว: {str(e)}")

    # คำนวณสรุปสถิติของแต่ละคอลัมน์
    col_stats = []
    numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
    
    for col in df.columns:
        is_num = col in numeric_cols
        col_stats.append(ColumnSummary(
            name=col,
            dtype=str(df[col].dtype),
            missing_values=int(df[col].isna().sum()),
            mean=float(df[col].mean()) if is_num else None,
            std=float(df[col].std()) if is_num else None,
            min=float(df[col].min()) if is_num else None,
            max=float(df[col].max()) if is_num else None,
        ))

    preview = df.head(10).fillna("").to_dict(orient="records")

    return UploadResponse(
        file_id=file_id,
        filename=file.filename,
        total_rows=len(df),
        total_columns=len(df.columns),
        columns=df.columns.tolist(),
        numeric_columns=numeric_cols,
        preview_data=preview,
        column_stats=col_stats
    )

@app.get("/api/sample-data", response_model=UploadResponse)
def load_sample_dataset():
    sample_paths = [
        os.path.join(os.path.dirname(__file__), "sample_data.csv"),
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_data.csv"),
        "sample_data.csv"
    ]
    target_path = None
    for p in sample_paths:
        if os.path.exists(p):
            target_path = p
            break

    if not target_path:
        raise HTTPException(status_code=404, detail="ไม่พบไฟล์ตัวอย่าง sample_data.csv ในระบบ")

    df = pd.read_csv(target_path)
    file_id = "sample-" + str(uuid.uuid4())[:8]
    DATA_STORE[file_id] = df

    numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
    col_stats = []
    for col in df.columns:
        is_num = col in numeric_cols
        col_stats.append(ColumnSummary(
            name=col,
            dtype=str(df[col].dtype),
            missing_values=int(df[col].isna().sum()),
            mean=float(df[col].mean()) if is_num else None,
            std=float(df[col].std()) if is_num else None,
            min=float(df[col].min()) if is_num else None,
            max=float(df[col].max()) if is_num else None,
        ))

    preview = df.head(10).fillna("").to_dict(orient="records")
    return UploadResponse(
        file_id=file_id,
        filename="sample_data.csv",
        total_rows=len(df),
        total_columns=len(df.columns),
        columns=df.columns.tolist(),
        numeric_columns=numeric_cols,
        preview_data=preview,
        column_stats=col_stats
    )

@app.post("/api/run-ml", response_model=MLRunResponse)
async def run_ml(req: MLRunRequest):
    if req.file_id not in DATA_STORE:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลชุดนี้ในระบบ กรุณาอัปโหลดใหม่")
    
    df = DATA_STORE[req.file_id]
    try:
        res = MLService.process_unsupervised_pipeline(df, req)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการประมวลผล ML: {str(e)}")

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    try:
        res = rag_service.answer_query(req)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chatbot ขัดข้อง: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
