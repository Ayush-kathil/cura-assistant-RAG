from pydantic import BaseModel, Field
from typing import List, Optional

class DocumentMetadata(BaseModel):
    document_name: str
    page_number: Optional[str] = None
    section: Optional[str] = None
    chunk_id: str
    upload_time: str

class Chunk(BaseModel):
    id: str
    text: str
    metadata: DocumentMetadata
    embedding: Optional[List[float]] = None

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5
    active_document_ids: Optional[List[str]] = None
    model: str = "gemini-2.5-flash"

class QueryResponse(BaseModel):
    answer: str
    citations: List[DocumentMetadata]
