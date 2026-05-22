"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Copy, CheckCircle2, Bot, User, Loader2, Sparkles, Wand2, FileText } from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export type GenerationState = "idle" | "reformulating" | "scanning" | "synthesizing";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  generationState: GenerationState;
  filename: string;
  onCitationClick?: (index: number) => void;
  onCitationHover?: (index: number) => void;
  onActionRequest?: (action: "summarize" | "explain" | "rewrite", text: string) => void;
}

const ThinkingIndicator = ({ state }: { state: GenerationState }) => {
  if (state === "idle") return null;

  const states = [
    { id: "reformulating", text: "Rewriting Query...", icon: Wand2 },
    { id: "scanning", text: "Scanning Document Vectors...", icon: FileText },
    { id: "synthesizing", text: "Synthesizing...", icon: Sparkles },
  ];

  const activeState = states.find(s => s.id === state) || states[2];
  const Icon = activeState.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 w-fit"
    >
      <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent)]" />
      <Icon className="w-4 h-4 text-blue-300" />
      <span className="text-sm font-medium text-gray-200 tracking-wide">{activeState.text}</span>
    </motion.div>
  );
};

export const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  generationState, 
  filename,
  onCitationClick,
  onCitationHover,
  onActionRequest
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [selectedText, setSelectedText] = useState("");
  const [floatingMenuPos, setFloatingMenuPos] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generationState]);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setFloatingMenuPos({ x: rect.left + rect.width / 2, y: rect.top - 50 });
        setSelectedText(selection.toString());
      } else {
        setTimeout(() => {
          const currentSelection = window.getSelection();
          if (!currentSelection || currentSelection.toString().trim().length === 0) {
            setFloatingMenuPos(null);
          }
        }, 100);
      }
    };
    
    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || generationState !== "idle") return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAction = (action: "summarize" | "explain" | "rewrite", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onActionRequest && selectedText) {
      onActionRequest(action, selectedText);
      setFloatingMenuPos(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-hidden">
      <AnimatePresence>
        {floatingMenuPos && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[100] flex items-center gap-1 p-1.5 rounded-xl bg-[#0A0A15]/90 backdrop-blur-3xl border border-white/20 shadow-2xl"
            style={{ left: floatingMenuPos.x, top: floatingMenuPos.y, transform: "translateX(-50%)" }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <button onClick={(e) => handleAction("summarize", e)} className="px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 rounded-lg transition-colors">Summarize</button>
            <button onClick={(e) => handleAction("explain", e)} className="px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 rounded-lg transition-colors">Explain</button>
            <button onClick={(e) => handleAction("rewrite", e)} className="px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 rounded-lg transition-colors">Rewrite</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-accent)] rounded-lg text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white tracking-wide">CURA</h3>
            <p className="text-xs text-gray-400 truncate max-w-md">Context: {filename}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <motion.div 
          initial="hidden" 
          animate="show" 
          variants={{ show: { transition: { staggerChildren: 0.1 } } }} 
          className="space-y-6"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  "flex gap-4 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={clsx(
                  "w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center mt-1",
                  msg.role === "user" ? "bg-white/10" : "bg-[var(--color-accent)]"
                )}>
                  {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={clsx(
                  "group relative p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user" 
                    ? "bg-white/10 text-white rounded-tr-sm" 
                    : "bg-black/40 border border-white/5 text-gray-200 rounded-tl-sm shadow-inner"
                )}>
                  <div className="prose prose-invert max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown
                      components={{
                        a: ({ node, href, children, ...props }) => {
                          if (href?.startsWith("#chunk-")) {
                            const chunkId = parseInt(href.replace("#chunk-", ""), 10);
                            return (
                              <button 
                                onClick={() => onCitationClick?.(chunkId)}
                                onMouseEnter={() => onCitationHover?.(chunkId)}
                                className="inline-flex items-center justify-center px-1.5 py-0.5 mx-1 text-[10px] font-bold text-blue-200 bg-blue-900/40 border border-blue-500/30 rounded-full hover:bg-blue-600/50 hover:border-blue-400 transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] translate-y-[-2px]"
                              >
                                {children}
                              </button>
                            );
                          }
                          return <a href={href} {...props}>{children}</a>;
                        }
                      }}
                    >
                      {msg.content.replace(/\[Chunk (\d+)\]/g, "[[$1]](#chunk-$1)")}
                    </ReactMarkdown>
                  </div>
                  
                  {msg.role === "assistant" && msg.content && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute -right-10 top-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                    >
                      {copiedId === msg.id ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {generationState !== "idle" && (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ThinkingIndicator state={generationState} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-black/30 border-t border-[var(--color-border)]">
        <form onSubmit={handleSubmit} className="relative flex items-center w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={generationState !== "idle"}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || generationState !== "idle"}
            className="absolute right-2 p-3 min-h-[44px] min-w-[44px] flex items-center justify-center bg-[var(--color-accent)] hover:bg-blue-400 disabled:bg-white/10 disabled:text-gray-500 text-white rounded-xl transition-all"
          >
            {generationState !== "idle" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
};
