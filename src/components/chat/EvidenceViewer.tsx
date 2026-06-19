'use client';

import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';

export interface Citation {
  chunkId: string;
  sourceFile: string;
  pageNumber?: number;
  textSnippet: string;
  confidenceScore?: number;
}

export function EvidenceViewer({ citation, onClose }: { citation: Citation | null, onClose: () => void }) {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg truncate">{citation.sourceFile}</h3>
            {citation.pageNumber && <span className="text-sm bg-slate-100 text-slate-600 px-2 py-1 rounded">Page {citation.pageNumber}</span>}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-slate-500 mb-4 uppercase tracking-wider font-semibold">Extracted Evidence Context</p>
          
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-slate-800 font-serif leading-relaxed rounded-r text-lg">
            {citation.textSnippet}
          </div>
          
          {citation.confidenceScore !== undefined && (
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${citation.confidenceScore > 0.8 ? 'bg-green-500' : citation.confidenceScore > 0.5 ? 'bg-amber-500' : 'bg-red-500'}`} 
                  style={{ width: `${citation.confidenceScore * 100}%` }}
                />
              </div>
              <span>{(citation.confidenceScore * 100).toFixed(0)}% Retrieval Confidence</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
