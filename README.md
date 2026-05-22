# Cura | Premium RAG Assistant

Cura is an elite-tier, client-side Retrieval-Augmented Generation (RAG) chatbot built with **Next.js 16**, **Tailwind CSS v4**, and **Framer Motion**. It provides a fully private, highly interactive workspace for querying your documents (PDFs and TXTs) using the advanced capabilities of the **Google Gemini API**.

## 🌟 Key Features & UI/UX

*   **Split-Pane Workspace:** A resizable, drag-to-adjust dual-pane layout allowing simultaneous viewing of your chat and the raw source document.
*   **"Antigravity" Aesthetics:** Deep dark mode featuring dynamic, physically simulated mesh gradients that pulse and shift based on the AI's internal state (Idle, Scanning, Synthesizing).
*   **Persistent Sessions:** All chat histories and vector embeddings are securely stored locally via `localStorage`, ensuring data privacy and session continuity across reloads.
*   **Interactive Source Citations:** AI responses include inline citation pills (e.g., `[Chunk 1]`). Hovering or clicking these glowing pills automatically scrolls and highlights the exact reference text in the right-hand Document Viewer.
*   **Floating Action Menu:** Highlight any text inside the chat or document to instantly spawn a contextual toolbar offering quick actions: **Summarize**, **Explain**, or **Rewrite**.
*   **Multi-Step Thinking Indicators:** Animated, descriptive status sequences (`Rewriting Query...` → `Scanning Vectors...` → `Synthesizing...`) replace standard loading spinners.
*   **Mobile-First Fluidity:** A fully responsive design where the sidebar converts into a glassmorphic bottom sheet and elements intelligently scale for optimal touch targets.

## 🧠 Advanced RAG Architecture (The Pipeline)

Cura bypasses traditional, simplistic retrieval pipelines by integrating an advanced, multi-step orchestration flow:

1.  **Ingestion & Chunking:**
    *   Upload a PDF or TXT file entirely in the browser (powered dynamically by `pdfjs-dist`).
    *   The text is chunked using an overlapping sliding window algorithm (e.g., 1000 characters with 200 character overlap).
    *   Each chunk is embedded using the highly accurate `gemini-embedding-2` model and stored in an in-memory vector database alongside the chunk index metadata.

2.  **Contextual Query Reformulation:**
    *   Before performing vector search, the user's raw input is intercepted. 
    *   If chat history exists, a fast call is made to `gemini-2.5-flash` to rewrite the user's query into a **standalone, highly descriptive search string** that encompasses all preceding conversational context (e.g., "Tell me more about it" → "Tell me more about the remote work policy mentioned earlier").

3.  **Semantic Retrieval & Thresholding:**
    *   The reformulated query is embedded, and Cosine Similarity scoring is applied against the document vectors.
    *   **Hallucination Prevention (Strict Fallback):** If the highest-scoring chunk falls below a strict confidence threshold (e.g., `0.70`), the generation phase is aborted cleanly. The AI will state it cannot find the answer in the text, mathematically preventing hallucinations.

4.  **Synthesis & Citation Injection:**
    *   The top highly-scored chunks are injected into the context window along with strict citation instructions.
    *   `gemini-2.5-flash` streams the final response back to the UI, strictly enforcing the inclusion of chunk markers (e.g., `[Chunk 2]`) whenever referenced data is utilized.

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   A Google Gemini API Key (get one from [Google AI Studio](https://aistudio.google.com/))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Ayush-kathil/cura-assistant-RAG.git
    cd cura-assistant-RAG
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables (Optional):**
    You can securely provide your API key via the interactive modal in the browser, or create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Access the app:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Tech Stack
*   **Framework:** Next.js 16 (App Router, Turbopack)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4
*   **Animations:** Framer Motion
*   **AI / LLM:** `@google/generative-ai` (Gemini 2.5 Flash, Gemini Embeddings 2)
*   **Icons:** Lucide React
*   **Markdown Parsing:** React-Markdown

## 🔒 Privacy Notice
This architecture operates completely independently of external databases. All document parsing, vector storage, and chat history persistence occur locally on your machine within your browser's execution context. Only the embedding arrays and generative prompts are sent directly to the official Google Generative Language API.
