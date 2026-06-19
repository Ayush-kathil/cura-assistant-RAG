import { AgentState } from "../graph";

export async function routerNode(state: AgentState): Promise<Partial<AgentState>> {
  const startTime = Date.now();
  console.log(`[Router] Determining execution path based on intent: ${state.intent}`);

  let routingPath: 'direct' | 'retrieve_internal' | 'retrieve_external' | 'retrieve_hybrid' = 'retrieve_internal';

  // Deterministic routing logic
  if (state.intent === 'direct_chat') {
    routingPath = 'direct';
  } else if (state.intent === 'web_search') {
    // For V1, we might not have external web search fully built, but we route conceptually
    routingPath = 'retrieve_external';
  } else if (state.intent === 'hybrid') {
    routingPath = 'retrieve_hybrid';
  } else {
    // default to internal RAG
    routingPath = 'retrieve_internal';
  }

  const latency = Date.now() - startTime;
  console.log(`[Router] Selected Path: ${routingPath} | Latency: ${latency}ms`);

  return {
    routingPath,
    latencies: { ...state.latencies, router: latency }
  };
}
