import { SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export interface RetrievedChunk {
  id: string;
  document_id: string;
  content: string;
  metadata: any;
  similarity: number;
}

export class HybridSearchEngine {
  private embeddings: GoogleGenerativeAIEmbeddings;

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
      model: "text-embedding-004", // Or preferred Gemini embedding model
    });
  }

  /**
   * Executes the hybrid search RPC function on Supabase.
   * Calls the Vector search (pgvector) and Full-Text Search (BM25)
   * and fuses them using Reciprocal Rank Fusion (RRF).
   */
  async search(
    supabase: SupabaseClient,
    workspaceId: string,
    queryText: string,
    matchCount: number = 20
  ): Promise<RetrievedChunk[]> {
    
    // 1. Generate Embedding for the query
    const queryEmbedding = await this.embeddings.embedQuery(queryText);

    // 2. Execute Hybrid Search RPC
    const { data, error } = await supabase.rpc('hybrid_search_chunks', {
      target_workspace_id: workspaceId,
      query_embedding: queryEmbedding,
      query_text: queryText,
      match_count: matchCount,
      full_text_weight: 1.0,
      semantic_weight: 1.0,
      rrf_k: 50
    });

    if (error) {
      console.error('Hybrid Search RPC Failed:', error);
      throw new Error(`Retrieval Failed: ${error.message}`);
    }

    return data as RetrievedChunk[];
  }

  /**
   * Executes search for multiple query variants and deduplicates the results.
   */
  async searchMultiQuery(
    supabase: SupabaseClient,
    workspaceId: string,
    queryVariants: string[],
    matchCountPerVariant: number = 10
  ): Promise<RetrievedChunk[]> {
    
    const allResults = await Promise.all(
      queryVariants.map(variant => this.search(supabase, workspaceId, variant, matchCountPerVariant))
    );

    // Flatten and Deduplicate by Chunk ID
    const uniqueChunks = new Map<string, RetrievedChunk>();
    
    allResults.flat().forEach(chunk => {
      if (!uniqueChunks.has(chunk.id)) {
        uniqueChunks.set(chunk.id, chunk);
      } else {
        // If duplicate found, keep the one with the higher RRF score
        const existing = uniqueChunks.get(chunk.id)!;
        if (chunk.similarity > existing.similarity) {
          uniqueChunks.set(chunk.id, chunk);
        }
      }
    });

    // Sort by highest similarity first
    return Array.from(uniqueChunks.values()).sort((a, b) => b.similarity - a.similarity);
  }
}

export const hybridSearchEngine = new HybridSearchEngine();
