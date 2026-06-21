import { appGraph } from "@/lib/rag/agent/graph";

export const maxDuration = 60;

// Simple in-memory rate limiter (works per serverless instance)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

export async function POST(req: Request) {
  // Get IP or identifier for rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  let rateInfo = rateLimitMap.get(ip);
  if (!rateInfo || rateInfo.resetTime < now) {
    rateInfo = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
  } else {
    rateInfo.count++;
  }
  rateLimitMap.set(ip, rateInfo);

  if (rateInfo.count > MAX_REQUESTS_PER_WINDOW) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429 });
  }

  const { query, workspaceId, targetDocumentId, researchMode } = await req.json();

  if (!query || typeof query !== 'string' || !query.trim() || !workspaceId) {
    return new Response(JSON.stringify({ error: "Missing or invalid query or workspaceId" }), { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const initialState = {
          query,
          workspaceId,
          targetDocumentId: targetDocumentId || null,
          queryEmbedding: [],
          retrievedChunks: [],
          generation: "",
          hallucinated: false,
          verificationResult: null,
          researchMode: researchMode || false,
          startTime: Date.now(),
          loopCount: 0
        };

        const config = { configurable: { thread_id: "demo-thread" } };

        // Stream from LangGraph
        for await (const chunk of await appGraph.stream(initialState, config)) {
          // chunk is an object with the node name as the key, e.g. { queryAnalyzer: { ... } }
          const nodeName = Object.keys(chunk)[0];
          const payload = (chunk as any)[nodeName];

          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ node: nodeName, payload })}\n\n`)
          );
        }

        controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        console.error("LangGraph Streaming Error:", error);
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ error: "Internal Server Error" })}\n\n`)
        );
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
