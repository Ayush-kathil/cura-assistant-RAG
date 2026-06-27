import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const maxDuration = 60; // Set max duration to 60 seconds (Vercel max for Hobby)

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
      console.log("[MULTI-MODAL PARSING] Analyzing PDF with Gemini Vision...");
      const extractionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const b64Data = buffer.toString("base64");
      
      const prompt = `You are a highly precise document extraction AI. Extract the content of the attached PDF document perfectly into Markdown. 
Rules:
1. Preserve all text verbatim. Do not summarize.
2. If there are tables, format them perfectly using Markdown tables.
3. If there are images, charts, or graphs, write a detailed textual description of what they show enclosed in brackets like this: [IMAGE: A bar chart showing...].
4. Ignore repetitive headers/footers (like page numbers) if they interrupt the flow of the text.
5. Output nothing but the markdown content. Do not add conversational intro/outro text.`;

      const result = await extractionModel.generateContent([
        {
          inlineData: {
            data: b64Data,
            mimeType: "application/pdf"
          }
        },
        prompt
      ]);
      
      fullText = result.response.text();
      console.log("[MULTI-MODAL PARSING] Completed successfully. Extracted length:", fullText.length);
    } else {
      fullText = buffer.toString("utf-8"); // Assume text or markdown
    }

    if (!fullText.trim()) {
      if (documentVersionId) await supabase.from('ingestion_jobs').update({ status: 'failed' }).eq('document_version_id', documentVersionId);
      return NextResponse.json({ error: "Empty document or extraction failed" }, { status: 400 });
    }

    // Semantic Boundary Chunking: Prioritize markdown headers and paragraphs
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 300,
      separators: ["\n# ", "\n## ", "\n### ", "\n\n\n", "\n\n", "\n", ". ", " ", ""],
    });

    const chunks = await splitter.splitText(fullText);
    console.log("[CHUNK COUNT]", chunks.length);
    console.log("[FIRST CHUNK PREVIEW]", chunks[0]?.substring(0,200));

    // GraphRAG Entity Extraction
    console.log("[ENTITY EXTRACTION] Extracting GraphRAG entities...");
    let entities: string[] = [];
    try {
      const entityModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const entityPrompt = `Extract key entities (People, Organizations, Locations, Technical Concepts) from the following text. Return them as a simple comma-separated list of highly relevant keywords. Max 15 entities. Do not add any introductory or formatting text, just the comma-separated list.
Text: ${fullText.substring(0, 15000)}`;
      
      const entityResult = await entityModel.generateContent(entityPrompt);
      const entityText = entityResult.response.text().trim();
      entities = entityText.split(',').map(e => e.trim()).filter(e => e.length > 0);
      console.log("[ENTITY EXTRACTION] Extracted entities:", entities.join(", "));
    } catch (e) {
      console.warn("[ENTITY EXTRACTION] Failed to extract entities, continuing without them", e);
    }

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
      console.log("[EMBEDDINGS COUNT]", embeddings.length);

      for (let j = 0; j < batchChunks.length; j++) {
        let embeddingValues = embeddings[j].values;
        if (embeddingValues.length > 768) {
          embeddingValues = embeddingValues.slice(0, 768);
          const magnitude = Math.sqrt(embeddingValues.reduce((sum, val) => sum + val * val, 0));
          if (magnitude > 0) {
            embeddingValues = embeddingValues.map(val => val / magnitude);
          }
        } else if (embeddingValues.length < 768) {
          const padded = new Array(768).fill(0);
          for (let k = 0; k < embeddingValues.length; k++) {
            padded[k] = embeddingValues[k];
          }
          embeddingValues = padded;
        }
        
        dbRows.push({
          document_id: documentId,
          workspace_id: workspaceId,
          content: batchChunks[j],
          metadata: { chunk_index: i + j, source: doc.file_name, entities },
          embedding: embeddingValues,
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

  } catch (error: any) {
    console.error(
      "[INGEST FATAL ERROR FULL]",
      error,
      error instanceof Error ? error.message : JSON.stringify(error, null, 2)
    );
    
    // Safely attempt to fail the job if documentId is present
    try {
      const supabase = await createClient();
      const body = await req.clone().json().catch(() => ({}));
      if (body.documentId) {
        const { data: ver } = await supabase.from('document_versions').select('id').eq('document_id', body.documentId).order('created_at', { ascending: false }).limit(1).single();
        if (ver) {
          await supabase.from('ingestion_jobs').update({ status: 'failed', error_message: error.message || 'Unknown fatal error' }).eq('document_version_id', ver.id);
        }
      }
    } catch (e) {
      console.error("Failed to update ingestion job status during fatal error", e);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : (typeof error === 'object' ? JSON.stringify(error) : String(error)) },
      { status: 500 }
    );
  }
}
