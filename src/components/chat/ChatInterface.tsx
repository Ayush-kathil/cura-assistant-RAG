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
import { Send, Bot, User, Loader2, StopCircle, FileText, Plus, ThumbsUp, ThumbsDown, Mic, Database, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SplitPaneViewer } from '../pdf/SplitPaneViewer';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';

const Mermaid = ({ chart }: { chart: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      mermaid.initialize({ startOnLoad: true, theme: 'default', securityLevel: 'loose' });
      try {
        const id = 'mermaid-svg-' + Math.random().toString(36).substr(2, 9);
        mermaid.render(id, chart).then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        }).catch((e) => console.error("Mermaid error:", e));
      } catch (e) {
        console.error("Mermaid sync error:", e);
      }
    }
  }, [chart]);

  return <div ref={containerRef} className="my-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto flex justify-center" />;
};

const SmoothStreamer = ({ content, isStreaming, children }: { content: string, isStreaming: boolean, children: (smoothed: string) => React.ReactNode }) => {
  const [displayedContent, setDisplayedContent] = useState("");

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      return;
    }
    
    if (displayedContent === content) return;

    const interval = setInterval(() => {
      setDisplayedContent(prev => {
        if (prev.length < content.length) {
          const diff = content.length - prev.length;
          const chunkSize = Math.max(1, Math.min(8, Math.floor(diff / 3)));
          return content.slice(0, prev.length + chunkSize);
        }
        clearInterval(interval);
        return prev;
      });
    }, 20);
    
    return () => clearInterval(interval);
  }, [content, isStreaming]);

  return <>{children(displayedContent)}</>;
};

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
  const { submitQuery, stopQuery, isStreaming, error } = useAgentStream();
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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
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

  const handleCopy = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    toast.success('Message copied to clipboard');
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex flex-col h-full bg-white relative flex-1 min-w-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-8" ref={scrollRef}>
          <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-32">
          

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                layout
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 mt-1 border border-white/20">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`
                  max-w-[90%] md:max-w-[85%] rounded-3xl px-6 py-5 break-words relative group
                  ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white shadow-md ml-auto' 
                    : 'bg-white border border-slate-100 text-slate-800 shadow-sm shadow-slate-200/50'
                  }
                `}>
                  {msg.role === 'assistant' ? (
                    <div className="max-w-none w-full relative">
                      {msg.content !== '' && (
                        <button 
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="absolute -top-3 -right-3 p-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-400 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 bg-white shadow-sm border border-slate-100 z-10"
                          title="Copy message"
                        >
                          {copiedMessageId === msg.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                      {msg.content === '' && chatState !== 'COMPLETED' ? (
                        <div className="flex items-center gap-3 text-slate-400 font-medium">
                           <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> Thinking...
                        </div>
                      ) : (
                        <SmoothStreamer content={msg.content || ''} isStreaming={msg.role === 'assistant' && msg.id === messages[messages.length-1].id && chatState !== 'COMPLETED'}>
                          {(smoothed) => (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
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
                                table: ({ node, ...props }) => <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm"><table className="min-w-full text-left text-sm whitespace-nowrap border-collapse" {...props} /></div>,
                                thead: ({ node, ...props }) => <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold uppercase tracking-wider" {...props} />,
                                tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate-100 text-slate-700 bg-white" {...props} />,
                                tr: ({ node, ...props }) => <tr className="hover:bg-slate-50/50 transition-colors" {...props} />,
                                th: ({ node, ...props }) => <th className="px-6 py-4 font-semibold text-slate-800" {...props} />,
                                td: ({ node, ...props }) => <td className="px-6 py-4" {...props} />,
                                code: ({ node, inline, className, children, ...props }: any) => {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const language = match ? match[1] : '';
                                  if (!inline && language === 'mermaid') {
                                    return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                                  }
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      {...props}
                                      style={vscDarkPlus}
                                      language={language}
                                      PreTag="div"
                                      className="rounded-xl my-4 text-[13px] shadow-sm"
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-md font-mono text-[13px] border border-slate-200/60" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                a: ({ node, ...props }) => {
                                  if (props.href === 'citation') {
                                    const citationIdx = parseInt(props.children?.toString() || "1", 10) - 1;
                                    const sourceChunk = msg.sources?.[citationIdx];
                                    
                                    return (
                                      <div className="relative inline-block group">
                                        <span 
                                          onClick={(e) => { e.preventDefault(); handleCitationClick(props.children?.toString() || ""); }}
                                          className="inline-flex items-center justify-center px-2 py-0.5 ml-1.5 text-xs font-bold bg-blue-50 text-blue-700 rounded-md border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
                                        >
                                          {props.children}
                                        </span>
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
                              {(smoothed || '')
                                .replace(/\[[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\]/g, '')
                                .replace(/\[(\d+)\]/g, '[$1](citation)')}
                            </ReactMarkdown>
                          )}
                        </SmoothStreamer>
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

      <div className={messages.length === 0 ? "flex-1 flex flex-col items-center justify-center px-4 pb-20" : "shrink-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-4 px-4 md:px-8 pb-[env(safe-area-inset-bottom)]"}>
        <motion.div layout className="max-w-4xl w-full mx-auto relative">
          
          {messages.length === 0 && (
             <motion.div layout="position" className="text-center mb-8">
               <h2 className="text-4xl md:text-5xl font-light text-slate-800 tracking-tight mb-3">Built around your knowledge.</h2>
               <p className="text-slate-500 font-light">Your AI companion for research and insights.</p>
             </motion.div>
          )}

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

          <motion.div layout="position" className="relative p-[2px] rounded-t-[3rem] rounded-b-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] shadow-lg shadow-purple-500/20 transition-all focus-within:shadow-xl focus-within:shadow-purple-500/40">
            <form 
              onSubmit={handleSubmit}
              className="relative bg-white rounded-t-[3rem] rounded-b-xl overflow-visible flex"
            >
            <div className="flex items-end pb-2 pl-4">
              <div className="relative group">
                <button
                  type="button"
                  className="p-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-blue-600 rounded-full transition-colors shrink-0"
                  title="More Options"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex flex-col gap-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50">
                  <button type="button" onClick={props.onTriggerUpload} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-xl text-sm text-slate-700 whitespace-nowrap">
                    <FileText className="w-4 h-4 text-blue-500" /> Upload Document
                  </button>
                  <button type="button" onClick={() => setResearchMode(!researchMode)} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-xl text-sm text-slate-700 whitespace-nowrap">
                    <Database className="w-4 h-4 text-indigo-500" /> {researchMode ? 'Disable Research' : 'Enable Research'}
                  </button>
                  <button type="button" onClick={toggleVoiceInput} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-xl text-sm text-slate-700 whitespace-nowrap">
                    <Mic className={`w-4 h-4 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} /> Voice Input
                  </button>
                </div>
              </div>
            </div>
            <TextareaAutosize
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask the Agentic AI (Type @ to mention a PDF)..."
              className="w-full max-h-48 min-h-[56px] resize-none border-0 bg-transparent py-5 pl-4 pr-14 text-slate-800 placeholder:text-slate-400 focus:ring-0 outline-none self-center"
              minRows={1}
              maxRows={6}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-2">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopQuery}
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
          </motion.div>
          
          {messages.length === 0 && (
             <motion.div layout="position" className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl mx-auto">
               {["Summarize the latest quarterly report", "Extract key entities from the legal contract", "Explain the RAG architecture", "Find references to 'Project Apollo'"].map((suggestion, i) => (
                 <button 
                   key={i}
                   onClick={() => setInputValue(suggestion)}
                   className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-blue-300 hover:bg-blue-50 transition-all font-medium"
                 >
                   {suggestion}
                 </button>
               ))}
             </motion.div>
          )}

          {messages.length > 0 && (
            <div className="text-center mt-3 flex flex-col md:flex-row justify-between gap-1">
              <span className="text-[10px] md:text-xs text-slate-400 truncate">Target Document: {selectedDocumentName || 'All Documents'}</span>
              <span className="text-[10px] md:text-xs text-slate-400 truncate">Agentic Platform | Engine Connected</span>
            </div>
          )}
        </motion.div>
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
