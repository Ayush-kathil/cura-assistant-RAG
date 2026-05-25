import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "./storage";
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

export const compressContextSnapshot = async (
  messagesToCompress: Message[],
  apiKey: string
): Promise<string> => {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const historyText = messagesToCompress
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const prompt = `Summarize the following conversation history into a dense, fact-heavy "Context Snapshot". Retain all key entities, decisions, user preferences, and established facts. Purge conversational filler.

Conversation History:
${historyText}

Dense Context Snapshot:`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};

export const generateStreamingResponse = async (
  prompt: string, 
  contextChunks: ScoredChunk[], 
  documentName: string,
  apiKey: string,
  onChunk: (text: string) => void,
  personaInstruction?: string
) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, contextChunks, apiKey, personaInstruction }),
  });

  if (!response.ok || !response.body) {
    const errText = await response.text();
    throw new Error(errText || "Failed to fetch response");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      const chunkText = decoder.decode(value, { stream: true });
      const words = chunkText.split(/(\s+)/); // keep spaces
      for (const word of words) {
        if (word) {
          onChunk(word);
          await new Promise(r => setTimeout(r, 25)); // 25ms per word for typewriter effect
        }
      }
    }
  }
};
