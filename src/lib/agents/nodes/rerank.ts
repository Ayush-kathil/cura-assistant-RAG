import { AgentState } from "../graph";
import { geminiRerank } from "../../rag/retrieval/geminiRerank";
import { retrievalTelemetry } from "../../rag/metrics/telemetry";
import { createClient } from "@supabase/supabase-js";

// In production, instantiate this properly with env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function rerankNode(state: AgentState): Promise<Partial<AgentState>> {
  const startTime = Date.now();
  console.log(`[Rerank] Reranking ${state.retrievedChunks.length} chunks.`);

  try {
    const topK = 5; // We only want the most highly relevant chunks to fit in the context window
    let rerankedChunks = await geminiRerank(
      state.query,
      state.retrievedChunks
    );
    rerankedChunks = rerankedChunks.slice(0, topK);

    const latency = Date.now() - startTime;
    console.log(`[Rerank] Reranking complete. Kept ${rerankedChunks.length} chunks. Latency: ${latency}ms`);

    // Log telemetry (fire and forget)
    // Here we have both vector latency from previous node and rerank latency
    const vectorLatency = state.latencies['retrieve'] || 0;
    retrievalTelemetry.log(supabase, {
      workspaceId: state.workspaceId,
      sessionId: state.sessionId,
      query: state.query,
      queryVariants: [], // Ideally passed from state, omitting for brevity
      vectorLatencyMs: vectorLatency,
      rerankLatencyMs: latency,
      totalLatencyMs: vectorLatency + latency,
      chunksRetrieved: state.retrievedChunks.length,
      chunksPostRerank: rerankedChunks.length
    });

    return {
      retrievedChunks: rerankedChunks, // Overwrite with compressed context
      latencies: { ...state.latencies, rerank: latency }
    };
  } catch (error) {
    console.error("[Rerank] Reranking failed:", error);
    // If reranking fails, just return top K chunks sorted by their original RRF score
    return {
      retrievedChunks: state.retrievedChunks.slice(0, 5),
      latencies: { ...state.latencies, rerank: Date.now() - startTime }
    };
  }
}
