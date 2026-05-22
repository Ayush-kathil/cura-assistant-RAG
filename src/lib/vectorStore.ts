export interface ChunkedDocument {
  id: string;
  text: string;
  embedding: number[];
  chunkIndex: number;
}

export interface ScoredChunk {
  chunk: ChunkedDocument;
  score: number;
}

export const chunkText = (text: string, chunkSize: number = 1000, overlap: number = 200): string[] => {
  const chunks: string[] = [];
  let index = 0;
  
  while (index < text.length) {
    chunks.push(text.slice(index, index + chunkSize));
    index += chunkSize - overlap;
  }
  
  return chunks;
};

export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const searchVectorStore = (
  queryEmbedding: number[], 
  store: ChunkedDocument[], 
  topK: number = 3
): ScoredChunk[] => {
  const scoredChunks: ScoredChunk[] = store.map(chunk => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  
  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, topK);
};
