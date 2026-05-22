import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@/components/chat/ChatInterface";
import { ScoredChunk } from "./vectorStore";

export const getGeminiClient = (apiKey: string) => {
  if (!apiKey) throw new Error("API Key is missing");
  return new GoogleGenerativeAI(apiKey);
};

export const generateEmbedding = async (text: string, apiKey: string): Promise<number[]> => {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
  
  const result = await model.embedContent(text);
  return result.embedding.values;
};

export const generateEmbeddingsBatch = async (texts: string[], apiKey: string): Promise<number[][]> => {
  const embeddings: number[][] = [];
  
  for (let i = 0; i < texts.length; i++) {
    try {
      const embedding = await generateEmbedding(texts[i], apiKey);
      embeddings.push(embedding);
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error: any) {
      console.error(`Error embedding chunk ${i}:`, error);
      throw new Error(`Embedding failed on chunk ${i}: ${error?.message || error}`);
    }
  }
  
  return embeddings;
};

export const reformulateQuery = async (
  currentQuery: string,
  history: Message[],
  apiKey: string
): Promise<string> => {
  if (history.length === 0) return currentQuery;

  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const historyText = history
    .slice(-4)
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const prompt = `Given the following conversation history and a follow-up user query, rephrase the follow-up query into a standalone, highly descriptive search string that contains all necessary context from the history. If the query is already standalone, return it as is. Do not answer the query, just rewrite it.
  
History:
${historyText}

Follow-up Query: ${currentQuery}

Standalone Search String:`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim() || currentQuery;
};

export const generateStreamingResponse = async (
  prompt: string, 
  contextChunks: ScoredChunk[], 
  documentName: string,
  apiKey: string,
  onChunk: (text: string) => void
) => {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const contextStr = contextChunks.length > 0 
    ? `\n\nCONTEXT INFORMATION:\n${contextChunks.map(c => `[Citation: Chunk ${c.chunk.chunkIndex}]\n${c.chunk.text}`).join("\n---\n")}\n\nBased ONLY on the above context information, answer the user query: ${prompt}`
    : prompt;

  const result = await model.generateContentStream({
    contents: [{ role: "user", parts: [{ text: contextStr }] }],
    systemInstruction: `You are an elite AI assistant named Cura. Use the provided context to answer questions accurately. 
CRITICAL: When using information from the context, you MUST include inline citation markers matching the source chunk, formatted exactly like this: [Chunk X], where X is the number provided in the context.
If the context does not contain the answer, say you do not know based on the provided document.`,
  });

  for await (const chunk of result.stream) {
    onChunk(chunk.text());
  }
};
