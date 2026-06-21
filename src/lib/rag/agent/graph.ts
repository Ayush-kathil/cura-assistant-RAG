import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { hybridGraphSearch } from "../retrieval/hybridGraphSearch";
import { getEmbeddings } from "../retrieval/embeddings"; 
import { logRetrievalTrace } from "../observability/logger";

// Define the State for our Agent
export const AgentState = Annotation.Root({
  query: Annotation<string>,
  workspaceId: Annotation<string>,
  targetDocumentId: Annotation<string | null>,
  queryEmbedding: Annotation<number[]>,
  retrievedChunks: Annotation<any[]>,
  generation: Annotation<string>,
  hallucinated: Annotation<boolean>,
  verificationResult: Annotation<any>,
  researchMode: Annotation<boolean>,
  startTime: Annotation<number>,
  loopCount: Annotation<number>({
    reducer: (x, y) => x + y,
    default: () => 0
  })
});

function getLlm() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API Key. Please configure GEMINI_API_KEY in your environment variables.");
  return new ChatGoogleGenerativeAI({ model: "gemini-3.1-flash-lite", temperature: 0.2, apiKey });
}

function getVerifierLlm() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API Key. Please configure GEMINI_API_KEY in your environment variables.");
  return new ChatGoogleGenerativeAI({ model: "gemini-3.1-flash-lite", temperature: 0, apiKey });
}

// Nodes
async function queryAnalyzer(state: typeof AgentState.State) {
  let finalQuery = state.query;
  let targetDoc = state.targetDocumentId;

  // Task 5: Document Scoping System parsing @filename.pdf
  const match = state.query.match(/@([\w-]+\.pdf)/i);
  if (match) {
    const fileName = match[1];
    // We would resolve filename to doc ID here. 
    // For now we simulate by storing the name so the hybrid search can use it.
    targetDoc = fileName;
    finalQuery = state.query.replace(match[0], "").trim();
  }

  const embedding = await getEmbeddings(finalQuery);
  return { query: finalQuery, queryEmbedding: embedding, targetDocumentId: targetDoc, startTime: Date.now() };
}

async function retrieve(state: typeof AgentState.State) {
  const chunks = await hybridGraphSearch(state.workspaceId, state.query, state.queryEmbedding, state.targetDocumentId || undefined);
  return { retrievedChunks: chunks };
}

async function generate(state: typeof AgentState.State) {
  let joinedContext = "";
  const maxChars = 80000; // ~20k tokens to prevent overflow
  for (let i = 0; i < Math.min(30, state.retrievedChunks.length); i++) {
    const chunkText = `[Chunk ${state.retrievedChunks[i].id}] ${state.retrievedChunks[i].content}\n\n`;
    if (joinedContext.length + chunkText.length > maxChars) break;
    joinedContext += chunkText;
  }
  const context = joinedContext.trim();
  
  // Task 8: Response Quality Formatter
  const prompt = `You are a highly intelligent and helpful AI assistant. Use the following retrieved context to comprehensively and accurately answer the user's query.

CRITICAL INSTRUCTIONS:
1. Answer in a natural, conversational, and highly polished manner.
2. Structure your response beautifully using modern formatting (bold text, lists, and headers where appropriate). DO NOT force a rigid "Executive Summary" format unless specifically requested by the user.
3. If the answer is found in the context, explicitly cite the sources inline using brackets like [1], [2], etc. corresponding to the Chunk ID.
4. If you don't know the answer based on the context, politely state that you cannot find the exact information in the provided documents.

Context:
${context}

Query: ${state.query}`;
  
  const llm = getLlm();
  const response = await llm.invoke(prompt);
  return { generation: response.content.toString(), loopCount: 1 };
}

async function verify(state: typeof AgentState.State) {
  const maxLoops = state.researchMode ? 5 : 2;
  if (state.loopCount > maxLoops) {
    // End and log
    await logRetrievalTrace({
      query: state.query,
      workspaceId: state.workspaceId,
      selectedDocuments: state.targetDocumentId ? [state.targetDocumentId] : [],
      retrievedChunks: state.retrievedChunks,
      generation: state.generation,
      latencyMs: Date.now() - state.startTime,
      verificationResult: state.verificationResult
    });
    return { hallucinated: false }; 
  }

  // Task 2: Citation Verification System
  const prompt = `Analyze the following generation against the provided context. 
  For each major sentence or claim, determine if it is:
  - Verified (fully supported by context)
  - Partially Verified (some support, some assumptions)
  - Unsupported (not in context)

  Return a JSON array of objects with { "sentence": "...", "status": "Verified|Partially Verified|Unsupported" }
  Do not include markdown code blocks around the JSON.
  
  Context: ${state.retrievedChunks.map(c=>c.content).join("\n")}
  
  Generation: ${state.generation}`;
  
  const verifierLlm = getVerifierLlm();
  const response = await verifierLlm.invoke(prompt);
  let isHallucinated = false;
  let verificationResult = [];
  
  try {
    let raw = response.content.toString();
    raw = raw.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    verificationResult = JSON.parse(raw);
    isHallucinated = verificationResult.some((r: any) => r.status === "Unsupported");
  } catch (e) {
    isHallucinated = response.content.toString().includes("Unsupported");
  }

  // If we are passing verification, or we hit max loops, log the trace
  if (!isHallucinated || state.loopCount >= maxLoops) {
    await logRetrievalTrace({
      query: state.query,
      workspaceId: state.workspaceId,
      selectedDocuments: state.targetDocumentId ? [state.targetDocumentId] : [],
      retrievedChunks: state.retrievedChunks,
      generation: state.generation,
      latencyMs: Date.now() - state.startTime,
      verificationResult: verificationResult
    });
  }
  
  return { hallucinated: isHallucinated, verificationResult };
}

// Edge Logic
function routeAfterVerify(state: typeof AgentState.State) {
  // If research mode is on and we hallucinated (meaning we need more context), we would ideally loop back to retrieve with a new query.
  // For now, if hallucinated, we regenerate.
  if (state.hallucinated && state.loopCount <= (state.researchMode ? 5 : 2)) {
    return state.researchMode ? "retrieve" : "generate";
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
