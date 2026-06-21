import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321", 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key"
);

export async function logRetrievalTrace(data: {
  query: string;
  workspaceId: string;
  selectedDocuments?: string[];
  retrievedChunks: any[];
  generation: string;
  latencyMs: number;
  verificationResult?: any;
}) {
  try {
    await supabase.from("retrieval_logs").insert({
      query: data.query,
      workspace_id: data.workspaceId,
      selected_documents: data.selectedDocuments || [],
      retrieved_chunks: data.retrievedChunks,
      generation: data.generation,
      latency_ms: data.latencyMs,
      verification_result: data.verificationResult,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to log retrieval trace:", error);
  }
}
