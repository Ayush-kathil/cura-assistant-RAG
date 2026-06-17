FROM python:3.11-slim

# Install system dependencies required for PyMuPDF and others
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    libmupdf-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the HuggingFace models during build so the container starts fast
RUN python -c "from sentence_transformers import SentenceTransformer, CrossEncoder; SentenceTransformer('BAAI/bge-m3'); CrossEncoder('BAAI/bge-reranker-large')"

# Copy application code
COPY . .

# Expose the port
EXPOSE 8000

# Start FastAPI application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
