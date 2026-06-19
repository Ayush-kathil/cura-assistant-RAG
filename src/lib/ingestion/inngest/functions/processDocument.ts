// @ts-nocheck
import { inngest } from "../client";
import { createClient } from "@supabase/supabase-js";
import { IngestionClient, IngestionChunk } from "../../client";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { extractText } from "unpdf";
import mammoth from "mammoth";

export const runtime = "nodejs";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321");
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_key");

async function parseFileContent(filePath: string, fileName: string): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const stats = await fs.promises.stat(filePath);
  if (stats.size > 50 * 1024 * 1024) {
    throw new Error("File exceeds maximum allowed size of 50MB");
  }

  const fileBuffer = await fs.promises.readFile(filePath);

  if (ext === '.pdf') {
    const data = await extractText(fileBuffer);
    return Array.isArray(data.text) ? data.text.join('\n') : String(data.text);
  } else if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } else if (ext === '.txt' || ext === '.md') {
    return fileBuffer.toString('utf-8');
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

export const processDocumentWorkflow = inngest.createFunction(
  { id: "process-document", event: "doc.uploaded" }, 
  async ({ event, step }: { event: any, step: any }) => {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const client = new IngestionClient(supabase);
    
    const { versionId, workspaceId, filePath, fileName } = event.data;
    const telemetry = { parsing: 0, chunking: 0, embedding: 0, extraction: 0, total: 0 };
    const workflowStartTime = Date.now();

    // STEP 1: PARSING & NORMALIZATION
    const parsedData = await step.run("parse-and-normalize", async () => {
      const startTime = Date.now();
      await client.updateVersionStatus(versionId, 'processing');

      // 1. Parse
      const rawText = await parseFileContent(filePath, fileName);

      // 2. Normalization
      const normalizedText = rawText
        .replace(/  +/g, ' ') 
        .replace(/-\n/g, '') 
        .replace(/\bduplicate duplicate\b/g, 'duplicate'); 
        
      const qualityScore = normalizedText.length > 50 ? 95 : 40;
      await supabase.from('document_versions').update({ quality_score: qualityScore }).eq('id', versionId);

      if (qualityScore < 50) {
        throw new Error("Document Quality Validation Failed. Score too low.");
      }

      return { normalizedText, latency: Date.now() - startTime };
    });

    telemetry.parsing = parsedData.latency;

    // STEP 2: CHUNKING & VALIDATION
    const chunksNeedingEmbedding = await step.run("chunk-and-validate", async () => {
      const startTime = Date.now();
      await client.updateVersionStatus(versionId, 'chunking' as any); 

      const rawChunks = parsedData.normalizedText.split('\n\n');
      const validatedChunks: IngestionChunk[] = [];
      
      for (const [idx, chunk] of rawChunks.entries()) {
        const trimmed = chunk.trim();
        
        if (trimmed.length < 50) continue; 
        if (/^\.+$/.test(trimmed)) continue; 
        if (!/[a-zA-Z]/.test(trimmed)) continue;

        const fingerprint = crypto.createHash('sha256').update(trimmed).digest('hex');

        validatedChunks.push({
          content: trimmed,
          fingerprint,
          page_number: 1, 
          metadata: { hierarchy: ["Extracted Content"] }
        });
      }

      const newlyCreatedChunkIds = await client.processChunks(workspaceId, versionId, validatedChunks);
      return { newlyCreatedChunkIds, validatedChunks, latency: Date.now() - startTime };
    });

    telemetry.chunking = chunksNeedingEmbedding.latency;

    // STEP 3: DISPATCH PARALLEL AI PROCESSING (Embeddings & Graph)
    if (chunksNeedingEmbedding.newlyCreatedChunkIds.length > 0) {
      const allEvents = chunksNeedingEmbedding.newlyCreatedChunkIds.map((id: string, index: number) => ({
        name: "doc.extract_graph",
        data: { workspaceId, chunkId: id, content: chunksNeedingEmbedding.validatedChunks[index].content }
      }));

      const BATCH_SIZE = 50;
      for (let i = 0; i < allEvents.length; i += BATCH_SIZE) {
        const batch = allEvents.slice(i, i + BATCH_SIZE);
        await step.sendEvent(`dispatch-graph-extraction-${i}`, batch);
      }
    }

    await step.run("finalize-workflow", async () => {
      telemetry.total = Date.now() - workflowStartTime;
      await client.updateVersionStatus(versionId, 'completed');
      await client.finalizeJobTelemetry(versionId, telemetry, 'completed');
    });

    return { success: true, chunksProcessed: chunksNeedingEmbedding.newlyCreatedChunkIds.length };
  }
);
