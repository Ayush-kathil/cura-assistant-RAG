"use client";

import React, { useState, useEffect } from 'react';
import { FileText, X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface SplitPaneViewerProps {
  documentId: string | null;
  onClose: () => void;
  citationText?: string;
}

export function SplitPaneViewer({ documentId, onClose, citationText }: SplitPaneViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPdfUrl() {
      if (!documentId) return;
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: docData } = await supabase
          .from('documents')
          .select('storage_path')
          .eq('id', documentId)
          .single();

        if (docData?.storage_path) {
          const { data } = await supabase.storage
            .from('documents')
            .createSignedUrl(docData.storage_path, 3600);
            
          if (data?.signedUrl) {
            setPdfUrl(data.signedUrl);
          }
        }
      } catch (err) {
        console.error("Failed to load PDF URL", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPdfUrl();
  }, [documentId]);

  if (!documentId) return null;

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-right-8 duration-300 w-full md:w-[500px] shrink-0 z-10 relative">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-sm text-slate-700">Source Viewer</h3>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {citationText && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-100">
          <p className="text-xs font-bold uppercase tracking-wider text-yellow-800 mb-1">Citation Context</p>
          <p className="text-sm text-yellow-900 italic line-clamp-3">"{citationText}"</p>
        </div>
      )}

      <div className="flex-1 w-full h-full bg-slate-100 relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-medium">Loading Document...</p>
          </div>
        ) : pdfUrl ? (
          <div className="flex-1 w-full h-full overflow-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
            <iframe 
              src={`${pdfUrl}#toolbar=0&navpanes=0`} 
              className="w-full h-full border-none bg-slate-100"
              title="PDF Viewer"
              loading="lazy"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            <p className="text-sm font-medium">Document not found or unable to load.</p>
          </div>
        )}
      </div>
    </div>
  );
}
