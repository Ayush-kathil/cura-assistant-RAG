import fitz  # PyMuPDF
from docx import Document as DocxDocument
import io

class DocumentParser:
    @staticmethod
    def parse_pdf(file_bytes: bytes, filename: str) -> list[dict]:
        """
        Parses a PDF file and preserves page numbers and text.
        Returns a list of dicts containing text and metadata per page.
        """
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            
            # Very basic section detection (heuristics based on font could be added later)
            pages.append({
                "text": text,
                "metadata": {
                    "document_name": filename,
                    "page_number": str(page_num + 1),
                    "section": "General"  # Enhanced section detection can be added
                }
            })
        return pages

    @staticmethod
    def parse_docx(file_bytes: bytes, filename: str) -> list[dict]:
        """
        Parses a DOCX file and attempts to preserve headings and paragraphs.
        Returns a list of dicts representing sections.
        """
        doc = DocxDocument(io.BytesIO(file_bytes))
        sections = []
        
        current_section = "General"
        current_text = []
        
        for para in doc.paragraphs:
            if para.style.name.startswith('Heading'):
                if current_text:
                    sections.append({
                        "text": "\n".join(current_text),
                        "metadata": {
                            "document_name": filename,
                            "page_number": "N/A",
                            "section": current_section
                        }
                    })
                    current_text = []
                current_section = para.text.strip()
            elif para.text.strip():
                current_text.append(para.text.strip())
                
        # Append the last section
        if current_text:
            sections.append({
                "text": "\n".join(current_text),
                "metadata": {
                    "document_name": filename,
                    "page_number": "N/A",
                    "section": current_section
                }
            })
            
        return sections
