import os
import glob
import pypdf
import chromadb
import requests

CHROMA_DATA_PATH = os.path.join(os.path.dirname(__file__), "vector_db")
PDF_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OLLAMA_EMBED_URL = "http://localhost:11434/api/embeddings"

def get_embedding(text: str) -> list[float]:
    """ส่งข้อความไปหา Ollama เพื่อสร้าง Embedding Vector"""
    try:
        res = requests.post(
            OLLAMA_EMBED_URL,
            json={"model": "nomic-embed-text", "prompt": text},
            timeout=15
        )
        res.raise_for_status()
        return res.json()["embedding"]
    except Exception as e:
        print(f"[Warning] Failed to generate embedding ({str(e)}), using fallback vector.")
        return [0.0] * 768

def split_text(text: str, chunk_size=800, overlap=150) -> list[str]:
    """แบ่งข้อความยาวๆ เป็น Chunks โดยมี Overlap เพื่อรักษาบริบท"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += (chunk_size - overlap)
    return chunks

def ingest_all_pdfs():
    print("[Info] Starting PDF ingestion for AIE324 course materials...")
    os.makedirs(CHROMA_DATA_PATH, exist_ok=True)
    
    # เชื่อมต่อ Persistent ChromaDB
    chroma_client = chromadb.PersistentClient(path=CHROMA_DATA_PATH)
    collection = chroma_client.get_or_create_collection(name="unsupervised_lectures")
    
    # ค้นหาไฟล์ PDF ทั้งหมดในโฟลเดอร์หลัก
    pdf_files = glob.glob(os.path.join(PDF_DIR, "*.pdf"))
    if not pdf_files:
        print("[Error] No PDF files found in root directory.")
        return

    doc_id = 0
    for pdf_path in sorted(pdf_files):
        filename = os.path.basename(pdf_path)
        print(f"[Reading] Processing file: {filename}")
        
        try:
            reader = pypdf.PdfReader(pdf_path)
            for page_idx, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if not page_text or len(page_text.strip()) < 30:
                    continue
                    
                chunks = split_text(page_text)
                for chunk_idx, chunk in enumerate(chunks):
                    emb = get_embedding(chunk)
                    collection.add(
                        ids=[f"{filename}_p{page_idx+1}_c{chunk_idx}_{doc_id}"],
                        embeddings=[emb],
                        documents=[chunk],
                        metadatas=[{
                            "source": filename,
                            "page": page_idx + 1,
                            "chunk": chunk_idx
                        }]
                    )
                    doc_id += 1
        except Exception as err:
            print(f"[Error] Failed to read file {filename}: {str(err)}")
                
    print(f"[Success] Ingestion complete. Stored {doc_id} chunks in ChromaDB at {CHROMA_DATA_PATH}")

if __name__ == "__main__":
    ingest_all_pdfs()
