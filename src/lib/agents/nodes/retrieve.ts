import { AgentState } from "../graph";
import { multiQueryGenerator } from "../../rag/retrieval/multiQuery";
import { hybridSearchEngine } from "../../rag/retrieval/hybridSearch";
import { createClient } from "@supabase/supabase-js";

// In production, instantiate this properly with env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function retrieveNode(state: AgentState): Promise<Partial<AgentState>> {
  const startTime = Date.now();
  console.log(`[Retrieve] Starting multi-query retrieval for workspace: ${state.workspaceId}`);
  
  try {
    // 1. Generate Variants
    const queryVariants = await multiQueryGenerator.generateVariants(state.query);
    console.log(`[Retrieve] Generated variants:`, queryVariants);

    // 2. Execute Hybrid Search
    const retrievedChunks = await hybridSearchEngine.searchMultiQuery(
      supabase,
      state.workspaceId,
      queryVariants,
      10 // Get top 10 per variant
    );

    const latency = Date.now() - startTime;
    console.log(`[Retrieve] Retrieved ${retrievedChunks.length} unique chunks. Latency: ${latency}ms`);

    return {
      retrievedChunks,
      latencies: { ...state.latencies, retrieve: latency }
    };
  } catch (error) {
    console.error("[Retrieve] Retrieval failed:", error);
    return {
      retrievedChunks: [],
      latencies: { ...state.latencies, retrieve: Date.now() - startTime }
    };
  }
}
