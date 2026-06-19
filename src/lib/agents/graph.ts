import { StateGraph, END, START } from "@langchain/langgraph";
import { RetrievedChunk } from "../rag/retrieval/hybridSearch";
import { queryAnalyzerNode } from "./nodes/queryAnalyzer";
import { routerNode } from "./nodes/router";
import { retrieveNode } from "./nodes/retrieve";
import { rerankNode } from "./nodes/rerank";
import { compressNode } from "./nodes/compress";
import { generateNode } from "./nodes/generate";
import { verifyNode } from "./nodes/verify";
import { BaseMessage } from "@langchain/core/messages";

// 1. Define the State Interface
export interface AgentState {
  workspaceId: string;
  sessionId: string;
  query: string;
  chatHistory: BaseMessage[];
  
  // 3A: Query Understanding Outputs
  intent?: 'direct_chat' | 'rag' | 'web_search' | 'hybrid';
  entities?: string[];
  temporalContext?: string;
  
  // 3B: Router Decisions
  routingPath?: 'direct' | 'retrieve_internal' | 'retrieve_external' | 'retrieve_hybrid';
  
  // Retrieval & Reranking Outputs
  retrievedChunks: RetrievedChunk[];
  
  // Compression Outputs
  compressedContext?: string;
  
  // Generation Outputs
  draftResponse?: string;
  
  // Verification Outputs
  verificationPassed: boolean;
  correctionInstructions?: string;
  retryCount: number;
  
  // Telemetry
  latencies: Record<string, number>;
}

const getInitialState = (): Partial<AgentState> => ({
  retrievedChunks: [],
  verificationPassed: false,
  retryCount: 0,
  latencies: {},
});

// 2. Define the Graph Workflow
const workflow = new StateGraph<AgentState>({
  channels: {
    workspaceId: null,
    sessionId: null,
    query: null,
    chatHistory: {
      value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
      default: () => [],
    },
    intent: null,
    entities: null,
    temporalContext: null,
    routingPath: null,
    retrievedChunks: {
      value: (x: RetrievedChunk[], y: RetrievedChunk[]) => y,
      default: () => [],
    },
    compressedContext: null,
    draftResponse: null,
    verificationPassed: null,
    correctionInstructions: null,
    retryCount: null,
    latencies: {
      value: (x: Record<string, number>, y: Record<string, number>) => ({ ...x, ...y }),
      default: () => ({}),
    }
  }
});

// 3. Add Nodes
workflow.addNode("queryAnalyzer", queryAnalyzerNode);
workflow.addNode("router", routerNode);
workflow.addNode("retrieve", retrieveNode);
workflow.addNode("rerank", rerankNode);
workflow.addNode("compress", compressNode);
workflow.addNode("generate", generateNode);
workflow.addNode("verify", verifyNode);

// 4. Add Edges and Conditional Routing
workflow.addEdge(START, "queryAnalyzer");
workflow.addEdge("queryAnalyzer", "router");

workflow.addConditionalEdges(
  "router",
  (state: AgentState) => {
    if (state.routingPath === 'direct') return "generate"; 
    return "retrieve"; // RAG flow
  },
  {
    generate: "generate",
    retrieve: "retrieve"
  }
);

workflow.addEdge("retrieve", "rerank");
workflow.addEdge("rerank", "compress");
workflow.addEdge("compress", "generate");

workflow.addEdge("generate", "verify");

workflow.addConditionalEdges(
  "verify",
  (state: AgentState) => {
    if (state.verificationPassed) return END; // "Answer" node is implicit END in LangGraph yielding final state
    if (state.retryCount >= 2) return END; // Max retries exceeded

    // Verification Failed. For now, route to generate with correction instructions.
    // If we wanted to "need new context", we would route to "retrieve".
    return "generate"; 
  },
  {
    generate: "generate",
    retrieve: "retrieve",
    [END]: END
  }
);

// 5. Compile the Graph
export const agentGraph = workflow.compile();
