'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, ChevronRight, ExternalLink } from 'lucide-react';

export interface CitationData {
  id: string;
  sourceFile: string;
  pageNumber?: number;
  snippet: string;
  confidenceScore: number;
  similarChunks?: { id: string; snippet: string }[];
}

interface CitationDrawerProps {
  isOpen: boolean;
  citation: CitationData | null;
  onClose: () => void;
}

export function CitationDrawer({ isOpen, citation, onClose }: CitationDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && citation && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:bg-transparent lg:backdrop-blur-none"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{citation.sourceFile}</h3>
                  <p className="text-xs text-slate-500">
                    {citation.pageNumber ? `Page ${citation.pageNumber}` : 'Extracted Text'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Highlighted Evidence */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Extracted Evidence</h4>
                <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-5 relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-l-xl"></div>
                  <p className="text-slate-700 font-serif leading-relaxed text-sm">
                    {citation.snippet}
                  </p>
                </div>
              </div>

              {/* Confidence Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Retrieval Confidence</h4>
                  <span className="text-xs font-medium text-slate-600">{(citation.confidenceScore * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      citation.confidenceScore > 0.8 ? 'bg-green-500' : 
                      citation.confidenceScore > 0.5 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${citation.confidenceScore * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">Score derived via Reciprocal Rank Fusion (RRF) and Gemini Reranker.</p>
              </div>

              {/* Similar Context (If Available) */}
              {citation.similarChunks && citation.similarChunks.length > 0 && (
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Surrounding Context</h4>
                  <div className="flex flex-col gap-2">
                    {citation.similarChunks.map((chunk, idx) => (
                      <details key={chunk.id || idx} className="group bg-slate-50 border border-slate-100 rounded-lg">
                        <summary className="flex items-center justify-between p-3 cursor-pointer text-sm font-medium text-slate-700 list-none">
                          <span className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                            Neighboring Chunk {idx + 1}
                          </span>
                        </summary>
                        <div className="px-3 pb-3 text-sm text-slate-600 border-t border-slate-100 pt-2">
                          {chunk.snippet}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
              <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                <ExternalLink className="w-4 h-4" />
                View Full Document
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
