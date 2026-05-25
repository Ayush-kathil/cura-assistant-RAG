import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Code2, Copy, CheckCircle2, FileText, CornerDownLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ArtifactsCanvasProps {
  content: string | null;
  isOpen: boolean;
  onClose: () => void;
  onReferenceInChat: (text: string) => void;
}

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
        <button onClick={handleCopy} className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm text-gray-300 font-mono">
        <code {...props}>{children}</code>
      </div>
    </div>
  );
};

export const ArtifactsCanvas = ({ content, isOpen, onClose, onReferenceInChat }: ArtifactsCanvasProps) => {
  const [selectedText, setSelectedText] = useState("");
  const [floatingMenuPos, setFloatingMenuPos] = useState<{ x: number, y: number } | null>(null);

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

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedText) {
      onReferenceInChat(`> ${selectedText}\n\n`);
      setFloatingMenuPos(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  if (!isOpen || !content) return null;

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "50%", opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      className="h-full border-l border-white/10 bg-[#0A0A15]/95 backdrop-blur-3xl overflow-hidden hidden lg:flex flex-col relative shrink-0 shadow-2xl"
    >
      <AnimatePresence>
        {floatingMenuPos && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed z-[100] flex items-center gap-1 p-1.5 rounded-xl bg-[var(--color-accent)] backdrop-blur-3xl border border-white/20 shadow-2xl" style={{ left: floatingMenuPos.x, top: floatingMenuPos.y, transform: "translateX(-50%)" }} onMouseDown={(e) => e.preventDefault()}>
            <button onClick={handleAction} className="px-3 min-h-[44px] text-xs font-bold text-white hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2 tracking-wide">
              <CornerDownLeft className="w-4 h-4" /> Reference in Chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-none p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 tracking-wide">
          <Code2 className="w-4 h-4 text-[var(--color-accent)]" />
          Artifact Viewer
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:tracking-wide prose-li:leading-relaxed prose-blockquote:border-[var(--color-accent)] prose-blockquote:bg-blue-500/5 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-xl">
          <ReactMarkdown
            components={{
              code: CodeBlock,
              p: ({ children }) => <p className="mb-6 text-[15px]">{children}</p>
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};
