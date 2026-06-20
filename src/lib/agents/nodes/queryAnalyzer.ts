import { AgentState } from "../graph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

const analyzerSchema = z.object({
  intent: z.enum(['direct_chat', 'rag', 'web_search', 'hybrid']).describe("The broad categorization of what the user is asking."),
  entities: z.array(z.string()).describe("Key named entities extracted from the query."),
  temporalContext: z.enum(['historical', 'current', 'future']).describe("The time frame implied by the query.")
});

const parser = StructuredOutputParser.fromZodSchema(analyzerSchema);

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", `You are the Query Understanding module. 
Your ONLY job is to extract the intent, entities, and temporal context of the user query.
DO NOT ANSWER THE QUESTION. JUST ANALYZE.

{format_instructions}`],
  ["human", `User Query: "{query}"`]
]);

function getChain() {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.1-flash-lite",
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "dummy",
  });
  return RunnableSequence.from([
    promptTemplate,
    llm,
    parser,
  ]);
}

export async function queryAnalyzerNode(state: AgentState): Promise<Partial<AgentState>> {
  const startTime = Date.now();
  console.log(`[QueryAnalyzer] Deeply analyzing intent for: "${state.query}"`);
  
  try {
    const chain = getChain();
    const analysis = await chain.invoke({
      query: state.query,
      format_instructions: parser.getFormatInstructions(),
    });

    const latency = Date.now() - startTime;
    console.log(`[QueryAnalyzer] Intent: ${analysis.intent} | Entities: ${analysis.entities.join(", ")} | Latency: ${latency}ms`);

    return {
      intent: analysis.intent,
      entities: analysis.entities,
      temporalContext: analysis.temporalContext,
      latencies: { ...state.latencies, queryAnalyzer: latency }
    };
  } catch (error) {
    console.error("[QueryAnalyzer] Failed to parse intent, defaulting.", error);
    return {
      intent: 'rag',
      entities: [],
      temporalContext: 'current',
      latencies: { ...state.latencies, queryAnalyzer: Date.now() - startTime }
    };
  }
}
