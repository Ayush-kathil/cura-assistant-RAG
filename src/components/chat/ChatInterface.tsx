"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Copy, CheckCircle2, Bot, User, Loader2, Sparkles, Wand2, FileText, PlusCircle, Database, ChevronDown } from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import { ScoredChunk } from "@/lib/vectorStore";
import { ChatDocument } from "@/lib/storage";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ScoredChunk[];
  isWelcome?: boolean;
}

export type GenerationState = "idle" | "reformulating" | "scanning" | "synthesizing";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  generationState: GenerationState;
  onActionRequest?: (action: "summarize" | "explain" | "rewrite", text: string) => void;
  onNewSession: () => void;
  documents: ChatDocument[];
  activeDocumentIds: string[];
  onToggleDocument: (id: string) => void;
}

const useSmartScrollLock = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAutoScrollEnabled(isAtBottom);
  };

  const scrollToBottom = () => {
    if (isAutoScrollEnabled && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return { containerRef, handleScroll, scrollToBottom };
};

const useSmoothStream = (rawText: string, isStreamFinished: boolean) => {
  const [displayedText, setDisplayedText] = useState("");
  const bufferRef = useRef("");
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    bufferRef.current = rawText;
    
    if (isStreamFinished && displayedText.length < rawText.length) {
       setDisplayedText(rawText);
       return;
    }

    const animate = (time: number) => {
      if (time - lastUpdateRef.current > 10) { 
        setDisplayedText((prev) => {
          const buffer = bufferRef.current;
          if (prev.length < buffer.length) {
            const charsToAdd = Math.max(1, Math.floor((buffer.length - prev.length) / 4));
            return prev + buffer.substring(prev.length, prev.length + charsToAdd);
          }
          return prev;
        });
        lastUpdateRef.current = time;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [rawText, isStreamFinished]);

  return displayedText;
};

const StaggeredText = ({ text }: { text: string }) => {
  const words = text.split(" ");
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.05 } },
      }}
      className="inline-block"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 5 },
            visible: { opacity: 1, y: 0 },
          }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
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
    <div className="relative my-4 rounded-xl overflow-hidden bg-[#05050A] border border-white/10 shadow-inner">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{language || "text"}</span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm text-gray-300 font-mono">
        <code {...props}>{children}</code>
      </div>
    </div>
  );
};

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

const SourcePill = ({ source }: { source: ScoredChunk }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative inline-block mt-2 mr-2" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/5 border border-white/10 backdrop-blur-md rounded-full px-3 py-1 text-xs font-medium text-gray-300 cursor-pointer hover:bg-white/10 transition-colors"
      >
        {source.chunk.filename} (Chunk {source.chunk.chunkIndex})
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full mb-2 left-0 z-50 w-64 md:w-80 p-4 bg-[#0A0A15]/95 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl text-xs text-gray-300 leading-relaxed max-h-60 overflow-y-auto"
          >
            <div className="font-semibold text-white mb-2 pb-2 border-b border-white/10 truncate">{source.chunk.filename}</div>
            {source.chunk.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnimatedMarkdown = ({ content, isFinished }: { content: string, isFinished: boolean }) => {
  const smoothText = useSmoothStream(content, isFinished);
  
  return (
    <ReactMarkdown
      components={{
        code: CodeBlock,
        p: ({ children }) => <p className="mb-4 last:mb-0 text-[15px]">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-[15px]">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-[15px]">{children}</ol>,
      }}
    >
      {smoothText}
    </ReactMarkdown>
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
  onToggleDocument
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { containerRef, handleScroll, scrollToBottom } = useSmartScrollLock();

  const [selectedText, setSelectedText] = useState("");
  const [floatingMenuPos, setFloatingMenuPos] = useState<{ x: number, y: number } | null>(null);
  const [isKbOpen, setIsKbOpen] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages, generationState, scrollToBottom]);

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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col w-full h-[calc(100vh-2rem)] lg:h-[90vh] lg:my-auto lg:max-w-5xl lg:rounded-3xl lg:border border-[var(--color-border)] bg-[var(--color-glass)] backdrop-blur-xl shadow-2xl shadow-blue-900/10 overflow-hidden"
    >
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

      <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-black/20 pt-20 lg:pt-4 z-20 backdrop-blur-md relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-accent)] rounded-lg text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex flex-col relative">
            <h3 className="font-semibold text-white tracking-wide">CURA</h3>
            <button onClick={() => setIsKbOpen(!isKbOpen)} className="flex items-center gap-2 hover:bg-white/5 rounded-md px-1 -ml-1 transition-colors">
              {activeDocumentIds.length > 0 ? (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-amber-500/80" />
              )}
              <p className={clsx("text-xs truncate max-w-[150px] md:max-w-xs", activeDocumentIds.length > 0 ? "text-gray-300" : "text-amber-500/80")}>
                {documents.length} Files • {activeDocumentIds.length} Active
              </p>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isKbOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-16 mt-2 w-72 bg-[#0A0A15]/95 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-[var(--color-accent)]" /> Knowledge Base
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto p-2">
                {documents.map((doc) => {
                  const isActive = activeDocumentIds.includes(doc.id);
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors">
                      <span className="text-xs text-gray-300 truncate max-w-[180px]">{doc.filename}</span>
                      <button
                        onClick={() => onToggleDocument(doc.id)}
                        className={clsx(
                          "w-10 h-6 rounded-full p-1 transition-colors relative",
                          isActive ? "bg-green-500" : "bg-gray-600"
                        )}
                      >
                        <motion.div
                          layout
                          className="w-4 h-4 bg-white rounded-full shadow-md"
                          animate={{ x: isActive ? 16 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  );
                })}
                {documents.length === 0 && (
                  <div className="p-4 text-center text-xs text-gray-500">No documents uploaded.</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onNewSession}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-xl transition-all shadow-lg text-sm font-medium text-white"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Session</span>
        </button>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        <motion.div 
          initial="hidden" 
          animate="show" 
          variants={{ show: { transition: { staggerChildren: 0.1 } } }} 
          className="space-y-6 pb-4"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isLastMsg = index === messages.length - 1;
              const isFinished = generationState === "idle" || !isLastMsg;

              return (
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
                      : "bg-black/40 border border-white/5 text-gray-200 rounded-tl-sm shadow-inner flex flex-col"
                  )}>
                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:tracking-wide prose-li:leading-relaxed prose-blockquote:border-blue-500/50 prose-blockquote:bg-blue-500/5 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg">
                      {msg.isWelcome ? (
                        <StaggeredText text={msg.content} />
                      ) : msg.role === "assistant" ? (
                        <AnimatedMarkdown content={msg.content} isFinished={isFinished} />
                      ) : (
                        <ReactMarkdown
                          components={{
                            code: CodeBlock,
                            p: ({ children }) => <p className="mb-4 last:mb-0 text-[15px]">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-[15px]">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-[15px]">{children}</ol>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                    
                    {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center">
                        {msg.sources.map(source => (
                          <SourcePill key={source.chunk.id} source={source} />
                        ))}
                      </div>
                    )}

                    {msg.role === "assistant" && msg.content && !msg.isWelcome && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="absolute -right-10 top-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                      >
                        {copiedId === msg.id ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <AnimatePresence>
            {generationState !== "idle" && (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ThinkingIndicator state={generationState} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="flex-none p-4 sticky bottom-0 bg-black/40 backdrop-blur-xl border-t border-[var(--color-border)] z-20">
        <form onSubmit={handleSubmit} className="relative flex items-center w-full max-w-4xl mx-auto">
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
    </motion.div>
  );
};
