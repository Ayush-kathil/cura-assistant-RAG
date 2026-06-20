import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";


// Environment variable config (Server-side ONLY)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { documentId, workspaceId } = await req.json();
    console.log("[INGEST REQUEST]", {
      documentId,
      workspaceId
    });
    if (!documentId) return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
    if (!workspaceId) return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
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
      .eq("workspace_id", workspaceId)
      .single();
      
    console.log("[DOCUMENT FETCH RESULT]", doc);
    if (docError || !doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    // Initialize telemetry job
    let documentVersionId = doc.current_version_id;
    if (!documentVersionId) {
      const { data: ver } = await supabase.from('document_versions').select('id').eq('document_id', documentId).order('created_at', { ascending: false }).limit(1).single();
      if (ver) documentVersionId = ver.id;
    }
    console.log("[DOCUMENT VERSION ID]", documentVersionId);
    if (documentVersionId) {
      const { error: jobError } = await supabase.from('ingestion_jobs').insert({ document_version_id: documentVersionId, status: 'running' });
      if (jobError) throw jobError;
    }

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
      if (documentVersionId) await supabase.from('ingestion_jobs').update({ status: 'failed' }).eq('document_version_id', documentVersionId);
      return NextResponse.json({ error: "Empty document or extraction failed" }, { status: 400 });
    }

    // Semantic Chunking: Preserve paragraphs, chunk size 600
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 600,
      chunkOverlap: 100,
      separators: ["\n\n", "\n", ".", " ", ""],
    });

    const chunks = await splitter.splitText(fullText);
    console.log("[CHUNK COUNT]", chunks.length);
    console.log("[FIRST CHUNK PREVIEW]", chunks[0]?.substring(0,200));

    // Embeddings
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    
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
      console.log("[EMBEDDINGS COUNT]", embeddings.length);

      for (let j = 0; j < batchChunks.length; j++) {
        dbRows.push({
          document_id: documentId,
          workspace_id: workspaceId,
          content: batchChunks[j],
          metadata: { chunk_index: i + j, source: doc.file_name },
          embedding: embeddings[j].values,
        });
      }
    }

    // Store in pgvector
    console.log("[FIRST DB ROW]", JSON.stringify(dbRows[0], null, 2));
    console.log("[INSERTING CHUNKS]", dbRows.length);
    const { error: insertError } = await supabase
      .from("document_chunks")
      .insert(dbRows);

    if (insertError) {
      console.error(
        "[DOCUMENT_CHUNKS INSERT ERROR FULL]",
        JSON.stringify(insertError, null, 2)
      );
      if (documentVersionId) await supabase.from('ingestion_jobs').update({ status: 'failed', error_message: insertError.message }).eq('document_version_id', documentVersionId);
      throw insertError;
    }

    // Update document status
    await supabase.from("documents").update({ vector_status: 'completed' }).eq("id", documentId);
    if (documentVersionId) {
      await supabase.from('ingestion_jobs').update({ status: 'completed' }).eq('document_version_id', documentVersionId);
    }

    // Trigger graph extraction in the background via Inngest
    try {
      const { inngest } = await import('@/lib/ingestion/inngest/client');
      await inngest.send({
        name: "doc.extract_graph",
        data: {
          documentId: documentId,
          workspaceId: workspaceId
        }
      });
    } catch (e) {
      console.error("Failed to trigger Inngest graph extraction:", e);
    }

    return NextResponse.json({ success: true, chunksProcessed: chunks.length });

  } catch (error) {
    console.error(
      "[INGEST FATAL ERROR FULL]",
      error,
      JSON.stringify(error, null, 2)
    );
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
