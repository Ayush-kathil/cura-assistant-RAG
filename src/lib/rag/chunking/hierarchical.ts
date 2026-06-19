import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export interface ParsedNode {
  id: string;
  type: 'document' | 'section' | 'paragraph' | 'table' | 'figure' | 'chunk';
  content: string;
  metadata: {
    pageNumber?: number;
    sectionTitle?: string;
    sourceFile?: string;
    [key: string]: any;
  };
  children?: ParsedNode[];
}

export class HierarchicalChunker {
  private baseSplitter: RecursiveCharacterTextSplitter;

  constructor(
    chunkSize: number = 1000,
    chunkOverlap: number = 200
  ) {
    this.baseSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
  }

  /**
   * Processes a raw document string and splits it hierarchically.
   * In a full implementation, this would parse markdown headers (#) 
   * to create sections, then split those sections into chunks.
   * 
   * For this MVP, we simulate parsing by using RecursiveCharacterTextSplitter 
   * and wrapping the output in our ParsedNode interface.
   */
  async chunkDocument(text: string, metadata: any = {}): Promise<ParsedNode[]> {
    const rawChunks = await this.baseSplitter.createDocuments([text]);
    
    // Simulate Hierarchical Structure
    const nodes: ParsedNode[] = rawChunks.map((doc, index) => ({
      id: crypto.randomUUID(),
      type: 'chunk',
      content: doc.pageContent,
      metadata: {
        ...metadata,
        chunkIndex: index,
        // E.g., simulate finding headers
        sectionTitle: metadata.sectionTitle || 'Extracted Text',
      }
    }));

    return nodes;
  }
}

// Singleton for easy import
export const chunker = new HierarchicalChunker();
