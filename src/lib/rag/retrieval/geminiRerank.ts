import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { RetrievedChunk } from "./hybridSearch";

const rerankSchema = z.object({
  rankings: z.array(z.object({
    chunkId: z.string(),
    score: z.number().min(0).max(1)
  }))
});

export async function geminiRerank(query: string, chunks: RetrievedChunk[]): Promise<RetrievedChunk[]> {
  if (chunks.length === 0) return [];
  
  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "dummy",
  });

  const parser = StructuredOutputParser.fromZodSchema(rerankSchema);

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a retrieval reranking engine.

Given a user query and candidate chunks:
1. Score each chunk from 0-1.
2. Rank chunks by relevance.
3. Prioritize factual support.
4. Penalize redundancy.

Return JSON only matching this format:
{format_instructions}`],
    ["human", `Query: {query}

Candidate Chunks:
{chunks}`]
  ]);

  const formattedChunks = chunks.map((c, i) => `Chunk [ID: ${c.id}]:\n${c.content}`).join('\n\n');

  try {
    const response = await prompt.pipe(llm).pipe(parser).invoke({
      query,
      chunks: formattedChunks,
      format_instructions: parser.getFormatInstructions()
    });

    const scoresMap = new Map<string, number>();
    response.rankings.forEach(r => scoresMap.set(r.chunkId, r.score));

    return chunks
      .map(c => ({
        ...c,
        similarity: scoresMap.get(c.id) ?? 0
      }))
      .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));

  } catch (err) {
    console.error("Gemini Reranking failed:", err);
    return chunks; // Fallback to original order
  }
}
