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
import { SplitPaneViewer } from '../pdf/SplitPaneViewer';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  verificationResult?: any[];
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  setMessages: any;
  saveUserMessage?: (msg: string) => Promise<string>;
  saveAssistantMessage?: (sessionId: string, msg: string) => Promise<void>;
  currentSessionId?: string | null;
  [key: string]: any;
}

export function ChatInterface(props: ChatInterfaceProps) {
  const { messages = [], setMessages, saveUserMessage, saveAssistantMessage, currentSessionId } = props;
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
  const [researchMode, setResearchMode] = useState(false);

  // Citation State
  const [isCitationOpen, setIsCitationOpen] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationData | null>(null);
  
  const [viewerDocumentId, setViewerDocumentId] = useState<string | null>(null);
  const [viewerCitationText, setViewerCitationText] = useState<string>("");

  const scrollRef = useRef<HTMLDivElement>(null);

  const currentGenerationRef = useRef<string>("");
  const activeSessionRef = useRef<string | null>(null);

  // Sync activeSessionRef with props
  useEffect(() => {
    activeSessionRef.current = currentSessionId || null;
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
      } else if (event.type === 'verification_completed' && event.payload?.verificationResult) {
        setMessages((prev: any) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              verificationResult: event.payload!.verificationResult
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
    await submitQuery(queryText, activeWorkspace?.id || 'default-workspace', currentTargetId, researchMode);
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

  const handleCitationClick = (citationMatch: string) => {
    // Attempt to extract the chunk ID, but for now we just show a placeholder doc ID "123" 
    // since we don't have the full chunk metadata in the UI yet.
    setViewerDocumentId("simulated-pdf-doc-123");
    setViewerCitationText(`Citation Reference: ${citationMatch}`);
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-col h-full bg-white relative flex-1 min-w-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8" ref={scrollRef}>
          <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-32">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-20 pb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="w-24 h-24 mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-3xl blur-xl opacity-40 animate-pulse" />
                <div className="w-full h-full bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center relative z-10">
                  <Bot className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <h2 className="text-4xl font-light text-slate-800 tracking-tight mb-4">
                How can I help you today?
              </h2>
              <p className="text-slate-500 font-light mb-12 max-w-lg">
                I am your intelligent companion. Mention a specific document with @ or ask me anything to search your entire workspace.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {["Summarize the latest quarterly report", "Extract key entities from the legal contract", "Explain the RAG architecture", "Find references to 'Project Apollo'"].map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => setInputValue(suggestion)}
                    className="p-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-600 text-left hover:border-blue-300 hover:shadow-md transition-all font-medium"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                        <ReactMarkdown
                          components={{
                            a: ({ node, ...props }) => {
                              if (props.href === 'citation') {
                                return (
                                  <a 
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); handleCitationClick(props.children?.toString() || ""); }}
                                    className="inline-flex items-center justify-center px-1.5 py-0.5 ml-1 text-[10px] font-bold bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors cursor-pointer"
                                  >
                                    {props.children}
                                  </a>
                                );
                              }
                              return <a {...props} />;
                            }
                          }}
                        >
                          {msg.content.replace(/\[(\d+)\]/g, '[$1](citation)')}
                        </ReactMarkdown>
                      )}
                      
                      {msg.verificationResult && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Citation Verification</p>
                          <ul className="text-xs space-y-1">
                            {msg.verificationResult.map((v: any, i: number) => (
                              <li key={i} className="flex flex-col mb-1">
                                <span className={`px-2 py-0.5 rounded font-bold self-start mb-1 ${
                                  v.status === 'Verified' ? 'bg-green-100 text-green-800' :
                                  v.status === 'Unsupported' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>{v.status}</span>
                                <span className="text-slate-600 italic">"{v.sentence}"</span>
                              </li>
                            ))}
                          </ul>
                        </div>
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

          <div className="relative p-[2px] rounded-[1.25rem] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] shadow-lg shadow-purple-500/20 transition-all focus-within:shadow-xl focus-within:shadow-purple-500/40">
            <form 
              onSubmit={handleSubmit}
              className="relative bg-white rounded-2xl overflow-hidden"
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
              <button
                type="button"
                onClick={() => setResearchMode(!researchMode)}
                className={`text-xs px-2 py-1.5 rounded-lg font-bold transition-colors ${researchMode ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                title="Enable deep research multi-hop reasoning"
              >
                {researchMode ? 'Research: ON' : 'Research: OFF'}
              </button>
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
          </div>
          <div className="text-center mt-3 flex justify-between">
            <span className="text-xs text-slate-400">Target Document: {selectedDocumentName || 'All Documents'}</span>
            <span className="text-xs text-slate-400">Agentic Platform | Engine Connected</span>
          </div>
        </div>
      </div>
      </div>
      <SplitPaneViewer 
        documentId={viewerDocumentId} 
        citationText={viewerCitationText} 
        onClose={() => setViewerDocumentId(null)} 
      />
    </div>
  );
}
