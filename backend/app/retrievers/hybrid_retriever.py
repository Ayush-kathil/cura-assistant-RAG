from rank_bm25 import BM25Okapi
from app.vector_store.qdrant_client import QdrantStore
from app.embeddings.embedder import LocalEmbedder
from typing import List

class HybridRetriever:
    def __init__(self, vector_store: QdrantStore, embedder: LocalEmbedder):
        self.vector_store = vector_store
        self.embedder = embedder
        
        # Simple in-memory corpus for BM25 (in a production system this would be 
        # persisted to disk or handled by Elasticsearch/OpenSearch)
        self.corpus = []
        self.corpus_metadata = []
        self.bm25 = None

    def add_to_corpus(self, chunks: List[dict]):
        for chunk in chunks:
            self.corpus.append(chunk["text"])
            self.corpus_metadata.append(chunk)
            
        tokenized_corpus = [doc.split(" ") for doc in self.corpus]
        self.bm25 = BM25Okapi(tokenized_corpus)

    def retrieve(self, query: str, top_k: int = 20) -> List[dict]:
        """
        Combines Vector Search (Qdrant) and Keyword Search (BM25) using a naive weighted scoring.
        """
        # 1. Vector Search
        query_vector = self.embedder.embed_text(query)
        vector_results = self.vector_store.search(query_vector, top_k=top_k)
        
        # Create a unique document map to merge scores
        merged_results = {}
        for res in vector_results:
            merged_results[res["id"]] = {
                "id": res["id"],
                "text": res["text"],
                "metadata": res["metadata"],
                "vector_score": res["score"],
                "bm25_score": 0.0
            }
            
        # 2. BM25 Keyword Search
        if self.bm25 and self.corpus:
            tokenized_query = query.split(" ")
            bm25_scores = self.bm25.get_scores(tokenized_query)
            
            # Add BM25 scores to merged_results
            for i, score in enumerate(bm25_scores):
                if score > 0:
                    chunk_id = self.corpus_metadata[i].get("id")
                    if chunk_id in merged_results:
                        merged_results[chunk_id]["bm25_score"] = score
                    else:
                        merged_results[chunk_id] = {
                            "id": chunk_id,
                            "text": self.corpus_metadata[i]["text"],
                            "metadata": self.corpus_metadata[i].get("metadata", {}),
                            "vector_score": 0.0,
                            "bm25_score": score
                        }
        
        # 3. Naive Hybrid Scoring (Weighted sum, scaling BM25 slightly)
        # Note: Reciprocal Rank Fusion (RRF) is better, but this suffices for demonstration
        results_list = list(merged_results.values())
        for res in results_list:
            res["hybrid_score"] = (res["vector_score"] * 1.0) + (res["bm25_score"] * 0.1)
            
        # 4. Sort and return Top K
        sorted_results = sorted(results_list, key=lambda x: x["hybrid_score"], reverse=True)
        return sorted_results[:top_k]
