import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { hybridGraphSearch } from "../retrieval/hybridGraphSearch";
import { getEmbeddings } from "../retrieval/embeddings"; // Assume exists

// Define the State for our Agent
export const AgentState = Annotation.Root({
  query: Annotation<string>,
  workspaceId: Annotation<string>,
  queryEmbedding: Annotation<number[]>,
  retrievedChunks: Annotation<any[]>,
  generation: Annotation<string>,
  hallucinated: Annotation<boolean>,
  loopCount: Annotation<number>({
    reducer: (x, y) => x + y,
    default: () => 0
  })
});

function getLlm() {
  return new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash", temperature: 0.2, apiKey: process.env.GOOGLE_API_KEY || "dummy" });
}
function getVerifierLlm() {
  return new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash", temperature: 0, apiKey: process.env.GOOGLE_API_KEY || "dummy" });
}

// Nodes
async function queryAnalyzer(state: typeof AgentState.State) {
  const embedding = await getEmbeddings(state.query);
  return { queryEmbedding: embedding };
}

async function retrieve(state: typeof AgentState.State) {
  const chunks = await hybridGraphSearch(state.workspaceId, state.query, state.queryEmbedding);
  return { retrievedChunks: chunks };
}

async function generate(state: typeof AgentState.State) {
  const context = state.retrievedChunks.map(c => c.content).join("\n\n");
  const prompt = `Use the following context to answer the query. If you don't know, say "I don't know."\n\nContext:\n${context}\n\nQuery: ${state.query}`;
  
  const llm = getLlm();
  const response = await llm.invoke(prompt);
  return { generation: response.content.toString(), loopCount: 1 };
}

async function verify(state: typeof AgentState.State) {
  if (state.loopCount > 3) {
    return { hallucinated: false }; // Prevent infinite loop
  }

  const prompt = `Does the following generation contain any claims NOT supported by the context? Answer strictly YES or NO.\n\nContext: ${state.retrievedChunks.map(c=>c.content).join("\n")}\n\nGeneration: ${state.generation}`;
  const verifierLlm = getVerifierLlm();
  const response = await verifierLlm.invoke(prompt);
  const isHallucinated = response.content.toString().toUpperCase().includes("YES");
  
  return { hallucinated: isHallucinated };
}

// Edge Logic
function routeAfterVerify(state: typeof AgentState.State) {
  if (state.hallucinated) {
    return "generate";
  }
  return END;
}

// Build Graph
const workflow = new StateGraph(AgentState)
  .addNode("queryAnalyzer", queryAnalyzer)
  .addNode("retrieve", retrieve)
  .addNode("generate", generate)
  .addNode("verify", verify)
  .addEdge(START, "queryAnalyzer")
  .addEdge("queryAnalyzer", "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", "verify")
  .addConditionalEdges("verify", routeAfterVerify);

export const appGraph = workflow.compile();
