import { SupabaseClient } from '@supabase/supabase-js';

export interface RetrievalTelemetryData {
  workspaceId: string;
  sessionId: string;
  query: string;
  queryVariants: string[];
  vectorLatencyMs: number;
  rerankLatencyMs: number;
  totalLatencyMs: number;
  chunksRetrieved: number;
  chunksPostRerank: number;
}

export class RetrievalTelemetry {
  /**
   * Logs telemetry data to the retrieval_metrics table in Supabase.
   * This operates asynchronously and should not block the main retrieval thread.
   */
  async log(supabase: SupabaseClient, data: RetrievalTelemetryData): Promise<void> {
    try {
      // Fire and forget, we don't await this if we want to minimize latency overhead,
      // but wrapping it in a try-catch ensures any DB errors don't crash the LangGraph.
      const { error } = await supabase.from('retrieval_metrics').insert([{
        workspace_id: data.workspaceId,
        session_id: data.sessionId,
        query: data.query,
        query_variants: data.queryVariants,
        vector_latency_ms: data.vectorLatencyMs,
        rerank_latency_ms: data.rerankLatencyMs,
        total_latency_ms: data.totalLatencyMs,
        chunks_retrieved: data.chunksRetrieved,
        chunks_post_rerank: data.chunksPostRerank
      }]);

      if (error) {
        console.error('[Telemetry] Failed to log retrieval metrics:', error.message);
      }
    } catch (err) {
      console.error('[Telemetry] Exception logging retrieval metrics:', err);
    }
  }
}

export const retrievalTelemetry = new RetrievalTelemetry();
