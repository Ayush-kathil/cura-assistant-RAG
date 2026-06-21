import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export async function getEmbeddings(text: string): Promise<number[]> {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2",
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "dummy",
  });
  
  let response = await embeddings.embedQuery(text);
  if (response.length > 768) {
    response = response.slice(0, 768);
    const magnitude = Math.sqrt(response.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) response = response.map(val => val / magnitude);
  } else if (response.length < 768) {
    const padded = new Array(768).fill(0);
    for(let k = 0; k < response.length; k++) padded[k] = response[k];
    response = padded;
  }
  return response;
}
