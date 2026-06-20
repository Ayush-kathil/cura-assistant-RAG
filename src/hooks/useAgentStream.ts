import { useState, useCallback } from 'react';
import { agentEventBus, AgentStreamEvent } from '@/lib/events/AgentEventBus';
import { chatStateMachine } from '@/lib/events/ChatStateMachine';

export function useAgentStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitQueryMock = useCallback(async (query: string, workspaceId: string, targetDocumentId?: string | null) => {
    setIsStreaming(true);
    setError(null);
    chatStateMachine.transition('SUBMITTING');

    const emit = (event: Omit<AgentStreamEvent, 'id' | 'timestamp'>) => {
      agentEventBus.publish({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...event
      });
    };

    chatStateMachine.transition('ANALYZING');
    emit({ type: 'agent_started' });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, workspaceId, targetDocumentId }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let generationBuffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkString = decoder.decode(value, { stream: true });
          const events = chunkString.split('\n\n').filter(Boolean);
          
          for (const ev of events) {
            if (ev.startsWith('data: ')) {
              const dataStr = ev.replace('data: ', '');
              if (dataStr === '[DONE]') {
                 chatStateMachine.transition('COMPLETED');
                 emit({ type: 'completed' });
                 break;
              }
              try {
                const data = JSON.parse(dataStr);
                
                if (data.node === 'queryAnalyzer') {
                  emit({ type: 'query_analyzed', payload: { intent: 'RAG', entities: [] } });
                  chatStateMachine.transition('RETRIEVING');
                  emit({ type: 'document_retrieval_started' });
                } else if (data.node === 'retrieve') {
                  const chunkCount = data.payload?.retrievedChunks?.length || 0;
                  emit({ type: 'document_retrieval_completed', payload: { count: chunkCount } });
                  chatStateMachine.transition('GENERATING');
                  emit({ type: 'generation_started' });
                } else if (data.node === 'generate') {
                  // If the node completed generation, we emit the stream event
                  // In LangGraph, we just get the whole generation string at the end of the node.
                  const fullText = data.payload?.generation || "";
                  emit({ type: 'generation_stream', payload: { text: fullText } });
                  chatStateMachine.transition('VERIFYING');
                  emit({ type: 'verification_started' });
                } else if (data.node === 'verify') {
                  emit({ type: 'verification_completed' });
                }
              } catch(err) {
                console.error("Failed to parse SSE event", err);
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
      chatStateMachine.transition('IDLE');
    } finally {
      setIsStreaming(false);
    }

  }, []);

  return {
    submitQueryMock, // Keeping the same name to avoid breaking ChatInterface references before we update it
    submitQuery: submitQueryMock,
    isStreaming,
    error
  };
}
