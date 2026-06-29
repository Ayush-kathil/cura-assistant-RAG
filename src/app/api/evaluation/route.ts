import { appGraph } from "@/lib/rag/agent/graph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export async function POST(req: Request) {
  const { dataset, workspaceId } = await req.json();

  if (!dataset || !workspaceId) {
    return new Response(JSON.stringify({ error: "Missing dataset or workspaceId" }), { status: 400 });
  }

  const results = [];
  const verifierLlm = new ChatGoogleGenerativeAI({ model: "gemini-3.1-flash-lite", temperature: 0, apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "dummy" });

  for (const item of dataset) {
    try {
      const initialState = {
        query: item.query,
        workspaceId,
        targetDocumentId: null,
        queryEmbedding: [],
        retrievedChunks: [],
        generation: "",
        hallucinated: false,
        verificationResult: null,
        researchMode: false,
        startTime: Date.now(),
        loopCount: 0
      };

      const finalState = await appGraph.invoke(initialState, { configurable: { thread_id: "eval-thread" } });
      
      const generation = finalState.generation;
      const chunks = finalState.retrievedChunks;
      const contextStr = chunks.map((c: any) => c.content).join("\n");

      // Faithfulness Eval
      const prompt = `Evaluate the Faithfulness of the following generation against the context. Is the generation fully supported by the context without hallucinating external facts? Answer ONLY '1' for fully faithful, or '0' for unfaithful.
      Context: ${contextStr}
      Generation: ${generation}`;
      
      const evalRes = await verifierLlm.invoke(prompt);
      const faithfulnessScore = parseInt(evalRes.content.toString().trim(), 10) === 1 ? 1 : 0;
      
      // Basic Recall - mock checking if the chunk id matches item.expected_chunk_ids
      let recallScore = 0;
      if (item.expected_chunk_ids && item.expected_chunk_ids.length > 0) {
        const retrievedIds = chunks.map((c: any) => c.id);
        const hits = item.expected_chunk_ids.filter((id: string) => retrievedIds.includes(id)).length;
        recallScore = hits / item.expected_chunk_ids.length;
      }

      results.push({
        query: item.query,
        generation,
        faithfulness: faithfulnessScore,
        recall: recallScore,
        latencyMs: Date.now() - finalState.startTime
      });

    } catch (e: any) {
      results.push({ query: item.query, error: e.message });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
}
