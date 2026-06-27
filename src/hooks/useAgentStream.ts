import { useState, useCallback, useRef } from 'react';
import { agentEventBus, AgentStreamEvent } from '@/lib/events/AgentEventBus';
import { chatStateMachine } from '@/lib/events/ChatStateMachine';

export function useAgentStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const submitQueryMock = useCallback(async (query: string, workspaceId: string, targetDocumentId?: string | null, researchMode: boolean = false) => {
    setIsStreaming(true);
    setError(null);
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
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
        body: JSON.stringify({ query, workspaceId, targetDocumentId, researchMode }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let sseBuffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          sseBuffer += decoder.decode(value, { stream: true });
          const parts = sseBuffer.split('\n\n');
          // The last element is either an empty string (if exactly ending in \n\n) or an incomplete chunk
          sseBuffer = parts.pop() || "";
          
          for (const ev of parts) {
            if (!ev.trim()) continue;
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
                  const chunks = data.payload?.retrievedChunks || [];
                  emit({ type: 'document_retrieval_completed', payload: { count: chunks.length, chunks } });
                  chatStateMachine.transition('GENERATING');
                  emit({ type: 'generation_started' });
                } else if (data.node === 'generate') {
                  const fullText = data.payload?.generation || "";
                  emit({ type: 'generation_stream', payload: { text: fullText } });
                  chatStateMachine.transition('VERIFYING');
                  emit({ type: 'verification_started' });
                } else if (data.node === 'verify') {
                  const payload = data.payload?.verificationResult;
                  emit({ type: 'verification_completed', payload: { verificationResult: payload } });
                }
              } catch(err) {
                console.error("Failed to parse SSE event", err, "Raw data:", dataStr);
              }
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        setError(err.message);
      }
      chatStateMachine.transition('IDLE');
    } finally {
      setIsStreaming(false);
    }

  }, []);

  const stopQuery = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    chatStateMachine.transition('IDLE');
  }, []);

  return {
    submitQueryMock, // Keeping the same name to avoid breaking ChatInterface references before we update it
    submitQuery: submitQueryMock,
    stopQuery,
    isStreaming,
    error
  };
}
