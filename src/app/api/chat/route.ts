import { appGraph } from "@/lib/rag/agent/graph";

export async function POST(req: Request) {
  const { query, workspaceId } = await req.json();

  if (!query || !workspaceId) {
    return new Response(JSON.stringify({ error: "Missing query or workspaceId" }), { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const initialState = {
          query,
          workspaceId,
          queryEmbedding: [],
          retrievedChunks: [],
          generation: "",
          hallucinated: false,
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
