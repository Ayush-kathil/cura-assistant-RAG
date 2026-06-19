import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class MultiQueryGenerator {
  private llm: ChatGoogleGenerativeAI;
  
  constructor() {
    this.llm = new ChatGoogleGenerativeAI({
      modelName: 'gemini-1.5-flash',
      temperature: 0.2, // Low temperature for deterministic queries
    });
  }

  /**
   * Generates multiple search query variants to improve recall.
   * Handles semantic matching by overcoming exact word choice differences.
   */
  async generateVariants(originalQuery: string, numVariants: number = 3): Promise<string[]> {
    const prompt = PromptTemplate.fromTemplate(`
      You are an AI language model assistant. Your task is to generate {numVariants} 
      different versions of the given user question to retrieve relevant documents from a vector database. 
      By generating multiple perspectives on the user question, your goal is to help
      the user overcome some of the limitations of the distance-based similarity search.
      
      Provide these alternative questions separated by newlines.
      
      Original question: {query}
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());
    
    try {
      const response = await chain.invoke({
        query: originalQuery,
        numVariants: numVariants
      });

      // Split by newline, clean up empty strings and numbering
      const variants = response
        .split('\n')
        .map(v => v.replace(/^\d+\.\s*/, '').trim()) // remove "1. ", "2. ", etc.
        .filter(v => v.length > 0);

      // Always include original query
      return [originalQuery, ...variants];
    } catch (error) {
      console.error('Failed to generate multi-query variants:', error);
      // Fallback gracefully
      return [originalQuery];
    }
  }
}

export const multiQueryGenerator = new MultiQueryGenerator();
