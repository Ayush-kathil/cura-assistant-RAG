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
import { Send, Bot, User, Loader2, StopCircle, FileText, Plus, ThumbsUp, ThumbsDown, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SplitPaneViewer } from '../pdf/SplitPaneViewer';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  verificationResult?: any[];
  sources?: any[];
  feedback?: 'up' | 'down';
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  setMessages: any;
  saveUserMessage?: (msg: string) => Promise<string>;
  saveAssistantMessage?: (sessionId: string, msg: string) => Promise<void>;
  currentSessionId?: string | null;
  onTriggerUpload?: () => void;
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

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputValue(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

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
      if (event.type === 'document_retrieval_completed' && event.payload?.chunks) {
        setMessages((prev: any) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              sources: event.payload.chunks
            };
            return newMessages;
          }
          return prev;
        });
      } else if (event.type === 'generation_stream' && event.payload?.text) {
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

    // Conversational Memory Windowing: Inject last 4 messages as context
    const memoryWindow = messages.slice(-4);
    let contextualQuery = queryText;
    
    if (memoryWindow.length > 0) {
      const transcript = memoryWindow.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      contextualQuery = `[Previous Chat Context]\n${transcript}\n\n[Current Question]\n${queryText}`;
    }

    // Call Real SSE Streaming Hook
    await submitQuery(contextualQuery, activeWorkspace?.id || 'default-workspace', currentTargetId, researchMode);
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
    setInputValue(prev => (prev || '').replace(/@\w*$/, '') + `@${fileName} `);
    setShowMentionMenu(false);
  };

  const handleFeedback = async (msgId: string, isPositive: boolean) => {
    try {
      const targetMsg = messages.find(m => m.id === msgId);
      if (!targetMsg || targetMsg.role !== 'assistant') return;

      const userMsgIdx = messages.findIndex(m => m.id === msgId) - 1;
      const userMsg = userMsgIdx >= 0 ? messages[userMsgIdx] : null;
      const queryText = userMsg?.content || "unknown query";

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, isPositive })
      });
      if (res.ok) {
        setMessages((prev: ChatMessage[]) => prev.map(m => m.id === msgId ? { ...m, feedback: isPositive ? 'up' : 'down' } : m));
      }
    } catch (e) {
      console.error("Failed to submit feedback", e);
    }
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
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 mt-1 border border-white/20">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`
                  max-w-[90%] md:max-w-[85%] rounded-3xl px-6 py-5
                  ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white shadow-md ml-auto' 
                    : 'bg-white border border-slate-100 text-slate-800 shadow-sm shadow-slate-200/50'
                  }
                `}>
                  {msg.role === 'assistant' ? (
                    <div className="max-w-none w-full">
                      {msg.content === '' && chatState !== 'COMPLETED' ? (
                        <div className="flex items-center gap-3 text-slate-400 font-medium">
                           <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> Thinking...
                        </div>
                      ) : (
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight border-b border-slate-100 pb-2" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3 tracking-tight" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-slate-800 mt-5 mb-2" {...props} />,
                            p: ({ node, ...props }) => <p className="text-slate-600 leading-[1.75] mb-5 text-justify" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-none space-y-2.5 mb-6 mt-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 space-y-2.5 mb-6 mt-2 text-slate-600" {...props} />,
                            li: ({ node, className, children, ...props }) => {
                              // If it's inside a ul, we add the custom bullet. If inside an ol, the native decimal is used.
                              const isUnordered = !className?.includes('list-decimal');
                              return (
                                <li className={`${isUnordered ? 'relative pl-6 text-slate-600 before:content-[""] before:absolute before:left-1.5 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-blue-400 before:rounded-full before:shadow-sm' : 'pl-2'}`} {...props}>
                                  {children}
                                </li>
                              );
                            },
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent text-slate-700 px-5 py-3 rounded-r-xl mb-6 italic" {...props} />,
                            code: ({ node, ...props }) => <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-md font-mono text-[13px] border border-slate-200/60" {...props} />,
                            a: ({ node, ...props }) => {
                              if (props.href === 'citation') {
                                const citationIdx = parseInt(props.children?.toString() || "1", 10) - 1;
                                const sourceChunk = msg.sources?.[citationIdx];
                                
                                return (
                                  <div className="relative inline-block group">
                                    <a 
                                      href="#"
                                      onClick={(e) => { e.preventDefault(); handleCitationClick(props.children?.toString() || ""); }}
                                      className="inline-flex items-center justify-center px-2 py-0.5 ml-1.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
                                    >
                                      {props.children}
                                    </a>
                                    {sourceChunk && (
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl opacity-0 invisible md:group-hover:opacity-100 md:group-hover:visible transition-all duration-200 z-50 pointer-events-none md:pointer-events-auto">
                                        <div className="font-semibold text-blue-300 mb-1">Source {citationIdx + 1}</div>
                                        <div className="line-clamp-4 leading-relaxed">{sourceChunk.content}</div>
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return <a className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors" {...props} />;
                            }
                          }}
                        >
                          {(msg.content || '').replace(/\[(\d+)\]/g, '[$1](citation)')}
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
                      
                      {/* RLHF Feedback Loop */}
                      {msg.content !== '' && chatState === 'COMPLETED' && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                          <button 
                            onClick={() => handleFeedback(msg.id, true)}
                            className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors ${msg.feedback === 'up' ? 'text-green-600 bg-green-50' : 'text-slate-400'}`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleFeedback(msg.id, false)}
                            className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors ${msg.feedback === 'down' ? 'text-red-600 bg-red-50' : 'text-slate-400'}`}
                            title="Not Helpful"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
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

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-4 px-4 md:px-8 pb-[env(safe-area-inset-bottom)] pb-20">
        <div className="max-w-4xl mx-auto relative">
          
          {/* Document Mention Popover */}
          <AnimatePresence>
            {showMentionMenu && filteredDocs.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="absolute bottom-full mb-3 left-0 w-72 bg-white/80 backdrop-blur-2xl border border-blue-100/50 rounded-2xl shadow-[0_10px_40px_rgba(37,99,235,0.15)] overflow-hidden z-50"
              >
                <div className="px-4 py-3 bg-white/50 border-b border-blue-50/50 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Select Context</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                </div>
                <div className="max-h-56 overflow-y-auto py-2 px-1 custom-scrollbar">
                  {filteredDocs.map(doc => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => handleDocumentSelect(doc.id, doc.file_name)}
                      className="w-full text-left px-3 py-2.5 my-0.5 rounded-xl text-sm hover:bg-blue-50/80 flex items-center gap-3 text-slate-700 transition-all hover:translate-x-1 group"
                    >
                      <div className="p-1.5 rounded-lg bg-blue-100/50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <FileText className="w-4 h-4 shrink-0" />
                      </div>
                      <span className="truncate font-medium group-hover:text-blue-700 transition-colors">{doc.file_name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative p-[2px] rounded-t-[3rem] rounded-b-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] shadow-lg shadow-purple-500/20 transition-all focus-within:shadow-xl focus-within:shadow-purple-500/40">
            <form 
              onSubmit={handleSubmit}
              className="relative bg-white rounded-t-[3rem] rounded-b-xl overflow-hidden flex"
            >
            <div className="flex items-end pb-2 pl-4">
              <button
                type="button"
                onClick={props.onTriggerUpload}
                className="p-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-blue-600 rounded-full transition-colors shrink-0"
                title="Add Context / Upload File"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
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
              className="w-full max-h-48 min-h-[56px] resize-none border-0 bg-transparent py-5 pl-4 pr-32 text-slate-800 placeholder:text-slate-400 focus:ring-0 outline-none self-center"
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
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  onTouchEnd={(e) => { e.preventDefault(); toggleVoiceInput(); }}
                  className={`p-2 shrink-0 transition-colors ${
                    isListening ? 'text-red-500 bg-red-50 hover:bg-red-100 rounded-full animate-pulse' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Voice Input"
                >
                  <Mic className="w-5 h-5" />
                </button>
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
