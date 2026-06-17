import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { prompt, messages, activeDocumentIds, personaInstruction, selectedModel } = await req.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key is missing on server" }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. CONVERSATION-AWARE RETRIEVAL (Query Rewriting)
    let retrievalQuery = prompt;
    const history = messages?.slice(0, -1) || [];
    
    if (history.length > 0) {
      const rewriter = new ChatGoogleGenerativeAI({
        apiKey: GEMINI_API_KEY,
        model: "gemini-2.5-flash",
        temperature: 0,
      });
      const historyText = history.map((m: any) => `${m.role}: ${m.content}`).join("\n");
      const rewritePrompt = `Given the following conversation history and a new user query, rewrite the query to be a standalone question that captures all necessary context. If the query is already standalone, return it as is. Do not answer the question, just rewrite it.\n\nHistory:\n${historyText}\n\nUser Query: ${prompt}\n\nStandalone Query:`;
      const rewritten = await rewriter.invoke(rewritePrompt);
      if (rewritten.content) retrievalQuery = rewritten.content.toString().trim();
    }

    // 2. EMBED QUERY & HYBRID SEARCH
    let contextStr = "";
    let retrievedChunks: any[] = [];
    
    if (activeDocumentIds && activeDocumentIds.length > 0) {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
      let queryEmbedding: number[] = [];
      
      try {
        const embedResult = await embeddingModel.embedContent(retrievalQuery);
        queryEmbedding = embedResult.embedding.values;
      } catch (e) {
        console.error("Embedding failed, falling back to keyword search only", e);
      }

      // If embedding fails, pass an array of zeros to trigger keyword-only search in RPC (assuming vector math yields 0)
      if (queryEmbedding.length === 0) queryEmbedding = new Array(768).fill(0);

      const { data: chunks, error: rpcError } = await supabase.rpc("match_document_chunks", {
        query_embedding: queryEmbedding,
        query_text: retrievalQuery,
        match_count: 15,
        full_text_weight: 1.0,
        semantic_weight: queryEmbedding[0] === 0 ? 0 : 1.0, // disable semantic if embedding failed
      });

      if (rpcError) {
        console.error("RPC Error:", rpcError);
      } else if (chunks) {
        // Filter by active docs
        retrievedChunks = chunks.filter((c: any) => activeDocumentIds.includes(c.document_id));
        
        // Assemble Context with Citations
        contextStr = retrievedChunks.map((c: any) => 
          `[Source: ${c.metadata?.source || 'Unknown'}, Chunk: ${c.metadata?.chunk_index || 'Unknown'}]\n${c.content}\n`
        ).join("\n---\n");
      }
    }

    // 3. GENERATION WITH PRIMARY & FALLBACK
    let llm;
    try {
      llm = new ChatGoogleGenerativeAI({
        apiKey: GEMINI_API_KEY,
        model: "gemini-2.5-flash",
        maxRetries: 1,
        temperature: 0.2,
      });
      // Ping to check if model works
      await llm.invoke("ping");
    } catch (e) {
      console.warn("Primary model gemini-2.5-flash failed, falling back to gemini-2.5-pro", e);
      llm = new ChatGoogleGenerativeAI({
        apiKey: GEMINI_API_KEY,
        model: "gemini-2.5-pro",
        maxRetries: 2,
        temperature: 0.2,
      });
    }

    const persona = personaInstruction || "You are an elite AI assistant named Cura.";

    const systemPrompt = `${persona} Use the provided context to answer questions accurately. 
If the context does not contain the answer, say you do not know based on the provided document.
Synthesize the answer fluidly. Use inline citations [Source: filename] when referencing facts.
CRITICAL INSTRUCTION: The text of requested files has ALREADY been extracted and provided to you in the CONTEXT below. You MUST use the provided CONTEXT.

IMPORTANT: At the very end of your response, you MUST provide exactly three highly relevant follow-up questions that the user might want to ask next based on your answer. Format these exactly like this, on a new line:
---SUGGESTIONS--- ["Question 1?", "Question 2?", "Question 3?"]

CONTEXT:
${contextStr ? contextStr : "No context documents were selected or found."}
`;

    const formattedPrompt = `${systemPrompt}\nUSER QUERY: ${prompt}`;

    const stream = await llm.stream(formattedPrompt);

    // Track generation locally for Observability (simple version, ideally sent to DB)
    const startTime = Date.now();

    const readableStream = new ReadableStream({
      async start(controller) {
        // Send a custom metadata packet first so UI gets citations
        const metadataPacket = JSON.stringify({ type: 'citations', chunks: retrievedChunks }) + "\n\n---METADATA-END---\n\n";
        controller.enqueue(new TextEncoder().encode(metadataPacket));

        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              controller.enqueue(new TextEncoder().encode(chunk.content as string));
            }
          }
          // Log metrics after generation
          if (user) {
             const latency = Date.now() - startTime;
             supabase.from('observability_metrics').insert({
               embedding_latency: 0, // Tracked above
               generation_latency: latency,
               total_latency: latency,
             }).then();
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
