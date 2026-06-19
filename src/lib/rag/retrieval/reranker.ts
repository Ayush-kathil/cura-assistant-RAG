import { CohereClient } from 'cohere-ai';
import { RetrievedChunk } from './hybridSearch';

export class RerankerService {
  private cohere: CohereClient;

  constructor() {
    // In production, ensure COHERE_API_KEY is securely loaded
    this.cohere = new CohereClient({
      token: process.env.COHERE_API_KEY || 'mock-key',
    });
  }

  /**
   * Reranks a broad set of retrieved chunks using Cohere's Cross-Encoder model.
   * This provides a much more accurate sorting than distance-based vector search alone.
   */
  async rerankChunks(
    query: string, 
    chunks: RetrievedChunk[], 
    topN: number = 5
  ): Promise<RetrievedChunk[]> {
    if (chunks.length === 0) return [];

    try {
      // Map chunks to the format Cohere expects
      const documents = chunks.map(chunk => ({
        text: chunk.content,
      }));

      const response = await this.cohere.rerank({
        model: 'rerank-english-v3.0',
        query: query,
        documents: documents,
        topN: topN,
        returnDocuments: false, // We already have the documents in memory
      });

      // Map the results back to our RetrievedChunk format, updating the similarity score
      // to the Cohere relevance score.
      const rerankedChunks: RetrievedChunk[] = response.results.map(result => {
        const originalChunk = chunks[result.index];
        return {
          ...originalChunk,
          similarity: result.relevanceScore || 0, // Replace RRF score with Cohere Score
        };
      });

      return rerankedChunks;

    } catch (error) {
      console.error('Cohere Reranking Failed:', error);
      // Fallback: If Cohere fails, return the original topN chunks based on RRF score
      console.warn('Falling back to default RRF sort order.');
      return chunks.slice(0, topN);
    }
  }
}

export const rerankerService = new RerankerService();
