from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np

class LocalEmbedder:
    _instance = None

    def __new__(cls, model_name: str = "BAAI/bge-m3"):
        if cls._instance is None:
            cls._instance = super(LocalEmbedder, cls).__new__(cls)
            print(f"Loading local embedding model: {model_name}...")
            # Lazy load the model on first instantiation
            cls._instance.model = SentenceTransformer(model_name)
        return cls._instance

    def embed_text(self, text: str) -> List[float]:
        """Embeds a single string into a vector."""
        embedding = self.model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embeds a batch of strings."""
        if not texts:
            return []
        embeddings = self.model.encode(texts, normalize_embeddings=True, batch_size=32)
        return [emb.tolist() for emb in embeddings]
