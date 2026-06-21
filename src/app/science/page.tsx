import Link from "next/link";

export default function SciencePage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <nav className="fixed top-0 w-full z-50 flex items-center px-8 md:px-16 bg-black py-4">
        <Link href="/" className="flex items-center gap-3">
          <img src="/bot.jpg" alt="Cura Logo" className="w-8 h-8 rounded-full object-cover border-2 border-white/20" />
          <span className="font-bold text-xl tracking-tighter text-white uppercase">Cura</span>
        </Link>
      </nav>

      <main className="pt-32 pb-24 px-8 md:px-16 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6">The Science Behind Cura</h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-16">
          Understanding our Retrieval-Augmented Generation (RAG) Architecture and how it processes your cognitive data to deliver unparalleled emotional support.
        </p>

        <section className="mb-20">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 border-b border-black pb-2">The Architecture</h2>
          <p className="text-lg text-gray-800 leading-relaxed mb-8">
            Cura utilizes an advanced Retrieval-Augmented Generation (RAG) pipeline to ingest clinical literature and user context. 
            This ensures that our AI doesn't hallucinate responses, but instead draws upon verified, embedded knowledge stored securely in our database.
          </p>

          <div className="bg-gray-50 p-8 border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
            {/* Using a pre-rendered SVG/HTML for Mermaid to avoid needing client-side rendering libraries if not installed, or using standard text representation */}
            <pre className="mermaid font-mono text-sm leading-tight text-center">
{`graph TD
    %% Define Styles
    classDef user fill:#000,stroke:#000,stroke-width:2px,color:#fff,rx:8px,ry:8px
    classDef process fill:#f3f3f3,stroke:#000,stroke-width:2px,color:#000,rx:8px,ry:8px
    classDef database fill:#fff,stroke:#000,stroke-width:2px,stroke-dasharray: 5 5,color:#000,rx:8px,ry:8px
    
    A[User Uploads PDF / Chat Context]:::user -->|Raw Data| B(Text Extraction Engine):::process
    B -->|Cleaned Text| C(Chunking Module):::process
    C -->|Text Chunks| D{Embedding Model}:::process
    D -->|Vector Embeddings| E[(Supabase Vector DB)]:::database
    
    F[User Query]:::user -->|Query Text| G{Query Embedder}:::process
    G -->|Query Vector| E
    E -->|Similarity Search| H(Context Retrieval):::process
    H -->|Top-K Context + Query| I[Large Language Model]:::process
    I -->|Synthesized Clinical Response| J[User Interface]:::user`}
            </pre>
            <p className="text-sm text-gray-500 mt-6 text-center italic">Figure 1: Cura's RAG Architecture Pipeline</p>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold uppercase tracking-wider mb-8 border-b border-black pb-2">Step-by-Step Execution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold uppercase tracking-wider mb-2">1. Data Ingestion</h3>
              <p className="text-gray-700 leading-relaxed">
                When cognitive behavioral therapy (CBT) manuals or user diaries are uploaded, the Text Extraction Engine parses the raw data into clean text, stripping out noise and formatting.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-wider mb-2">2. Chunking & Embedding</h3>
              <p className="text-gray-700 leading-relaxed">
                The text is split into semantic chunks. These chunks are passed through an Embedding Model which translates human language into dense mathematical vectors representing the underlying semantic meaning.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-wider mb-2">3. Vector Storage</h3>
              <p className="text-gray-700 leading-relaxed">
                We store these vectors in Supabase pgvector. This allows for lightning-fast similarity searches across millions of tokens of psychological literature in milliseconds.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-wider mb-2">4. Contextual Generation</h3>
              <p className="text-gray-700 leading-relaxed">
                When a user asks a question, their query is embedded and matched against the database. The most relevant chunks are injected into the LLM's prompt, ensuring the final response is highly accurate and clinically sound.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center mt-16">
          <Link href="/login" className="px-10 py-5 bg-black text-white text-lg font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors rounded-full">
            Experience the Engine
          </Link>
        </div>
      </main>

      {/* Script to load Mermaid.js dynamically */}
      <script type="module" dangerouslySetInnerHTML={{
        __html: `
          import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
          mermaid.initialize({ startOnLoad: true, theme: 'base', themeVariables: { primaryColor: '#ffffff', primaryTextColor: '#000000', primaryBorderColor: '#000000', lineColor: '#000000' } });
        `
      }} />
    </div>
  );
}
