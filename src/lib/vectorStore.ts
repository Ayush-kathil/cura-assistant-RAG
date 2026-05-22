export interface ChunkedDocument {
  id: string;
  documentId: string;
  filename: string;
  text: string;
  embedding: number[];
  chunkIndex: number;
}

export interface ScoredChunk {
  chunk: ChunkedDocument;
  score: number;
}

export const chunkText = (text: string, chunkSize: number = 1200, overlap: number = 300): string[] => {
  const chunks: string[] = [];
  let index = 0;
  
  while (index < text.length) {
    chunks.push(text.slice(index, index + chunkSize));
    index += chunkSize - overlap;
  }
  
  return chunks;
};

export const dotProduct = (a: number[], b: number[]): number => {
  let product = 0;
  for (let i = 0; i < a.length; i++) {
    product += a[i] * b[i];
  }
  return product;
};

export const searchVectorStore = (
  queryEmbedding: number[], 
  store: ChunkedDocument[],
  activeDocumentIds: string[],
  topK: number = 3
): ScoredChunk[] => {
  const filteredStore = store.filter(chunk => activeDocumentIds.includes(chunk.documentId));
  const scoredChunks: ScoredChunk[] = filteredStore.map(chunk => ({
    chunk,
    score: dotProduct(queryEmbedding, chunk.embedding)
  }));
  
  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, topK);
};
