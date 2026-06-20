import { VectorStore } from "@langchain/core/vectorstores";
import { Document } from "@langchain/core/documents";
import { Embeddings } from "@langchain/core/embeddings";

import { GoogleGenerativeAI } from "@google/generative-ai";

export class CustomGeminiEmbeddings {
  private genAI: GoogleGenerativeAI;
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }
  async embedQuery(text: string): Promise<number[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (e) {
      console.error("Gemini Embeddings failed, falling back", e);
      return [];
    }
  }
  async embedDocuments(texts: string[]): Promise<number[][]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
      const result = await model.batchEmbedContents({
          requests: texts.map(text => ({ content: { role: 'user', parts: [{ text }] } }))
      });
      return result.embeddings.map((e: any) => e.values);
    } catch (e) {
      console.error("Gemini Batch Embeddings failed, falling back", e);
      return texts.map(() => []);
    }
  }
}

export class MemoryVectorStore extends VectorStore {
  memoryVectors: { content: string; embedding: number[]; metadata: any }[] = [];
  embeddings: Embeddings | CustomGeminiEmbeddings;

  constructor(embeddings: Embeddings | CustomGeminiEmbeddings) {
    super(embeddings, {});
    this.embeddings = embeddings;
  }

  _vectorstoreType(): string {
    return "memory";
  }

  async addDocuments(documents: Document[]): Promise<void> {
    const texts = documents.map((d) => d.pageContent);
    const embeddings = await this.embeddings.embedDocuments(texts);
    for (let i = 0; i < documents.length; i++) {
      this.memoryVectors.push({
        content: documents[i].pageContent,
        embedding: embeddings[i],
        metadata: documents[i].metadata,
      });
    }
  }

  async addVectors(vectors: number[][], documents: Document[]): Promise<void> {
    for (let i = 0; i < documents.length; i++) {
      this.memoryVectors.push({
        content: documents[i].pageContent,
        embedding: vectors[i],
        metadata: documents[i].metadata,
      });
    }
  }

  async similaritySearch(query: string, k: number = 4, filter?: any): Promise<Document[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);
    
    let targetVectors = this.memoryVectors;
    if (filter && typeof filter === 'function') {
      targetVectors = targetVectors.filter((v) => filter(new Document({ pageContent: v.content, metadata: v.metadata })));
    }

    if (queryEmbedding.length === 0 || targetVectors.some(v => !v.embedding || v.embedding.length === 0)) {
      // Fallback: Keyword search
      const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
      const scored = targetVectors.map((v) => {
        const contentLower = v.content.toLowerCase();
        let score = 0;
        for (const term of queryTerms) {
          if (contentLower.includes(term)) score += 1;
        }
        return { doc: new Document({ pageContent: v.content, metadata: v.metadata }), score };
      });
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, k).map(s => s.doc);
    }

    const results = targetVectors.map((v) => {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < v.embedding.length; i++) {
        dotProduct += v.embedding[i] * queryEmbedding[i];
        normA += v.embedding[i] * v.embedding[i];
        normB += queryEmbedding[i] * queryEmbedding[i];
      }
      normA = Math.sqrt(normA);
      normB = Math.sqrt(normB);
      const score = normA === 0 || normB === 0 ? 0 : dotProduct / (normA * normB);
      return { doc: new Document({ pageContent: v.content, metadata: v.metadata }), score };
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k).map(r => r.doc);
  }

  async similaritySearchVectorWithScore(query: number[], k: number, filter?: any): Promise<[Document, number][]> {
    let targetVectors = this.memoryVectors;
    if (filter && typeof filter === 'function') {
      targetVectors = this.memoryVectors.filter((v) => filter(new Document({ pageContent: v.content, metadata: v.metadata })));
    }
    const results = targetVectors.map((v) => {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < v.embedding.length; i++) {
        dotProduct += v.embedding[i] * query[i];
        normA += v.embedding[i] * v.embedding[i];
        normB += query[i] * query[i];
      }
      normA = Math.sqrt(normA);
      normB = Math.sqrt(normB);
      const score = normA === 0 || normB === 0 ? 0 : dotProduct / (normA * normB);
      return { doc: new Document({ pageContent: v.content, metadata: v.metadata }), score };
    });
    
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k).map((r) => [r.doc, r.score]);
  }
}
