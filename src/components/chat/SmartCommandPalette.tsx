import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, User, FileText } from "lucide-react";
import clsx from "clsx";
import { ChatDocument, Message } from "@/lib/storage";

interface SmartCommandPaletteProps {
  input: string;
  setInput: (val: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  generationState: string;
  documents: ChatDocument[];
  personaInstruction: string;
  onPersonaChange: (val: string) => void;
  activeDocumentIds: string[];
  onSetScopedDocument: (docId: string | null) => void;
  threadMessages: Message[];
  selectedModel: string;
  onModelChange: (val: string) => void;
}

export const SmartCommandPalette = ({
  input,
  setInput,
  onSubmit,
  generationState,
  documents,
  personaInstruction,
  onPersonaChange,
  activeDocumentIds,
  onSetScopedDocument,
  threadMessages,
  selectedModel,
  onModelChange
}: SmartCommandPaletteProps) => {
  const [showMenu, setShowMenu] = useState<"persona" | "doc" | null>(null);
  const [filterText, setFilterText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const estimatedTokens = input.length / 4;
  const maxTokens = 8000;

  useEffect(() => {
    const docMatch = input.match(/@(.*)$/);
    const personaMatch = input.match(/\/(.*)$/);

    if (docMatch) {
      setShowMenu("doc");
      setFilterText(docMatch[1].toLowerCase());
    } else if (personaMatch) {
      setShowMenu("persona");
      setFilterText(personaMatch[1].toLowerCase());
    } else {
      setShowMenu(null);
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" && input === "") {
      const lastUser = [...threadMessages].reverse().find(m => m.role === "user");
      if (lastUser) setInput(lastUser.content);
      e.preventDefault();
    }
  };

  const handleSelect = (type: "persona" | "doc", id: string, label: string) => {
    const parts = input.split(type === "persona" ? "/" : "@");
    parts.pop(); // remove query part
    const prefix = type === "persona" ? "/" : "@";
    setInput(parts.join(prefix) + prefix + label + " ");
    setShowMenu(null);
    inputRef.current?.focus();
  };

  const personas = [
    { id: "general", label: "General Overview" },
    { id: "policy", label: "Corporate Policy" },
    { id: "auditor", label: "Code Auditor" }
  ];

  const filteredPersonas = personas.filter(p => p.label.toLowerCase().includes(filterText));
  const filteredDocs = documents.filter(d => d.filename.toLowerCase().includes(filterText));

  return (
    <div className="relative w-full flex flex-col items-center">

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-4 w-full max-w-4xl bg-white/95 backdrop-blur-3xl border border-slate-200 rounded-xl shadow-2xl p-2 z-50 left-0"
          >
            {showMenu === "persona" && (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 py-1">Set Persona</p>
                {filteredPersonas.map(p => (
                  <button key={p.id} onClick={() => { onPersonaChange(p.id); handleSelect("persona", p.id, p.label); }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2">
                    <span className="text-slate-400">/</span>{p.label}
                  </button>
                ))}
              </div>
            )}
            {showMenu === "doc" && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider px-2 py-1">Scope Document</p>
                {filteredDocs.map(d => (
                  <button key={d.id} onClick={() => { onSetScopedDocument(d.id); handleSelect("doc", d.id, d.filename); }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2">
                    <span className="text-blue-400">@</span>{d.filename}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto w-full bg-white border border-gray-100 p-2 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.06)] flex flex-col group transition-all duration-300">
        <div className="px-4 pt-2 pb-1">
          <div className="flex items-center gap-2 relative">
            <button type="button" onClick={() => setModelMenuOpen(!modelMenuOpen)} className="flex items-center gap-1 bg-[#e8f6f8] hover:bg-[#d0eff3] text-[11px] font-bold text-[#2b7c8f] uppercase tracking-wider px-4 py-1.5 rounded-full cursor-pointer transition-all outline-none">
              {selectedModel}
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
            <AnimatePresence>
              {modelMenuOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full mb-2 left-0 w-48 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden z-50">
                  {["Gemini 2.5 Flash", "Gemini 2.5 Pro", "Gemini 2.5 Flash-Lite"].map(m => (
                    <button key={m} type="button" onClick={() => { onModelChange(m); setModelMenuOpen(false); }} className="w-full text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-[#2b7c8f] hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 flex items-center justify-between">
                      {m}
                      {selectedModel === m && <span className="material-symbols-outlined text-[14px] text-[#2b7c8f]">check</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <form onSubmit={onSubmit} className="relative flex items-center w-full px-2 pb-1">
          <div className={clsx("relative w-full flex items-center bg-transparent border-none transition-colors")}>
            <input 
              ref={inputRef}
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={handleKeyDown}
              placeholder="Type your message here... (Type '/' for personas, '@' for docs)" 
              disabled={generationState !== "idle"} 
              className="flex-grow bg-transparent border-none focus:ring-0 font-body-md text-gray-700 placeholder:text-gray-400 py-3 disabled:opacity-50 pl-2" 
            />
            <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-1 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">mic</span>
            </button>
            <button type="submit" disabled={!input.trim() || generationState !== "idle"} className="w-12 h-12 rounded-full bg-[#e8f6f8] text-[#2b7c8f] flex items-center justify-center transition-all disabled:opacity-50 hover:bg-[#d0eff3]">
              <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
