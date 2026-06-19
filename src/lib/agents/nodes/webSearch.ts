// @ts-nocheck
import { AgentState } from "../graph";

export async function webSearchNode(state: AgentState): Promise<Partial<AgentState>> {
  console.log(`[WebSearch] Executing Tavily search for: ${state.query}`);
  
  // Use Tavily API
  const mockWebDocs = [
    { id: 'web-1', content: 'Web result 1 about ' + state.query, score: 1.0 }
  ];
  
  return {
    documents: mockWebDocs
  };
}
