export type AgentEventType = 
  | 'agent_started'
  | 'query_analyzed'
  | 'memory_loaded'
  | 'document_retrieval_started'
  | 'document_retrieval_completed'
  | 'graph_retrieval_started'
  | 'graph_retrieval_completed'
  | 'web_search_started'
  | 'web_search_completed'
  | 'rerank_started'
  | 'rerank_completed'
  | 'generation_started'
  | 'generation_stream'
  | 'verification_started'
  | 'verification_completed'
  | 'completed'
  | 'failed';

export interface AgentStreamEvent {
  id: string;
  type: AgentEventType;
  timestamp: string;
  metadata?: any; 
  payload?: any;
}

// Simple Singleton Event Bus for Frontend Architecture
type EventCallback = (event: AgentStreamEvent) => void;

class EventBus {
  private listeners: Record<string, EventCallback[]> = {};

  subscribe(eventType: AgentEventType | '*', callback: EventCallback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);

    return () => this.unsubscribe(eventType, callback);
  }

  unsubscribe(eventType: AgentEventType | '*', callback: EventCallback) {
    if (!this.listeners[eventType]) return;
    this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
  }

  publish(event: AgentStreamEvent) {
    // Publish to specific event type listeners
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach(cb => cb(event));
    }
    // Publish to wildcard listeners
    if (this.listeners['*']) {
      this.listeners['*'].forEach(cb => cb(event));
    }
  }
}

export const agentEventBus = new EventBus();
