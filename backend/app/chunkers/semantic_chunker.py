import re
from typing import List
from datetime import datetime
import uuid
from app.models.schemas import Chunk, DocumentMetadata

class SemanticChunker:
    def __init__(self, target_tokens: int = 400, overlap_tokens: int = 50):
        # Approximating 1 token ~ 4 characters
        self.target_chars = target_tokens * 4
        self.overlap_chars = overlap_tokens * 4

    def chunk_document(self, parsed_pages: List[dict]) -> List[Chunk]:
        """
        Takes parsed pages/sections and chunks them based on paragraph and sentence boundaries.
        """
        chunks = []
        
        for page in parsed_pages:
            text = page.get("text", "")
            metadata = page.get("metadata", {})
            
            # 1. Split into paragraphs
            paragraphs = re.split(r'\n\s*\n', text)
            
            current_chunk_text = ""
            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue
                
                # If adding the next paragraph exceeds target, flush the current chunk
                if len(current_chunk_text) + len(para) > self.target_chars and current_chunk_text:
                    chunks.append(self._create_chunk(current_chunk_text, metadata))
                    
                    # Keep overlap from the end of the current_chunk_text
                    # Find the last sentence boundary within the overlap threshold
                    sentences = re.split(r'(?<=[.!?])\s+', current_chunk_text)
                    overlap_text = ""
                    for sent in reversed(sentences):
                        if len(overlap_text) + len(sent) <= self.overlap_chars:
                            overlap_text = sent + " " + overlap_text
                        else:
                            break
                    current_chunk_text = overlap_text.strip() + " " + para
                else:
                    current_chunk_text += ("\n\n" if current_chunk_text else "") + para
            
            # Flush remaining text
            if current_chunk_text:
                chunks.append(self._create_chunk(current_chunk_text, metadata))
                
        return chunks

    def _create_chunk(self, text: str, metadata_dict: dict) -> Chunk:
        chunk_id = str(uuid.uuid4())
        meta = DocumentMetadata(
            document_name=metadata_dict.get("document_name", "Unknown"),
            page_number=metadata_dict.get("page_number", "N/A"),
            section=metadata_dict.get("section", "General"),
            chunk_id=chunk_id,
            upload_time=datetime.utcnow().isoformat()
        )
        return Chunk(id=chunk_id, text=text, metadata=meta)
