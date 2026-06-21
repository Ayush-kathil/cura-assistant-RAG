"use client";

import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';

interface SplitPaneViewerProps {
  documentId: string | null;
  onClose: () => void;
  citationText?: string;
}

export function SplitPaneViewer({ documentId, onClose, citationText }: SplitPaneViewerProps) {
  if (!documentId) return null;

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-right-8 duration-300 w-[400px] shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-sm text-slate-700">Source Viewer</h3>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
        {/* Placeholder for PDF JS Viewer */}
        <div className="bg-white p-8 min-h-[800px] shadow-sm border border-slate-200 text-sm leading-relaxed text-slate-700 font-serif">
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-6 text-xs font-sans">
            <strong>Note:</strong> Full PDF.js integration requires canvas rendering. Currently displaying extracted text simulation.
          </div>
          
          <p className="mb-4">
            [Document {documentId} Content starts here...]
          </p>
          <p className="mb-4">
            Curabitur blandit tempus porttitor. Nullam quis risus eget urna mollis ornare vel eu leo.
          </p>
          
          {citationText && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-8 rounded-r">
              <span className="block text-xs uppercase tracking-widest text-blue-500 font-sans mb-2 font-bold">Highlighted Citation</span>
              <span className="bg-yellow-200 px-1 py-0.5">{citationText}</span>
            </div>
          )}
          
          <p className="mb-4">
            Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.
          </p>
        </div>
      </div>
    </div>
  );
}
