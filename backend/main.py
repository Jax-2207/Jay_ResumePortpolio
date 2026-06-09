"""
Jay Wani Portfolio - FastAPI RAG Backend
Handles: File upload, text extraction, FAISS vector indexing, Claude-powered Q&A
"""

import os
import io
import uuid
import time
import logging
from typing import Optional
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import numpy as np

# PDF extraction
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

# DOCX extraction
try:
    from docx import Document as DocxDocument
except ImportError:
    DocxDocument = None

# FastEmbed (Lightweight ONNX alternative to SentenceTransformers)
from fastembed import TextEmbedding

# FAISS
import faiss

# Groq
import groq

# Load env
from dotenv import load_dotenv
load_dotenv()

# ─── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("jay-rag")

# ─── Constants ─────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
TOP_K = 3
EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"
GROQ_MODEL = "llama-3.3-70b-versatile"

# ─── App Setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Jay Wani RAG Backend",
    description="FastAPI RAG system with FAISS vector store + Groq AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
        "https://jaywani.vercel.app",
        "*"  # For development; tighten in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load Embedding Model ───────────────────────────────────────────────────────
logger.info("Loading FastEmbed model...")
embedder = TextEmbedding(model_name=EMBEDDING_MODEL)
logger.info("Model loaded.")

# ─── In-Memory Session Store ────────────────────────────────────────────────────
# session_id -> {chunks: List[str], index: faiss.Index, embeddings: np.ndarray}
sessions: dict = {}

# ─── Pydantic Models ────────────────────────────────────────────────────────────
class QueryRequest(BaseModel):
    question: str
    session_id: str

class QueryResponse(BaseModel):
    answer: str
    chunks: list
    chunk_count: int
    tokens_used: int
    inference_time_ms: int

class UploadResponse(BaseModel):
    session_id: str
    chunk_count: int
    processing_time_ms: int
    filename: str
    file_type: str
    char_count: int

class HealthResponse(BaseModel):
    status: str
    model: str
    sessions_active: int
    embedding_model: str

# ─── Helpers ────────────────────────────────────────────────────────────────────
def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF bytes."""
    if PyPDF2 is None:
        raise HTTPException(status_code=500, detail="PyPDF2 not installed")
    reader = PyPDF2.PdfReader(io.BytesIO(content))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text

def extract_text_from_docx(content: bytes) -> str:
    """Extract text from DOCX bytes."""
    if DocxDocument is None:
        raise HTTPException(status_code=500, detail="python-docx not installed")
    doc = DocxDocument(io.BytesIO(content))
    return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])

def extract_text_from_txt(content: bytes) -> str:
    """Extract text from TXT bytes."""
    try:
        return content.decode("utf-8")
    except UnicodeDecodeError:
        return content.decode("latin-1")

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    text = text.strip()
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk.strip())
        start += chunk_size - overlap
    return chunks

def build_faiss_index(embeddings: np.ndarray) -> faiss.Index:
    """Create FAISS flat L2 index from embeddings."""
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    # Normalize for cosine similarity
    faiss.normalize_L2(embeddings)
    index.add(embeddings)
    return index

def retrieve_top_k(query: str, session: dict, k: int = TOP_K):
    """Retrieve top-k chunks by cosine similarity."""
    query_embedding_list = list(embedder.embed([query]))
    query_embedding = np.array(query_embedding_list, dtype=np.float32)
    distances, indices = session["index"].search(query_embedding, k)
    results = []
    for i, idx in enumerate(indices[0]):
        if idx < len(session["chunks"]):
            # Convert L2 distance to cosine similarity score (0-1)
            score = float(max(0, 1 - distances[0][i] / 2))
            results.append({
                "chunk_index": int(idx) + 1,
                "text": session["chunks"][idx],
                "relevance_score": round(score, 3)
            })
    return results

# ─── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse(
        status="online",
        model=GROQ_MODEL,
        sessions_active=len(sessions),
        embedding_model=EMBEDDING_MODEL
    )

@app.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a PDF, TXT, or DOCX file.
    Extracts text, chunks it, embeds with SentenceTransformers, stores FAISS index.
    """
    start_time = time.time()

    # Validate file type
    filename = file.filename or "unknown"
    ext = Path(filename).suffix.lower()
    allowed_exts = {".pdf", ".txt", ".docx"}
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(allowed_exts)}"
        )

    # Read file content
    content = await file.read()
    logger.info(f"Received file: {filename} ({len(content)} bytes)")

    # Extract text based on type
    try:
        if ext == ".pdf":
            text = extract_text_from_pdf(content)
            file_type = "PDF"
        elif ext == ".docx":
            text = extract_text_from_docx(content)
            file_type = "DOCX"
        else:
            text = extract_text_from_txt(content)
            file_type = "TXT"
    except Exception as e:
        logger.error(f"Text extraction error: {e}")
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="No text content found in file.")

    # Chunk text
    chunks = chunk_text(text)
    logger.info(f"Created {len(chunks)} chunks from {len(text)} characters")

    if not chunks:
        raise HTTPException(status_code=400, detail="Could not create text chunks.")

    # Create embeddings
    try:
        embeddings_generator = embedder.embed(chunks)
        embeddings = np.array(list(embeddings_generator), dtype=np.float32)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")

    # Build FAISS index
    try:
        index = build_faiss_index(embeddings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Index creation failed: {str(e)}")

    # Store session
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "chunks": chunks,
        "index": index,
        "embeddings": embeddings,
        "filename": filename,
        "file_type": file_type,
        "created_at": time.time()
    }

    processing_time = int((time.time() - start_time) * 1000)
    logger.info(f"Session {session_id} created in {processing_time}ms")

    return UploadResponse(
        session_id=session_id,
        chunk_count=len(chunks),
        processing_time_ms=processing_time,
        filename=filename,
        file_type=file_type,
        char_count=len(text)
    )

@app.post("/query", response_model=QueryResponse)
async def query_document(request: QueryRequest):
    """
    Query the uploaded document using RAG.
    Retrieves top-k chunks, sends to Claude with question as context.
    """
    start_time = time.time()

    # Validate session
    if request.session_id not in sessions:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please upload a file first."
        )

    session = sessions[request.session_id]

    # Retrieve relevant chunks
    try:
        retrieved = retrieve_top_k(request.question, session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval failed: {str(e)}")

    if not retrieved:
        raise HTTPException(status_code=500, detail="No relevant chunks found.")

    # Build context from chunks
    context = "\n\n".join([
        f"[Chunk {r['chunk_index']}] (Relevance: {r['relevance_score']}):\n{r['text']}"
        for r in retrieved
    ])

    # Call Groq API
    if not GROQ_API_KEY:
        # Return a mock response if no key is set
        answer = (
            f"[Demo Mode - No API Key] Based on the document, here are the most relevant passages "
            f"related to '{request.question}':\n\n" +
            "\n\n".join([f"• {r['text'][:200]}..." for r in retrieved])
        )
        tokens_used = 0
    else:
        try:
            client = groq.Groq(api_key=GROQ_API_KEY)
            completion = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an intelligent document assistant. Answer questions based strictly "
                            "on the provided context chunks from the uploaded document. If the answer "
                            "is not in the context, say so clearly. Be concise and precise."
                        )
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Context from the document:\n\n{context}\n\n"
                            f"Question: {request.question}\n\n"
                            f"Answer based only on the context provided above:"
                        )
                    }
                ],
                max_tokens=1024
            )
            answer = completion.choices[0].message.content
            tokens_used = completion.usage.total_tokens
        except Exception as e:
            logger.error(f"Groq API error: {e}")
            raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    inference_time = int((time.time() - start_time) * 1000)

    return QueryResponse(
        answer=answer,
        chunks=retrieved,
        chunk_count=len(session["chunks"]),
        tokens_used=tokens_used,
        inference_time_ms=inference_time
    )

@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Clean up a session and free memory."""
    if session_id in sessions:
        del sessions[session_id]
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Session not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
