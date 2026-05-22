"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, ArrowRight } from "lucide-react";
import clsx from "clsx";

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

export const ApiKeyModal = ({ onSave }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40"
    >
      <motion.div 
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="w-full max-w-md p-8 rounded-3xl bg-[var(--color-glass)] border border-[var(--color-border)] shadow-2xl shadow-blue-900/20 backdrop-blur-xl"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-white/5 rounded-full border border-white/10">
            <KeyRound className="w-8 h-8 text-[var(--color-accent)]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Gemini Setup</h2>
            <p className="text-sm text-gray-400">
              Enter your Google Gemini API key to activate the RAG engine. Your key is stored securely in your browser session.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all placeholder:text-gray-500 text-white"
            />
            <button
              type="submit"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={!apiKey.trim()}
              className={clsx(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300",
                apiKey.trim() 
                  ? "bg-[var(--color-accent)] hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25"
                  : "bg-white/10 text-gray-500 cursor-not-allowed"
              )}
            >
              Initialize Engine
              <motion.div animate={{ x: isHovered && apiKey.trim() ? 5 : 0 }}>
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
