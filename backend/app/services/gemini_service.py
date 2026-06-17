import google.generativeai as genai
import os
from typing import List

class GeminiService:
    def __init__(self, api_key: str = None):
        key = api_key or os.environ.get("GEMINI_API_KEY")
        if not key:
            raise ValueError("Gemini API key is required.")
        genai.configure(api_key=key)
        
        self.system_prompt = """You are a document assistant.
Answer ONLY using the provided context.
If information is not found in the retrieved documents, say:
'I could not find this information in the uploaded documents.'
Do not hallucinate.
Always cite:
- document name
- page number
- section"""

        # Primary model with fallback
        self.primary_model = "gemini-2.5-flash"
        self.fallback_model = "gemini-2.5-pro"

    def generate_answer(self, query: str, context_docs: List[dict]) -> str:
        """
        Takes the user query and the completely assembled, reranked context documents,
        and generates the final response via Gemini.
        """
        context_str = self._assemble_context(context_docs)
        
        full_prompt = f"CONTEXT:\n{context_str}\n\nUSER QUERY: {query}"
        
        try:
            model = genai.GenerativeModel(
                model_name=self.primary_model,
                system_instruction=self.system_prompt
            )
            response = model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            print(f"Primary model {self.primary_model} failed: {e}. Trying fallback...")
            try:
                model = genai.GenerativeModel(
                    model_name=self.fallback_model,
                    system_instruction=self.system_prompt
                )
                response = model.generate_content(full_prompt)
                return response.text
            except Exception as e2:
                print(f"Fallback model failed: {e2}")
                return "Error: Could not generate response due to API failures."

    def _assemble_context(self, docs: List[dict]) -> str:
        context_parts = []
        for i, doc in enumerate(docs):
            meta = doc.get("metadata", {})
            doc_name = meta.get("document_name", "Unknown")
            page_num = meta.get("page_number", "N/A")
            section = meta.get("section", "General")
            text = doc.get("text", "").strip()
            
            chunk_header = f"[Source: {doc_name} | Page: {page_num} | Section: {section}]"
            context_parts.append(f"{chunk_header}\n{text}\n")
            
        return "\n".join(context_parts)
