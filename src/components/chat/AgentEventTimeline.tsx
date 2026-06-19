'use client';

import React, { useEffect, useState } from 'react';
import { AgentStreamEvent, agentEventBus } from '@/lib/events/AgentEventBus';
import { Loader2, CheckCircle2, Search, FileText, BrainCircuit, ShieldCheck, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AgentEventTimeline() {
  const [events, setEvents] = useState<AgentStreamEvent[]>([]);

  useEffect(() => {
    const unsubscribe = agentEventBus.subscribe('*', (event) => {
      // If we see a "completed" or "failed" event, we might clear or finalize the list
      // For now, let's just append
      setEvents(prev => {
        // Prevent duplicate events based on ID
        if (prev.some(e => e.id === event.id)) return prev;
        return [...prev, event];
      });
    });

    return unsubscribe;
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <BrainCircuit className="w-4 h-4" />
          Agent Execution
        </h4>
        {events[events.length - 1]?.type === 'completed' && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Finished</span>
        )}
      </div>
      
      <div className="flex flex-col gap-3 font-mono text-sm">
        <AnimatePresence>
          {events.map((event, index) => {
            const isLast = index === events.length - 1;
            const isCompletedOrFailed = event.type === 'completed' || event.type === 'failed';
            
            return (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5">
                  {getIconForEventType(event.type, isLast && !isCompletedOrFailed)}
                </div>
                <div className="flex flex-col">
                  <span className={`
                    ${isLast && !isCompletedOrFailed ? 'text-blue-700 font-medium' : 'text-slate-600'}
                    ${event.type === 'failed' ? 'text-red-600' : ''}
                  `}>
                    {formatEventMessage(event)}
                  </span>
                  {event.metadata?.latency && (
                    <span className="text-xs text-slate-400 mt-0.5">{event.metadata.latency}ms</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function getIconForEventType(type: string, isRunning: boolean) {
  if (type === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
  if (type === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (isRunning) return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
  
  if (type.includes('query')) return <BrainCircuit className="w-4 h-4 text-slate-400" />;
  if (type.includes('retrieval') || type.includes('search')) return <Search className="w-4 h-4 text-slate-400" />;
  if (type.includes('rerank')) return <FileText className="w-4 h-4 text-slate-400" />;
  if (type.includes('verification')) return <ShieldCheck className="w-4 h-4 text-slate-400" />;
  
  return <div className="w-4 h-4 rounded-full border border-slate-300" />;
}

function formatEventMessage(event: AgentStreamEvent): string {
  switch (event.type) {
    case 'agent_started': return 'Initializing agent workflow...';
    case 'query_analyzed': return `Analyzed intent: ${event.payload?.intent || 'Unknown'}`;
    case 'document_retrieval_started': return 'Searching isolated knowledge base...';
    case 'document_retrieval_completed': return `Retrieved ${event.payload?.count || 0} relevant chunks.`;
    case 'graph_retrieval_started': return 'Traversing knowledge graph relationships...';
    case 'graph_retrieval_completed': return 'Graph traversal complete.';
    case 'rerank_started': return 'Reranking context with cross-encoder...';
    case 'rerank_completed': return 'Context successfully pruned and compressed.';
    case 'generation_started': return 'Synthesizing response...';
    case 'verification_started': return 'Self-reflecting and verifying facts against sources...';
    case 'verification_completed': return 'Verification passed.';
    case 'completed': return 'Execution complete.';
    case 'failed': return `Execution failed: ${event.payload?.error || 'Unknown error'}`;
    default: return event.type.replace(/_/g, ' ');
  }
}
