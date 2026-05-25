"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, CheckCircle2, Bot, User, Loader2, Sparkles, Wand2, FileText, ChevronLeft, ChevronRight, Settings, Code2, AlertTriangle, Play, Activity, Network, RefreshCw, ThumbsUp, ThumbsDown, ChevronDown } from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as Popover from "@radix-ui/react-popover";
import { ScoredChunk } from "@/lib/vectorStore";
import { ChatDocument, Message } from "@/lib/storage";
import { SmartCommandPalette } from "./SmartCommandPalette";

export type GenerationState = "idle" | "reformulating" | "scanning" | "synthesizing";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (msg: string, parentId: string | null, forceApproval?: boolean) => void;
  generationState: GenerationState;
  onActionRequest?: (action: "summarize" | "explain" | "rewrite", text: string) => void;
  onNewSession: () => void;
  documents: ChatDocument[];
  activeDocumentIds: string[];
  onToggleDocument: (id: string) => void;
  currentLeafId: string | null;
  onNavigateBranch: (messageId: string) => void;
  onToggleKbExplorer: () => void;
  personaInstruction: string;
  onPersonaChange: (persona: string) => void;
  onSetScopedDocument: (docId: string | null) => void;
  onApproveAction: (msgId: string) => void;
  onViewArtifact: (content: string) => void;
  isDevMode: boolean;
}

const CodeBlock = ({ node, inline, className, children, onViewArtifact, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeContent = String(children).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-300 font-mono text-sm" {...props}>{children}</code>;
  }

  return (
    <div className="relative my-4 rounded-xl overflow-hidden bg-[#05050A] border border-white/10 shadow-inner group">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{language || "text"}</span>
        <div className="flex gap-1">
          <button onClick={() => onViewArtifact(codeContent)} className="p-1.5 rounded-md hover:bg-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center gap-1 min-h-[36px] text-xs font-bold tracking-wide transition-colors">
            <Code2 className="w-3.5 h-3.5" /> View Artifact
          </button>
          <button onClick={handleCopy} className="p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto text-sm text-gray-300 font-mono max-h-48 relative">
         <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#05050A] to-transparent pointer-events-none" />
         <code {...props}>{children}</code>
      </div>
    </div>
  );
};

const CitationNode = ({ node, children, sources }: any) => {
  const match = String(children).match(/\[(\d+)\]/);
  
  if (!match || !sources) return <span>{children}</span>;
  const index = parseInt(match[1]) - 1;
  const source = sources[index];
  
  if (!source) return <span>{children}</span>;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <span className="relative inline-block cursor-help ml-0.5">
          <sup className="px-1 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold text-[10px] hover:bg-blue-500/40 transition-colors">
            {match[1]}
          </sup>
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={5} className="z-50 w-64 p-3 bg-[#0A0A15]/95 backdrop-blur-3xl border border-white/20 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <span className="text-xs font-semibold text-white truncate max-w-[150px]"><FileText className="w-3 h-3 inline mr-1 text-blue-400"/>{source.chunk.filename}</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">Score: {source.score.toFixed(2)}</span>
          </div>
          <div className="text-[10px] text-gray-300 line-clamp-4 leading-relaxed bg-black/30 p-2 rounded border border-white/5 font-mono">
            {source.childMatchText}
          </div>
          <Popover.Arrow className="fill-white/20" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  generationState, 
  onActionRequest,
  onNewSession,
  documents,
  activeDocumentIds,
  onToggleDocument,
  currentLeafId,
  onNavigateBranch,
  onToggleKbExplorer,
  personaInstruction,
  onPersonaChange,
  onSetScopedDocument,
  onApproveAction,
  onViewArtifact,
  isDevMode
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const threadMessages = useMemo(() => {
    const thread: Message[] = [];
    let currentId = currentLeafId;
    while (currentId) {
      const msg = messages.find(m => m.id === currentId);
      if (msg) {
        thread.unshift(msg);
        currentId = msg.parentId;
      } else {
        break;
      }
    }
    return thread;
  }, [messages, currentLeafId]);

  const virtualizer = useVirtualizer({
    count: threadMessages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5,
  });

  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = parentRef.current.scrollHeight;
    }
  }, [threadMessages.length, generationState]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || generationState !== "idle") return;
    const parentId = threadMessages.length > 0 ? threadMessages[threadMessages.length - 1].id : null;
    onSendMessage(input.trim(), parentId);
    setInput("");
  };

  const handleEditSubmit = (e: React.FormEvent, parentId: string | null) => {
    e.preventDefault();
    if (!editValue.trim() || generationState !== "idle") return;
    onSendMessage(editValue.trim(), parentId);
    setIsEditingId(null);
  };

  return (
    <motion.div layout className="flex flex-col w-full h-[100dvh] lg:h-full lg:rounded-3xl lg:border border-white/10 bg-[var(--color-glass)] backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {threadMessages.length > 2 && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex gap-2 overflow-x-auto max-w-sm hide-scrollbar items-center">
            {threadMessages.filter(m => m.role === 'user').map((m, i) => (
               <div key={m.id} className="flex items-center gap-1">
                 <button onClick={() => onNavigateBranch(m.childrenIds.length > 0 ? m.childrenIds[0] : m.id)} className={clsx("w-2.5 h-2.5 rounded-full transition-all", m.id === currentLeafId || threadMessages.some(t => t.id === currentLeafId && t.parentId === m.id) ? "bg-[var(--color-accent)] ring-2 ring-blue-500/30 scale-125" : "bg-white/20 hover:bg-white/40")} title={`Turn ${i+1}`} />
                 {i < threadMessages.filter(m => m.role === 'user').length - 1 && <div className="w-3 h-0.5 bg-white/10" />}
               </div>
            ))}
         </div>
      )}

      <div ref={parentRef} className="flex-1 overflow-y-auto px-4 md:px-6 pt-20 pb-6 space-y-6 scroll-smooth">
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const msg = threadMessages[virtualItem.index];
            const siblings = messages.filter(m => m.parentId === msg.parentId);
            const siblingIndex = siblings.findIndex(m => m.id === msg.id);
            
            return (
              <div key={virtualItem.key} data-index={virtualItem.index} ref={virtualizer.measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualItem.start}px)` }} className="pb-6">
                <div className={clsx("flex gap-3 md:gap-4 max-w-[95%] md:max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}>
                  <div className={clsx("w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-1", msg.role === "user" ? "bg-white/10" : "hidden")}>
                    {msg.role === "user" && <User className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex flex-col gap-1 w-full max-w-full">
                    {msg.orchestrationPath && msg.orchestrationPath.length > 0 && msg.role === "assistant" && (
                       <details className="mb-2 group cursor-pointer text-xs text-gray-500 bg-black/20 border border-white/5 rounded-lg px-3 py-2 w-fit">
                          <summary className="font-mono flex items-center gap-2 outline-none"><Activity className="w-3 h-3 text-[var(--color-accent)]" /> Orchestration Path</summary>
                          <div className="mt-2 pl-5 space-y-1 font-mono text-[10px] text-gray-400 border-l border-white/10">
                            {msg.orchestrationPath.map((step, i) => <div key={i}>{i+1}. {step}</div>)}
                          </div>
                       </details>
                    )}

                    <div className={clsx("group relative p-4 rounded-xl text-sm leading-relaxed", msg.role === "user" ? "bg-white/10 text-white rounded-tr-sm" : "bg-black/40 border-l-[3px] border-cyan-400 text-gray-200 shadow-lg flex flex-col")}>
                      
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-3">
                          <Network className="w-5 h-5 text-cyan-400" />
                          <span className="font-bold text-cyan-400 tracking-wide text-sm">Nexus Engine</span>
                        </div>
                      )}
                      
                      {msg.requiresApproval && !msg.isApproved ? (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-3">
                           <div className="flex items-center gap-2 text-amber-400 font-bold tracking-wide">
                             <AlertTriangle className="w-5 h-5" /> HITL Approval Required
                           </div>
                           <p className="text-sm text-amber-200/70">The agent has requested permission to execute a complex sequence. Please confirm to proceed.</p>
                           <button onClick={() => onApproveAction(msg.id)} className="mt-2 w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold py-2 rounded-lg transition-colors min-h-[44px]">
                             <Play className="w-4 h-4 fill-amber-950" /> Approve & Execute
                           </button>
                        </div>
                      ) : isEditingId === msg.id && msg.role === "user" ? (
                         <form onSubmit={(e) => handleEditSubmit(e, msg.parentId)} className="flex flex-col gap-2">
                           <textarea value={editValue} onChange={e => setEditValue(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[100px]" autoFocus />
                           <div className="flex justify-end gap-2">
                             <button type="button" onClick={() => setIsEditingId(null)} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white">Cancel</button>
                             <button type="submit" className="px-3 py-1.5 rounded-lg bg-blue-500 text-xs text-white">Save & Branch</button>
                           </div>
                         </form>
                      ) : msg.role === "assistant" && !msg.content && generationState !== "idle" ? (
                        <div className="flex items-center gap-2 py-2 px-1 text-blue-400">
                          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                        </div>
                      ) : (
                        <>
                          <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:tracking-wide prose-li:leading-relaxed prose-blockquote:border-cyan-500/50 prose-blockquote:bg-cyan-500/5 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg">
                            <ReactMarkdown components={{ code: (props) => <CodeBlock {...props} onViewArtifact={onViewArtifact} />, p: ({ children, node }) => <p className="mb-4 last:mb-0 text-[15px]">{children}</p>, a: ({ children, node }) => <CitationNode node={node} sources={msg.sources}>{children}</CitationNode> }}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>

                          {msg.sources && msg.sources.length > 0 && (
                            <details className="mt-4 border-t border-white/5 pt-4 group">
                              <summary className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-widest cursor-pointer outline-none hover:text-white transition-colors">
                                CITATIONS ({msg.sources.length})
                                <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="mt-4 space-y-2">
                                {msg.sources.map((source, idx) => (
                                  <div key={idx} className="flex gap-2 text-xs text-gray-400">
                                    <span className="font-bold text-cyan-400">[{idx + 1}]</span>
                                    <span className="italic">{source.chunk.filename}</span>
                                    <span className="text-gray-500">- Score: {source.score.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                          
                          {/* Premium Action Footer */}
                          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wider">
                                <Copy className="w-4 h-4" /> Copy
                              </button>
                              <button className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wider">
                                <RefreshCw className="w-4 h-4" /> Regenerate
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <button className="text-gray-400 hover:text-cyan-400 transition-colors"><ThumbsUp className="w-4 h-4" /></button>
                              <button className="text-gray-400 hover:text-red-400 transition-colors"><ThumbsDown className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {msg.role === "user" && isEditingId !== msg.id && generationState === "idle" && (
                         <button onClick={() => { setIsEditingId(msg.id); setEditValue(msg.content); }} className="absolute -left-12 top-2 p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                            <Settings className="w-4 h-4" />
                         </button>
                      )}
                    </div>
                    
                    {isDevMode && msg.telemetry && msg.role === "assistant" && (
                       <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono mt-1 px-2 border-t border-white/5 pt-1 w-fit">
                          <span>VectorSearch: <span className="text-cyan-400">{msg.telemetry.vectorSearchMs}ms</span></span>
                          <span>ReRank: <span className="text-purple-400">{msg.telemetry.rerankerMs}ms</span></span>
                          <span>TTFT: <span className="text-emerald-400">{msg.telemetry.ttftMs}ms</span></span>
                       </div>
                    )}
                    
                    {siblings.length > 1 && msg.role === "user" && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 px-2 mt-1 self-end bg-white/5 rounded-full">
                        <button disabled={siblingIndex === 0} onClick={() => onNavigateBranch(siblings[siblingIndex - 1].id)} className="p-1 hover:text-white disabled:opacity-30 flex items-center justify-center"><ChevronLeft className="w-3 h-3"/></button>
                        <span className="font-mono">branch {siblingIndex + 1}/{siblings.length}</span>
                        <button disabled={siblingIndex === siblings.length - 1} onClick={() => onNavigateBranch(siblings[siblingIndex + 1].id)} className="p-1 hover:text-white disabled:opacity-30 flex items-center justify-center"><ChevronRight className="w-3 h-3"/></button>
                      </div>
                    )}
                    {msg.role === "assistant" && generationState === "idle" && (
                      <div className="flex flex-wrap gap-2 mt-4 ml-1">
                        {["Summarize the key points", "Explain the data processing requirements", "What are the specific Top-K parameters?"].map((suggestion, idx) => (
                          <button key={idx} onClick={() => setInput(suggestion)} className="text-xs px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition-colors truncate max-w-[250px]">
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-none p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sticky bottom-0 bg-black/40 backdrop-blur-xl border-t border-[var(--color-border)] z-20 shrink-0">
        <SmartCommandPalette 
           input={input}
           setInput={setInput}
           onSubmit={handleSubmit}
           generationState={generationState}
           documents={documents}
           personaInstruction={personaInstruction}
           onPersonaChange={onPersonaChange}
           activeDocumentIds={activeDocumentIds}
           onSetScopedDocument={onSetScopedDocument}
           threadMessages={threadMessages}
        />
      </div>
    </motion.div>
  );
};
