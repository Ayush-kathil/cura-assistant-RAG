import { createClient } from "@supabase/supabase-js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { CohereClient } from "cohere-ai";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const llm = new ChatGoogleGenerativeAI({ modelName: "gemini-1.5-flash", temperature: 0 });
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY! });

export async function hybridGraphSearch(workspaceId: string, query: string, queryEmbedding: number[]) {
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
    match_count: 20
  });
  
  const mergedMap = new Map();
  const k = 50;
  
  vectorResults?.forEach((res: any, index: number) => {
    mergedMap.set(res.id, {
      ...res,
      final_score: res.similarity * 0.6 
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
        content: `Graph recovered chunk ${gChunk.chunk_id}`, // In prod, batch fetch content
        final_score: graphRrf * gChunk.graph_score
      });
    }
  });

  const finalResults = Array.from(mergedMap.values())
    .sort((a, b) => b.final_score - a.final_score)
    .slice(0, 10);

  // 4. COHERE RERANKING
  if (finalResults.length > 0) {
    const rerankResponse = await cohere.rerank({
      query: query,
      documents: finalResults.map(r => ({ text: r.content })),
      model: "rerank-english-v3.0",
      topN: 5
    });
    
    const rerankedChunks = rerankResponse.results.map(res => finalResults[res.index]);
    return rerankedChunks;
  }

  return finalResults;
}
