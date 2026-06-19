import { useState, useCallback } from 'react';
import { agentEventBus, AgentStreamEvent } from '@/lib/events/AgentEventBus';
import { chatStateMachine } from '@/lib/events/ChatStateMachine';

export function useAgentStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This is a mock function to simulate the SSE endpoint for Phase 1
  const submitQueryMock = useCallback(async (query: string, workspaceId: string) => {
    setIsStreaming(true);
    setError(null);
    chatStateMachine.transition('SUBMITTING');

    // Helper to emit events
    const emit = (event: Omit<AgentStreamEvent, 'id' | 'timestamp'>) => {
      agentEventBus.publish({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...event
      });
    };

    // Simulate Network Latency
    await new Promise(r => setTimeout(r, 500));
    chatStateMachine.transition('ANALYZING');
    emit({ type: 'agent_started' });

    await new Promise(r => setTimeout(r, 800));
    emit({ 
      type: 'query_analyzed', 
      payload: { intent: 'RAG', entities: ['System Architecture', 'Performance'] } 
    });

    chatStateMachine.transition('RETRIEVING');
    emit({ type: 'document_retrieval_started' });

    await new Promise(r => setTimeout(r, 1200));
    emit({ 
      type: 'document_retrieval_completed', 
      payload: { count: 12 },
      metadata: { latency: 1200 }
    });

    chatStateMachine.transition('RERANKING');
    emit({ type: 'rerank_started' });

    await new Promise(r => setTimeout(r, 900));
    emit({ 
      type: 'rerank_completed',
      metadata: { latency: 900 }
    });

    chatStateMachine.transition('GENERATING');
    emit({ type: 'generation_started' });

    // Simulate streaming text chunks (for the chat interface to consume)
    const mockAnswer = "Based on the retrieved context, the system architecture supports asynchronous processing using Inngest, and implements a multi-tenant design with strict Row Level Security.";
    const chunks = mockAnswer.split(' ');
    
    for (const chunk of chunks) {
      await new Promise(r => setTimeout(r, 50));
      emit({
        type: 'generation_stream',
        payload: { text: chunk + ' ' }
      });
    }

    chatStateMachine.transition('VERIFYING');
    emit({ type: 'verification_started' });
    
    await new Promise(r => setTimeout(r, 800));
    emit({ type: 'verification_completed' });

    chatStateMachine.transition('COMPLETED');
    emit({ type: 'completed' });
    setIsStreaming(false);

  }, []);

  return {
    submitQueryMock,
    isStreaming,
    error
  };
}
