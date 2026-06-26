import { createClient } from "@/utils/supabase/server";

export interface TraceEvent {
  workspaceId: string;
  sessionId: string;
  runId: string;
  nodeName: string;
  inputPayload?: any;
  outputPayload?: any;
  latencyMs: number;
  status: 'started' | 'completed' | 'failed';
}

export interface CostEvent {
  workspaceId: string;
  userId: string;
  sessionId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  operationType: 'embedding' | 'rerank' | 'generation' | 'web_search';
}

export class TelemetryTracer {
  
  static async logTrace(event: TraceEvent) {
    try {
      const supabase = await createClient();
      await supabase.from('traces').insert({
        workspace_id: event.workspaceId,
        session_id: event.sessionId,
        run_id: event.runId,
        node_name: event.nodeName,
        input_payload: event.inputPayload,
        output_payload: event.outputPayload,
        latency_ms: event.latencyMs,
        status: event.status
      });
    } catch (err) {
      console.error("Failed to log trace", err);
    }
  }

  static async logCost(event: CostEvent) {
    try {
      const supabase = await createClient();
      // Calculate generic cost approximation
      let costPer1kInput = 0;
      let costPer1kOutput = 0;

      if (event.model.includes('gemini-2.5-pro')) {
        costPer1kInput = 0.0035;
        costPer1kOutput = 0.0105;
      } else if (event.model.includes('gemini-2.5-flash')) {
        costPer1kInput = 0.000075;
        costPer1kOutput = 0.0003;
      } else if (event.model.includes('gemini-embedding-2')) {
        costPer1kInput = 0.00002;
        costPer1kOutput = 0;
      }

      const costUsd = (event.inputTokens / 1000) * costPer1kInput + (event.outputTokens / 1000) * costPer1kOutput;

      await supabase.from('llm_costs').insert({
        workspace_id: event.workspaceId,
        user_id: event.userId,
        session_id: event.sessionId,
        model: event.model,
        input_tokens: event.inputTokens,
        output_tokens: event.outputTokens,
        cost_usd: costUsd,
        operation_type: event.operationType
      });
    } catch (err) {
      console.error("Failed to log cost", err);
    }
  }
}
