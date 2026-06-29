// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { geminiRerank } from "./geminiRerank";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321", 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy_key"
);

function getLLM() {
  return new ChatGoogleGenerativeAI({ 
    model: "gemini-3.1-flash-lite", 
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "dummy",
  });
}

export async function hybridGraphSearch(workspaceId: string, query: string, queryEmbedding: number[], targetDocumentId?: string) {
  const llm = getLLM();
  const entityDetectionPrompt = `Extract key entities (people, organizations, concepts, technologies) from the following query as a comma separated list. If none, output NONE.\nQuery: "${query}"`;
  const entitiesResult = await llm.invoke(entityDetectionPrompt);
  const rawEntities = entitiesResult.content.toString().trim() !== "NONE" ? entitiesResult.content.toString().split(',').map(e => e.trim()) : [];

  let graphChunks: any[] = [];

  if (rawEntities.length > 0) {
    const { data: traversalResults, error } = await supabase.rpc('traverse_graph', {
      p_workspace_id: workspaceId,
      p_entities: rawEntities,
      p_max_hops: 2,
      p_limit: 10
    });

    if (!error && traversalResults) {
       graphChunks = traversalResults;
    }
  }

  const { data: vectorResults } = await supabase.rpc('hybrid_search_chunks', {
    target_workspace_id: workspaceId,
    query_embedding: queryEmbedding,
    query_text: query,
    target_document_id: targetDocumentId || null,
    match_count: 20
  });
  
  const mergedMap = new Map();
  const k = 50;
  
  vectorResults?.forEach((res: any, index: number) => {
    // Time-Weighted Decay Factor
    let decayFactor = 1.0;
    if (res.created_at) {
      const ageInDays = (Date.now() - new Date(res.created_at).getTime()) / (1000 * 60 * 60 * 24);
      decayFactor = Math.exp(-0.005 * ageInDays); // Slow decay factor
    }
    
    mergedMap.set(res.id, {
      ...res,
      final_score: (res.similarity * 0.6) * decayFactor
    });
  });

  graphChunks.forEach((gChunk: any, index: number) => {
    const existing = mergedMap.get(gChunk.chunk_id);
    const graphRrf = 0.4 / (k + index + 1); 
    
    if (existing) {
      existing.final_score += graphRrf * gChunk.graph_score; 
    } else {
      mergedMap.set(gChunk.chunk_id, {
        id: gChunk.chunk_id,
        content: `Graph recovered chunk ${gChunk.chunk_id}`, 
        final_score: graphRrf * gChunk.graph_score
      });
    }
  });

  const finalResults = Array.from(mergedMap.values())
    .sort((a, b) => b.final_score - a.final_score)
    .slice(0, 10);

  // 4. GEMINI RERANKING
  if (finalResults.length > 0) {
    const rerankedChunks = await geminiRerank(query, finalResults);
    return rerankedChunks.slice(0, 5);
  }

  return finalResults;
}
