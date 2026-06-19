import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export async function getEmbeddings(text: string): Promise<number[]> {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004",
    apiKey: process.env.GOOGLE_API_KEY || "dummy",
  });
  
  const response = await embeddings.embedQuery(text);
  return response;
}
