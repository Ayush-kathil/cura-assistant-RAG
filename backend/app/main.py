import os
import io
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.models.schemas import QueryRequest, QueryResponse, DocumentMetadata
from app.parsers.document_parser import DocumentParser
from app.chunkers.semantic_chunker import SemanticChunker
from app.embeddings.embedder import LocalEmbedder
from app.vector_store.qdrant_client import QdrantStore
from app.retrievers.hybrid_retriever import HybridRetriever
from app.rerankers.bge_reranker import BGEReranker
from app.services.gemini_service import GeminiService

app = FastAPI(title="Cura RAG API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global singleton instances
embedder = LocalEmbedder()
vector_store = QdrantStore()
retriever = HybridRetriever(vector_store, embedder)
reranker = BGEReranker()
gemini_service = GeminiService() # Requires GEMINI_API_KEY env var
chunker = SemanticChunker()

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    try:
        content = await file.read()
        parsed_pages = []
        
        # 1. Parse
        if file.filename.lower().endswith('.pdf'):
            parsed_pages = DocumentParser.parse_pdf(content, file.filename)
        elif file.filename.lower().endswith('.docx'):
            parsed_pages = DocumentParser.parse_docx(content, file.filename)
        elif file.filename.lower().endswith('.txt'):
            parsed_pages = [{"text": content.decode('utf-8'), "metadata": {"document_name": file.filename}}]
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
            
        # 2. Chunk
        chunks = chunker.chunk_document(parsed_pages)
        
        # 3. Embed
        texts = [c.text for c in chunks]
        embeddings = embedder.embed_batch(texts)
        for chunk, emb in zip(chunks, embeddings):
            chunk.embedding = emb
            
        # 4. Insert into Vector Store
        vector_store.insert_chunks(chunks)
        
        # 5. Add to BM25 Corpus
        retriever.add_to_corpus([{"id": c.id, "text": c.text, "metadata": c.metadata.model_dump()} for c in chunks])
        
        return {"status": "success", "message": f"Successfully indexed {len(chunks)} chunks from {file.filename}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def query_documents(req: QueryRequest):
    try:
        # 1. Retrieve (Hybrid)
        # Fetch Top 20 across vector and BM25
        retrieved_docs = retriever.retrieve(req.query, top_k=20)
        
        # 2. Rerank
        # Keep Top K (default 5)
        reranked_docs = reranker.rerank(req.query, retrieved_docs, top_k=req.top_k)
        
        # 3. Generate
        answer = gemini_service.generate_answer(req.query, reranked_docs)
        
        # 4. Citations Assembly
        citations = []
        for doc in reranked_docs:
            meta = doc.get("metadata", {})
            citations.append(DocumentMetadata(**meta))
            
        return QueryResponse(answer=answer, citations=citations)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents():
    """Returns a list of unique document names from the corpus."""
    unique_docs = set()
    for meta in retriever.corpus_metadata:
        doc_name = meta.get("metadata", {}).get("document_name")
        if doc_name:
            unique_docs.add(doc_name)
    return {"documents": list(unique_docs)}

@app.delete("/document/{filename}")
async def delete_document(filename: str):
    """Deletes a document from the vector store."""
    try:
        vector_store.delete_document(filename)
        return {"status": "success", "message": f"Deleted {filename} from vector store."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
