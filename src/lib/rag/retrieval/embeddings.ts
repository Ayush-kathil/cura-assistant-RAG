import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export async function getEmbeddings(text: string): Promise<number[]> {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "embedding-001",
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "dummy",
  });
  
  const response = await embeddings.embedQuery(text);
  return response;
}
