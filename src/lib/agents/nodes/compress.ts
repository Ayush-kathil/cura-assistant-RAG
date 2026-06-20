import { AgentState } from "../graph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const compressPromptTemplate = PromptTemplate.fromTemplate(`
You are the Context Compression module. 
Your goal is to extract ONLY the exact sentences or data points from the provided chunks that are strictly relevant to the user's query.
By doing this, you shrink the context window, save tokens, and prevent the Generation agent from hallucinating based on irrelevant tangential information.

INSTRUCTIONS:
1. For each chunk, extract the relevant information.
2. If a chunk contains NO relevant information, IGNORE IT.
3. Keep the source index [1], [2] attached to the extracted information so citations are preserved!
4. Output raw text. Do not add conversational filler.

USER QUERY:
{query}

RAW RETRIEVED CHUNKS:
{context}
`);

export async function compressNode(state: AgentState): Promise<Partial<AgentState>> {
  const startTime = Date.now();
  console.log(`[Compress] Compressing context for query...`);

  if (!state.retrievedChunks || state.retrievedChunks.length === 0) {
    return {
      compressedContext: "No context retrieved.",
      latencies: { ...state.latencies, compress: 0 }
    };
  }

  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-3.1-flash-lite",
      temperature: 0,
    });

    const chain = compressPromptTemplate.pipe(llm).pipe(new StringOutputParser());

    // Format raw chunks with indices for citations
    const rawContext = state.retrievedChunks
      .map((chunk, idx) => `--- Chunk [${idx + 1}] ---\n${chunk.content}\n`)
      .join("\n");

    const compressedContext = await chain.invoke({
      context: rawContext,
      query: state.query,
    });

    const latency = Date.now() - startTime;
    console.log(`[Compress] Context compressed. Latency: ${latency}ms`);

    return {
      compressedContext,
      latencies: { ...state.latencies, compress: latency }
    };
  } catch (error) {
    console.error("[Compress] Compression failed, falling back to raw context.", error);
    
    // Fallback: Just dump the raw context if compression fails
    const rawContext = state.retrievedChunks
      .map((chunk, idx) => `Source [${idx + 1}]:\n${chunk.content}\n`)
      .join("\n");

    return {
      compressedContext: rawContext,
      latencies: { ...state.latencies, compress: Date.now() - startTime }
    };
  }
}
