import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";


// Environment variable config (Server-side ONLY)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json();
    if (!documentId) return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
    if (!GEMINI_API_KEY) return NextResponse.json({ error: "Missing Gemini API Key on server" }, { status: 500 });

    const supabase = await createClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch document metadata
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();
      
    if (docError || !doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    // Download file
    // Nexus_docs bucket contains user_id/filename. Wait, doc.storage_path is full path inside bucket
    let bucketName = "nexus_docs"; // try nexus_docs first
    let { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(doc.storage_path);

    if (downloadError) {
        // Fallback to documents bucket
        bucketName = "documents";
        const res = await supabase.storage.from(bucketName).download(doc.storage_path);
        if (res.error) throw res.error;
        fileData = res.data;
    }

    if (!fileData) return NextResponse.json({ error: "Failed to download file" }, { status: 500 });

    // Extract text
    const buffer = Buffer.from(await fileData.arrayBuffer());
    let fullText = "";
    
    if (doc.file_name.toLowerCase().endsWith(".pdf")) {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      // Disable worker for Node.js environment
      pdfjsLib.GlobalWorkerOptions.workerSrc = "";
      
      const uint8Array = new Uint8Array(buffer);
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array, standardFontDataUrl: `node_modules/pdfjs-dist/standard_fonts/` });
      const pdf = await loadingTask.promise;
      
      for (let i = 1; i <= pdf.numPages; i++) {
         const page = await pdf.getPage(i);
         const textContent = await page.getTextContent();
         fullText += textContent.items.map((item: any) => item.str + (item.hasEOL ? '\n' : '')).join("") + "\n";
      }
    } else {
      fullText = buffer.toString("utf-8"); // Assume text or markdown
    }

    if (!fullText.trim()) {
      return NextResponse.json({ error: "Empty document or extraction failed" }, { status: 400 });
    }

    // Semantic Chunking: Preserve paragraphs, chunk size 600
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 600,
      chunkOverlap: 100,
      separators: ["\n\n", "\n", ".", " ", ""],
    });

    const chunks = await splitter.splitText(fullText);

    // Embeddings
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    // Batch process to avoid payload too large
    const BATCH_SIZE = 50;
    const dbRows = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, i + BATCH_SIZE);
      const batchRequests = batchChunks.map(text => ({
        content: { role: 'user', parts: [{ text }] }
      }));
      
      const result = await embeddingModel.batchEmbedContents({
        requests: batchRequests
      });

      const embeddings = result.embeddings;

      for (let j = 0; j < batchChunks.length; j++) {
        dbRows.push({
          document_id: documentId,
          content: batchChunks[j],
          metadata: { chunk_index: i + j, source: doc.file_name },
          embedding: embeddings[j].values,
        });
      }
    }

    // Store in pgvector
    const { error: insertError } = await supabase
      .from("document_chunks")
      .insert(dbRows);

    if (insertError) throw insertError;

    // Update document status
    await supabase.from("documents").update({ vector_status: 'completed' }).eq("id", documentId);

    return NextResponse.json({ success: true, chunksProcessed: chunks.length });

  } catch (error: any) {
    console.error("Ingestion error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
