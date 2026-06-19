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
  parentId?: string;
  childrenIds?: string[];
}

export class HierarchicalDocumentParser {
  /**
   * Mock implementation for extracting structured sections from text.
   * In a real implementation, this would use pdfjs-dist / docx parsers to find headers.
   */
  async parse(text: string, metadata: any): Promise<ParsedNode[]> {
    const nodes: ParsedNode[] = [];
    
    // Create Root Document Node
    const docNode: ParsedNode = {
      id: `doc-${Date.now()}`,
      type: 'document',
      content: '', // Doesn't hold content directly, holds metadata
      metadata,
      childrenIds: []
    };
    nodes.push(docNode);

    // Simple heuristic: Split by double newline for paragraphs
    const paragraphs = text.split(/\n\n+/);
    let currentSection: ParsedNode | null = null;

    paragraphs.forEach((p, index) => {
      // Check if it's a header (e.g. Markdown header or short bold line)
      if (p.trim().startsWith('#') || (p.length < 100 && p.toUpperCase() === p && !p.includes('.'))) {
        currentSection = {
          id: `sec-${index}`,
          type: 'section',
          content: p.trim(),
          metadata: { ...metadata, sectionTitle: p.trim() },
          parentId: docNode.id,
          childrenIds: []
        };
        docNode.childrenIds!.push(currentSection.id);
        nodes.push(currentSection);
      } else {
        // It's a paragraph
        const parent = currentSection || docNode;
        const paraNode: ParsedNode = {
          id: `para-${index}`,
          type: 'paragraph',
          content: p.trim(),
          metadata: { ...metadata, sectionTitle: currentSection?.metadata.sectionTitle },
          parentId: parent.id,
          childrenIds: []
        };
        
        parent.childrenIds!.push(paraNode.id);
        nodes.push(paraNode);

        // Chunking the paragraph if it's too long
        if (p.length > 800) {
           const sentences = p.match(/[^.!?]+[.!?]+/g) || [p];
           let currentChunk = "";
           sentences.forEach((s, sIdx) => {
             if (currentChunk.length + s.length > 600) {
                const chunkNode: ParsedNode = {
                   id: `chunk-${index}-${sIdx}`,
                   type: 'chunk',
                   content: currentChunk.trim(),
                   metadata: paraNode.metadata,
                   parentId: paraNode.id
                };
                paraNode.childrenIds!.push(chunkNode.id);
                nodes.push(chunkNode);
                currentChunk = s;
             } else {
                currentChunk += " " + s;
             }
           });
           if (currentChunk.trim().length > 0) {
              const chunkNode: ParsedNode = {
                 id: `chunk-${index}-final`,
                 type: 'chunk',
                 content: currentChunk.trim(),
                 metadata: paraNode.metadata,
                 parentId: paraNode.id
              };
              paraNode.childrenIds!.push(chunkNode.id);
              nodes.push(chunkNode);
           }
        } else {
            // Paragraph is small enough to be its own chunk
            const chunkNode: ParsedNode = {
                id: `chunk-${index}-single`,
                type: 'chunk',
                content: p.trim(),
                metadata: paraNode.metadata,
                parentId: paraNode.id
             };
             paraNode.childrenIds!.push(chunkNode.id);
             nodes.push(chunkNode);
        }
      }
    });

    return nodes;
  }
}
