import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!
});

export async function getEmbeddings(text: string): Promise<number[]> {
  const response = await cohere.embed({
    texts: [text],
    model: "embed-english-v3.0",
    inputType: "search_query"
  });
  return response.embeddings[0] as number[];
}
