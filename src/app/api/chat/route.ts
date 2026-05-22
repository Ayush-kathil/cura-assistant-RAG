import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, contextChunks, apiKey } = await req.json();

    if (!apiKey) {
      return new Response("API Key is missing", { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const contextStr = contextChunks && contextChunks.length > 0 
      ? `\n\nCONTEXT INFORMATION:\n${contextChunks.map((c: any) => `--- Chunk ${c.chunk.chunkIndex} ---\n${c.chunk.text}`).join("\n\n")}\n\nBased ONLY on the above context information, answer the user query: ${prompt}`
      : prompt;

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: contextStr }] }],
      systemInstruction: `You are an elite AI assistant named Cura. Use the provided context to answer questions accurately. 
If the context does not contain the answer, say you do not know based on the provided document.
Do not use raw chunk text citations in your response text. Synthesize the answer fluidly without mentioning "Chunk X" or "Source X".`,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            controller.enqueue(new TextEncoder().encode(chunk.text()));
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
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
  } catch (error: any) {
    console.error("API Route Error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
