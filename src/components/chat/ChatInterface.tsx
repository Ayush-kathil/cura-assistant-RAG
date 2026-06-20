'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStream } from '@/hooks/useAgentStream';
import { useChatSession } from '@/hooks/useChatSession';
import { AgentEventTimeline } from './AgentEventTimeline';
import { CitationDrawer, CitationData } from './CitationDrawer';
import { chatStateMachine, ChatState } from '@/lib/events/ChatStateMachine';
import { agentEventBus } from '@/lib/events/AgentEventBus';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Send, Bot, User, Loader2, StopCircle, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterface(props: any) {
  const { messages, setMessages, saveUserMessage, saveAssistantMessage, currentSessionId } = props;
  const [inputValue, setInputValue] = useState('');
  const [chatState, setChatState] = useState<ChatState>('IDLE');
  
  // SSE Streaming Hook
  const { submitQuery, isStreaming, error } = useAgentStream();
  const { documents } = useChatSession();
  const { activeWorkspace } = useWorkspace();
  
  // Document Mention State
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [targetDocumentId, setTargetDocumentId] = useState<string | null>(null);
  const [selectedDocumentName, setSelectedDocumentName] = useState<string | null>(null);

  // Citation State
  const [isCitationOpen, setIsCitationOpen] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationData | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const currentGenerationRef = useRef<string>("");
  const activeSessionRef = useRef<string | null>(null);

  // Sync activeSessionRef with props
  useEffect(() => {
    activeSessionRef.current = currentSessionId;
  }, [currentSessionId]);

  // Subscribe to State Machine & Event Bus for Streaming text
  useEffect(() => {
    const unsubscribeState = chatStateMachine.subscribe((state) => {
      setChatState(state);
    });

    const unsubscribeBus = agentEventBus.subscribe('*', (event) => {
      if (event.type === 'generation_stream' && event.payload?.text) {
        currentGenerationRef.current = event.payload.text;
        setMessages((prev: any) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: event.payload!.text!
            };
            return newMessages;
          }
          return prev;
        });
      } else if (event.type === 'completed') {
        if (activeSessionRef.current && saveAssistantMessage) {
           saveAssistantMessage(activeSessionRef.current, currentGenerationRef.current);
        }
      }
    });

    return () => {
      unsubscribeState();
      unsubscribeBus();
    };
  }, [setMessages, saveAssistantMessage]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatState]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;

    let queryText = inputValue.trim();
    let currentTargetId = targetDocumentId;

    // Fallback: If user typed @filename manually without clicking the dropdown
    if (!currentTargetId) {
      const mentionedDoc = documents.find(doc => queryText.toLowerCase().includes(`@${doc.file_name.toLowerCase()}`));
      if (mentionedDoc) {
        currentTargetId = mentionedDoc.id;
      }
    }

    const userMsg = { id: crypto.randomUUID(), role: 'user', content: queryText };
    const initialAssistantMsg = { id: crypto.randomUUID(), role: 'assistant', content: '' };
    
    setMessages((prev: any) => [...prev, userMsg, initialAssistantMsg]);
    setInputValue('');
    setTargetDocumentId(null);
    setSelectedDocumentName(null);
    currentGenerationRef.current = "";

    if (saveUserMessage) {
       const sid = await saveUserMessage(queryText);
       activeSessionRef.current = sid;
    }

    // Call Real SSE Streaming Hook
    await submitQuery(queryText, activeWorkspace?.id || 'default-workspace', currentTargetId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Naive @ detection at the end of string
    const match = value.match(/@(\w*)$/);
    if (match) {
      setShowMentionMenu(true);
      setMentionQuery(match[1].toLowerCase());
    } else {
      setShowMentionMenu(false);
    }
  };

  const handleDocumentSelect = (docId: string, fileName: string) => {
    setTargetDocumentId(docId);
    setSelectedDocumentName(fileName);
    setInputValue(prev => prev.replace(/@\w*$/, '') + `@${fileName} `);
    setShowMentionMenu(false);
  };

  const filteredDocs = documents.filter(doc => doc.file_name.toLowerCase().includes(mentionQuery));

  return (
    <div className="flex flex-col h-full bg-white relative">
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
                      {msg.content === '' && chatState !== 'COMPLETED' ? (
                        <div className="flex items-center gap-2 text-slate-400">
                           <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                        </div>
                      ) : (
                        <ReactMarkdown>
                          {msg.content.replace(/\[(\d+)\]/g, '[$1](citation)')}
                        </ReactMarkdown>
                      )}
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

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-4 px-4 md:px-8">
        <div className="max-w-4xl mx-auto relative">
          
          {/* Document Mention Popover */}
          <AnimatePresence>
            {showMentionMenu && filteredDocs.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-2 left-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-2 bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-100">
                  Select Document Context
                </div>
                <div className="max-h-48 overflow-y-auto py-1">
                  {filteredDocs.map(doc => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => handleDocumentSelect(doc.id, doc.file_name)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 flex items-center gap-2 text-slate-700 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate">{doc.file_name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form 
            onSubmit={handleSubmit}
            className="relative bg-white border border-slate-300 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all"
          >
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask the Agentic AI (Type @ to mention a PDF)..."
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
          <div className="text-center mt-2 flex justify-between">
            <span className="text-xs text-slate-400">Target Document: {selectedDocumentName || 'All Documents'}</span>
            <span className="text-xs text-slate-400">Agentic Platform | Engine Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
