import { AgentState } from "../graph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

const verifierSchema = z.object({
  isHallucinated: z.boolean().describe("True if the draft makes factual claims NOT supported by the context."),
  reasoning: z.string().describe("Explanation for why it passed or failed."),
  correctionInstructions: z.string().optional().describe("If hallucinated, specific instructions to the Generator on what to fix.")
});

const parser = StructuredOutputParser.fromZodSchema(verifierSchema);

const verifyPromptTemplate = PromptTemplate.fromTemplate(`
You are the strict Verification Agent in an Agentic RAG system.
Your job is to prevent hallucinations. You must compare the DRAFT RESPONSE against the RETRIEVED CONTEXT.

RETRIEVED CONTEXT:
{context}

DRAFT RESPONSE:
{draft}

RULES:
1. If the draft states that it doesn't know the answer because it's not in the context, this is a PASS (isHallucinated: false).
2. If the draft makes factual claims (numbers, dates, names, events) that do not appear in the context, this is a FAIL (isHallucinated: true).
3. If the draft misrepresents or contradicts the context, this is a FAIL (isHallucinated: true).

{format_instructions}
`);

function getChain() {
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.1-flash-lite",
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "dummy",
  });
  return RunnableSequence.from([
    verifyPromptTemplate,
    llm,
    parser,
  ]);
}

export async function verifyNode(state: AgentState): Promise<Partial<AgentState>> {
  const startTime = Date.now();
  console.log(`[Verify] Self-reflecting on draft response...`);

  // If intent was direct chat, skip verification against context
  if (state.intent === 'direct_chat') {
    return {
      verificationPassed: true,
      latencies: { ...state.latencies, verify: 0 }
    };
  }

  // If we already hit max retries, force pass to prevent infinite loops, 
  // but we could theoretically add a warning to the draft here.
  if (state.retryCount >= 2) {
    console.warn(`[Verify] Max retries reached. Forcing pass.`);
    return {
      verificationPassed: true,
      latencies: { ...state.latencies, verify: Date.now() - startTime }
    };
  }

  try {
    const formattedContext = state.compressedContext || "No context retrieved.";
    const chain = getChain();
    const analysis = await chain.invoke({
      context: formattedContext,
      draft: state.draftResponse || "",
      format_instructions: parser.getFormatInstructions(),
    });

    const latency = Date.now() - startTime;
    console.log(`[Verify] isHallucinated: ${analysis.isHallucinated} | Latency: ${latency}ms`);
    console.log(`[Verify] Reasoning: ${analysis.reasoning}`);

    if (analysis.isHallucinated) {
      return {
        verificationPassed: false,
        correctionInstructions: analysis.correctionInstructions || "Remove all facts not supported by the context.",
        retryCount: state.retryCount + 1,
        latencies: { ...state.latencies, verify: latency }
      };
    } else {
      return {
        verificationPassed: true,
        correctionInstructions: undefined,
        latencies: { ...state.latencies, verify: latency }
      };
    }

  } catch (error) {
    console.error("[Verify] Verification failed, defaulting to PASS to prevent deadlock.", error);
    return {
      verificationPassed: true,
      latencies: { ...state.latencies, verify: Date.now() - startTime }
    };
  }
}
