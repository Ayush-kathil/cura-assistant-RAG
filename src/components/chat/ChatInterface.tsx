'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStream } from '@/hooks/useAgentStream';
import { AgentEventTimeline } from './AgentEventTimeline';
import { CitationDrawer, CitationData } from './CitationDrawer';
import { chatStateMachine, ChatState } from '@/lib/events/ChatStateMachine';
import { Send, Bot, User, Loader2, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatState, setChatState] = useState<ChatState>('IDLE');
  
  // SSE Streaming Hook
  const { submitQueryMock, isStreaming, error } = useAgentStream();
  
  // Citation State
  const [isCitationOpen, setIsCitationOpen] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationData | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to State Machine
  useEffect(() => {
    const unsubscribe = chatStateMachine.subscribe((state) => {
      setChatState(state);
    });
    return unsubscribe;
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatState]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Trigger Mock SSE Streaming Workflow
    await submitQueryMock(userMsg.content, 'default-workspace');
    
    // Once complete, we'd normally append the final LLM response here.
    // For Phase 1 mock, we just add a static completion.
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: "Based on the retrieved context, the system architecture supports asynchronous processing using Inngest, and implements a multi-tenant design with strict Row Level Security. [1]"
    }]);
  };

  const handleCitationClick = () => {
    setActiveCitation({
      id: 'mock-1',
      sourceFile: 'Architecture_Design.md',
      pageNumber: 4,
      snippet: 'The system architecture supports asynchronous processing using Inngest, and implements a multi-tenant design with strict Row Level Security.',
      confidenceScore: 0.92,
      similarChunks: [
        { id: 'mock-2', snippet: 'Inngest allows us to bypass Vercel serverless timeouts.' }
      ]
    });
    setIsCitationOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      
      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8" ref={scrollRef}>
        <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-32">
          
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 mt-1">
                    <Bot className="w-5 h-5 text-blue-700" />
                  </div>
                )}
                
                <div className={`
                  max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 
                  ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-sm'
                  }
                `}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-slate prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => {
                            if (props.children?.toString().match(/\[\d+\]/)) {
                              return (
                                <button 
                                  onClick={handleCitationClick}
                                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mx-1 hover:bg-blue-200 transition-colors"
                                >
                                  {props.children?.toString().replace(/[\[\]]/g, '')}
                                </button>
                              );
                            }
                            return <a {...props} className="text-blue-600 hover:underline" />;
                          }
                        }}
                      >
                        {msg.content.replace(/\[(\d+)\]/g, '[$1](citation)')}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 mt-1">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Agent Execution Visualizer (Only visible when streaming or recently completed) */}
          {chatState !== 'IDLE' && chatState !== 'SUBMITTING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-12">
              <AgentEventTimeline />
            </motion.div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">
              {error}
            </div>
          )}

        </div>
      </div>

      {/* Unified Input Area */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-4 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className="relative bg-white border border-slate-300 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all"
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask the Agentic AI..."
              className="w-full max-h-48 min-h-[56px] resize-none border-0 bg-transparent py-4 pl-4 pr-14 text-slate-800 placeholder:text-slate-400 focus:ring-0 outline-none"
              rows={1}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              {isStreaming ? (
                <button
                  type="button"
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                >
                  <StopCircle className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
          <div className="text-center mt-2">
            <span className="text-xs text-slate-400">Agentic Platform | v1.5 Frontend Architecture</span>
          </div>
        </div>
      </div>

      {/* Citation Drawer */}
      <CitationDrawer 
        isOpen={isCitationOpen} 
        citation={activeCitation} 
        onClose={() => setIsCitationOpen(false)} 
      />
    </div>
  );
}
