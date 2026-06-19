// @ts-nocheck
import { inngest } from "../client";
import { createClient } from "@supabase/supabase-js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321");
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_key");

const entitySchema = z.object({
  entities: z.array(z.object({
    name: z.string().describe("The exact name of the entity found in text"),
    type: z.enum(['person', 'organization', 'concept', 'technology']),
    confidence: z.number().min(0).max(1).describe("Confidence score (0.0 to 1.0)")
  })),
  relationships: z.array(z.object({
    source: z.string().describe("Source entity name"),
    target: z.string().describe("Target entity name"),
    relationship_type: z.string().describe("Verb representing the relationship, e.g. 'founder_of'"),
    confidence: z.number().min(0).max(1)
  }))
});

const parser = StructuredOutputParser.fromZodSchema(entitySchema);
const prompt = PromptTemplate.fromTemplate(`
You are a Knowledge Graph Extraction Engine.
Extract entities and relationships from the following chunk.
{format_instructions}

Chunk:
{chunk}
`);

export const extractGraphWorkflow = inngest.createFunction(
  { 
    id: "extract-graph", 
    event: "doc.extract_graph",
    concurrency: { limit: 10 }, 
    retries: 3,
    onFailure: async ({ event, step }: { event: any, step: any }) => {
      await step.sendEvent("emit-failure", {
        name: "doc.graph_extraction_failed",
        data: { chunkId: event.data.event.data.chunkId, error: event.data.error.message }
      });
    }
  },
  async ({ event, step }: { event: any, step: any }) => {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { workspaceId, chunkId, content } = event.data;

    // STEP 1: ENTITY EXTRACTION
    const rawGraph = await step.run("extract-entities", async () => {
      const llm = new ChatGoogleGenerativeAI({ model: "gemini-1.5-flash", temperature: 0 });
      const chain = prompt.pipe(llm).pipe(parser);
      return await chain.invoke({
        chunk: content,
        format_instructions: parser.getFormatInstructions()
      });
    });

    // STEP 2: ENTITY RESOLUTION & CANONICALIZATION
    const resolvedEntities = await step.run("resolve-entities", async () => {
      const resolved = [];
      for (const entity of rawGraph.entities) {
        if (entity.confidence < 0.6) continue; // Drop low confidence
        
        // Very basic resolution logic for demonstration.
        // In production, this would query a vector store of existing canonical names or use an LLM pass.
        const canonicalName = entity.name.replace(/ Inc\.?| Corp\.?| LLC/g, '').trim();
        
        resolved.push({
          canonical_name: canonicalName,
          original_alias: entity.name,
          type: entity.type,
          confidence: entity.confidence
        });
      }
      return resolved;
    });

    // STEP 3: GRAPH CONSOLIDATION & STORAGE
    await step.run("consolidate-and-store", async () => {
      const entityIdMap = new Map<string, string>();

      // Upsert Entities
      for (const ent of resolvedEntities) {
        const { data, error } = await supabase.rpc('upsert_entity', {
           p_workspace_id: workspaceId,
           p_canonical_name: ent.canonical_name,
           p_alias: ent.original_alias,
           p_type: ent.type,
           p_confidence: ent.confidence
        });
        
        // Assuming rpc returns the UUID
        if (data && !error) entityIdMap.set(ent.original_alias, data);
      }

      // Upsert Relationships
      for (const rel of rawGraph.relationships) {
        if (rel.confidence < 0.6) continue;
        
        const sourceId = entityIdMap.get(rel.source);
        const targetId = entityIdMap.get(rel.target);
        
        if (sourceId && targetId) {
          await supabase.rpc('upsert_relationship', {
             p_source_id: sourceId,
             p_target_id: targetId,
             p_rel_type: rel.relationship_type,
             p_confidence: rel.confidence,
             p_chunk_id: chunkId
          });
        }
      }
    });

    return { success: true, entitiesResolved: resolvedEntities.length };
  }
);
