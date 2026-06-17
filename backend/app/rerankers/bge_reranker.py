from sentence_transformers import CrossEncoder
from typing import List

class BGEReranker:
    _instance = None

    def __new__(cls, model_name: str = "BAAI/bge-reranker-large"):
        if cls._instance is None:
            cls._instance = super(BGEReranker, cls).__new__(cls)
            print(f"Loading local reranking model: {model_name}...")
            cls._instance.model = CrossEncoder(model_name, max_length=512)
        return cls._instance

    def rerank(self, query: str, documents: List[dict], top_k: int = 5) -> List[dict]:
        """
        Reranks a list of documents (dictionaries containing 'text') against the query.
        """
        if not documents:
            return []
            
        pairs = [[query, doc["text"]] for doc in documents]
        
        # Calculate scores
        scores = self.model.predict(pairs)
        
        # Zip documents with scores
        for i, doc in enumerate(documents):
            doc["rerank_score"] = float(scores[i])
            
        # Sort by descending score
        reranked_docs = sorted(documents, key=lambda x: x["rerank_score"], reverse=True)
        
        # Return top K
        return reranked_docs[:top_k]
