import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, contextChunks, apiKey, personaInstruction, selectedModel } = await req.json();

    const finalApiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!finalApiKey) {
      return new Response("API Key is missing", { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(finalApiKey);
    let defaultFallbackModels = ["gemini-3.5-flash", "gemini-3.1-pro", "gemini-2.5-flash-lite"];

    // Map UI friendly names to actual Google model names
    let requestedModelId = "gemini-3.5-flash";
    if (selectedModel === "Gemini 3.1 Pro") requestedModelId = "gemini-3.1-pro";
    else if (selectedModel === "Gemini 2.5 Flash-Lite") requestedModelId = "gemini-2.5-flash-lite";
    
    // Put the user's selected model at the top of the fallback queue
    const fallbackModels = [requestedModelId, ...defaultFallbackModels.filter(m => m !== requestedModelId)];

    const contextStr = contextChunks && contextChunks.length > 0 
      ? `\n\nCONTEXT INFORMATION:\n${contextChunks.map((c: any) => `--- Chunk ${c.chunk.chunkIndex} ---\n${c.chunk.text}`).join("\n\n")}\n\nBased ONLY on the above context information, answer the user query: ${prompt}`
      : prompt;

    const persona = personaInstruction || "You are an elite AI assistant named Cura.";

    let result;
    let lastError = null;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContentStream({
          contents: [{ role: "user", parts: [{ text: contextStr }] }],
          systemInstruction: `${persona} Use the provided context to answer questions accurately. 
If the context does not contain the answer, say you do not know based on the provided document.
Do not use raw chunk text citations in your response text. Synthesize the answer fluidly without mentioning "Chunk X" or "Source X".
IMPORTANT: At the very end of your response, you MUST provide exactly three highly relevant follow-up questions that the user might want to ask next based on your answer. Format these exactly like this, on a new line:
---SUGGESTIONS--- ["Question 1?", "Question 2?", "Question 3?"]`,
        });
        
        // If successful, break out of the loop
        break;
      } catch (apiError: any) {
        lastError = apiError;
        const isQuota = apiError?.status === 429 || apiError?.message?.includes("429") || apiError?.message?.includes("Quota exceeded");
        
        // If it's a quota error, continue to the next model
        if (isQuota) {
          console.warn(`[Quota Exceeded] Model ${modelName} hit limit. Falling back to next model...`);
          continue;
        } else {
          // If it's a different error, break and throw it immediately
          break;
        }
      }
    }

    if (!result) {
      console.error("Gemini API Error (All models exhausted):", lastError);
      const isQuota = lastError?.status === 429 || lastError?.message?.includes("429") || lastError?.message?.includes("Quota exceeded");
      return new Response(
        isQuota 
          ? "API Quota Exceeded across all fallback models. Please wait or update your billing details."
          : `AI Generation Error: ${lastError?.message || 'Unknown error'}`, 
        { status: isQuota ? 429 : 500 }
      );
    }

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
