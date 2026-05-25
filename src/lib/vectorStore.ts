import { BM25 } from "./bm25";

export interface ParentChunk {
  id: string;
  documentId: string;
  filename: string;
  text: string;
  chunkIndex: number;
}

export interface ChildChunk {
  id: string;
  parentId: string;
  documentId: string;
  filename: string;
  text: string;
  embedding: number[];
  chunkIndex: number;
}

export interface VectorStoreData {
  parents: ParentChunk[];
  children: ChildChunk[];
}

export interface ScoredChunk {
  chunk: ParentChunk;
  score: number;
  childMatchText: string;
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

export const hybridSearchVectorStore = (
  query: string,
  queryEmbedding: number[], 
  store: VectorStoreData,
  activeDocumentIds: string[],
  topK: number = 3
): ScoredChunk[] => {
  const filteredChildren = store.children.filter(chunk => activeDocumentIds.includes(chunk.documentId));
  
  if (filteredChildren.length === 0) return [];

  const vectorScores = filteredChildren.map(chunk => ({
    id: chunk.id,
    score: dotProduct(queryEmbedding, chunk.embedding)
  })).sort((a, b) => b.score - a.score);

  const bm25 = new BM25(filteredChildren.map(c => ({ id: c.id, text: c.text })));
  const bm25Scores = bm25.search(query);

  const rrfK = 60;
  const rrfScores = new Map<string, number>();

  vectorScores.forEach((vs, rank) => {
    rrfScores.set(vs.id, (rrfScores.get(vs.id) || 0) + (1 / (rrfK + rank + 1)));
  });

  bm25Scores.forEach((bs, rank) => {
    rrfScores.set(bs.id, (rrfScores.get(bs.id) || 0) + (1 / (rrfK + rank + 1)));
  });

  const combined = Array.from(rrfScores.entries()).map(([id, score]) => {
    const child = filteredChildren.find(c => c.id === id)!;
    const parent = store.parents.find(p => p.id === child.parentId)!;
    return {
      chunk: parent,
      score,
      childMatchText: child.text
    };
  });

  combined.sort((a, b) => b.score - a.score);
  
  const uniqueParents = new Map<string, ScoredChunk>();
  for (const item of combined) {
    if (!uniqueParents.has(item.chunk.id)) {
      uniqueParents.set(item.chunk.id, item);
    }
  }

  return Array.from(uniqueParents.values()).slice(0, topK);
};
