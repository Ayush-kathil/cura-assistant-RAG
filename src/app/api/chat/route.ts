import { NextRequest } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, contextStr, apiKey, personaInstruction, selectedModel } = await req.json();

    const finalApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!finalApiKey) {
      return new Response("API Key is missing", { status: 400 });
    }

    let requestedModelId = "gemini-2.5-flash";
    if (selectedModel === "Gemini 2.5 Pro") requestedModelId = "gemini-2.5-pro";
    else if (selectedModel === "Gemini 2.5 Flash-Lite") requestedModelId = "gemini-2.5-flash-lite";

    const llm = new ChatGoogleGenerativeAI({
      apiKey: finalApiKey,
      model: requestedModelId,
      maxRetries: 2,
      temperature: 0.2,
    });

    const persona = personaInstruction || "You are an elite AI assistant named Cura.";

    const systemPrompt = `${persona} Use the provided context to answer questions accurately. 
If the context does not contain the answer, say you do not know based on the provided document.
Synthesize the answer fluidly without mentioning "Chunk X" or "Source X" directly.
CRITICAL INSTRUCTION: The user may mention file names (like '@document.pdf') in their query. Do NOT refuse the request by saying you cannot read local files. The text of those files has ALREADY been extracted and provided to you in the CONTEXT below. You MUST use the provided CONTEXT to answer the query as if you have successfully read the file.

IMPORTANT: At the very end of your response, you MUST provide exactly three highly relevant follow-up questions that the user might want to ask next based on your answer. Format these exactly like this, on a new line:
---SUGGESTIONS--- ["Question 1?", "Question 2?", "Question 3?"]

CONTEXT:
{context}
`;

    const formattedPrompt = contextStr 
      ? systemPrompt.replace("{context}", contextStr) + `\nUSER QUERY: ${prompt}`
      : `${persona}\nCRITICAL INSTRUCTION: If the user mentions a file but no context is provided, explain that the file content was not found or not selected.\n\nUSER QUERY: ${prompt}`;

    const stream = await llm.stream(formattedPrompt);

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              controller.enqueue(new TextEncoder().encode(chunk.content as string));
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
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
