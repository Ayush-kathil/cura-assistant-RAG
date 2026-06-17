from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from app.models.schemas import Chunk
from typing import List

class QdrantStore:
    def __init__(self, collection_name: str = "cura_rag"):
        # For development, we use local memory. 
        # In production, connect to a real Qdrant instance.
        self.client = QdrantClient(":memory:")
        self.collection_name = collection_name
        self._ensure_collection()

    def _ensure_collection(self):
        if not self.client.collection_exists(self.collection_name):
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=1024, distance=Distance.COSINE), # BGE-M3 outputs 1024-dim
            )

    def insert_chunks(self, chunks: List[Chunk]):
        if not chunks:
            return
            
        points = []
        for chunk in chunks:
            if not chunk.embedding:
                continue
                
            points.append(
                PointStruct(
                    id=chunk.id,
                    vector=chunk.embedding,
                    payload={
                        "text": chunk.text,
                        "document_name": chunk.metadata.document_name,
                        "page_number": chunk.metadata.page_number,
                        "section": chunk.metadata.section,
                        "chunk_id": chunk.metadata.chunk_id,
                        "upload_time": chunk.metadata.upload_time
                    }
                )
            )
            
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def search(self, query_vector: List[float], top_k: int = 20) -> List[dict]:
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=top_k
        )
        
        return [
            {
                "id": hit.id,
                "score": hit.score,
                "text": hit.payload["text"],
                "metadata": hit.payload
            }
            for hit in results
        ]

    def delete_document(self, document_name: str):
        # Uses Qdrant Scroll/Delete API in real usage to wipe all chunks matching the document_name
        # Note: In-memory client handles delete slightly differently.
        from qdrant_client.http.models import Filter, FieldCondition, MatchValue
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="document_name",
                        match=MatchValue(value=document_name)
                    )
                ]
            )
        )
