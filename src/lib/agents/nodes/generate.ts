import { AgentState } from "../graph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const generatePromptTemplate = PromptTemplate.fromTemplate(`
You are an expert AI assistant answering questions based on retrieved context.
Your goal is to provide a clear, accurate, and highly professional answer.

CONTEXT:
{context}

USER QUESTION: 
{query}

PREVIOUS CHAT HISTORY:
{chat_history}

INSTRUCTIONS:
1. Base your answer ONLY on the provided context.
2. If the context does not contain the answer, explicitly state that you cannot find the information in the current documents. Do not guess.
3. INLINE CITATIONS ARE REQUIRED. Whenever you make a claim based on the context, append the source index like this: [1], [2], etc.
4. Keep the answer concise but thorough. Use markdown formatting for readability.
{correction_instructions}
`);

export async function generateNode(state: AgentState): Promise<Partial<AgentState>> {
  const startTime = Date.now();
  console.log(`[Generate] Generating response... (Retry count: ${state.retryCount})`);

  try {
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.3,
      streaming: true, // We will listen to stream events if invoked via .stream()
    });

    const chain = generatePromptTemplate.pipe(llm).pipe(new StringOutputParser());

    // Use compressed context for generation
    const formattedContext = state.compressedContext || "No context retrieved.";

    // Format chat history
    const formattedHistory = state.chatHistory
      .slice(-5) // Keep last 5 messages for context window
      .map(msg => `${msg._getType()}: ${msg.content}`)
      .join("\n");

    const correctionText = state.correctionInstructions 
      ? `\nCRITICAL CORRECTION FROM VERIFIER: ${state.correctionInstructions}` 
      : "";

    // In a real streaming setup (like via API route), we would use chain.stream()
    // Since LangGraph nodes return the final state, we invoke it fully here,
    // but the streaming callbacks can be captured at the graph invocation level.
    const response = await chain.invoke({
      context: formattedContext,
      query: state.query,
      chat_history: formattedHistory,
      correction_instructions: correctionText
    });

    const latency = Date.now() - startTime;
    console.log(`[Generate] Response generated. Latency: ${latency}ms`);

    return {
      draftResponse: response,
      latencies: { ...state.latencies, generate: latency }
    };
  } catch (error) {
    console.error("[Generate] Generation failed:", error);
    return {
      draftResponse: "I encountered an error while synthesizing the response.",
      latencies: { ...state.latencies, generate: Date.now() - startTime }
    };
  }
}
