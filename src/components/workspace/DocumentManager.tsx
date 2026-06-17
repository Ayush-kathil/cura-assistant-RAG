"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Trash2, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";
import { ChatDocument } from "@/lib/storage";

interface DocumentManagerProps {
  onDocumentsProcessed: (docs: { text: string; filename: string; sizeBytes: number; dbId: string }[]) => Promise<void>;
  onDocumentDeleted: (dbId: string) => Promise<void>;
  isProcessing: boolean;
  activeDocuments: ChatDocument[];
}

export const DocumentManager = ({ onDocumentsProcessed, onDocumentDeleted, isProcessing, activeDocuments }: DocumentManagerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [planTier, setPlanTier] = useState<"free" | "pro">("free");
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [supabase] = useState(() => createClient());
  const LIMIT_FREE = 500 * 1024 * 1024;
  const LIMIT_PRO = 1024 * 1024 * 1024;
  const currentLimit = planTier === "pro" ? LIMIT_PRO : LIMIT_FREE;

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setUserProfile(data);
          setPlanTier(data.plan_tier);
          setStorageUsed(data.storage_used_bytes);
        }
      }
    };
    fetchProfile();
  }, [supabase]);

  const executeDocumentUpload = async (files: FileList | null) => {
    if (!userProfile || !files || files.length === 0) return;
    const activeFile = files[0];
    
    if (activeFile.type !== "application/pdf") {
      alert("Only PDF files are supported.");
      return;
    }

    if (storageUsed + activeFile.size > currentLimit) {
      setShowUpsell(true);
      return;
    }

    try {
      const storagePathIdentifier = `${userProfile.id}/${Date.now()}_${activeFile.name}`;
      
      const { error: storageUploadError } = await supabase.storage
        .from('documents')
        .upload(storagePathIdentifier, activeFile);

      if (storageUploadError) throw storageUploadError;

      const { data: insertedDocumentRow, error: databaseInsertError } = await supabase
        .from('documents')
        .insert({
          user_id: userProfile.id,
          file_name: activeFile.name,
          file_size_bytes: activeFile.size,
          storage_path: storagePathIdentifier,
          vector_status: 'processing'
        })
        .select()
        .single();

      if (databaseInsertError) throw databaseInsertError;

      const updatedStorageMetric = storageUsed + activeFile.size;
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ storage_used_bytes: updatedStorageMetric })
        .eq('id', userProfile.id);
        
      if (profileUpdateError) throw profileUpdateError;
      
      setStorageUsed(updatedStorageMetric);

      // Call the server-side ingestion endpoint to chunk and embed the document
      const ingestResponse = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: insertedDocumentRow.id }),
      });
      
      if (!ingestResponse.ok) {
        const errorText = await ingestResponse.text();
        throw new Error(`Ingestion failed: ${errorText}`);
      }

      await onDocumentsProcessed([{ 
        text: `Successfully ingested and indexed ${activeFile.name}`, 
        filename: activeFile.name, 
        sizeBytes: activeFile.size, 
        dbId: insertedDocumentRow.id 
      }]);

    } catch (error: any) {
      alert(`Failed to sync with secure storage: ${error.message}`);
    }
  };

  const executeDocumentDeletion = async (documentDatabaseId: string, documentSizeBytes: number) => {
    try {
      const { data: documentRecord, error: fetchError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', documentDatabaseId)
        .single();
        
      if (fetchError) throw fetchError;

      const { error: deleteRowError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentDatabaseId);
        
      if (deleteRowError) throw deleteRowError;

      if (documentRecord) {
        const { error: storageDeletionError } = await supabase.storage
          .from('documents')
          .remove([documentRecord.storage_path]);
          
        if (storageDeletionError) throw storageDeletionError;
      }
      
      const recalculatedStorageMetric = Math.max(0, storageUsed - documentSizeBytes);
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ storage_used_bytes: recalculatedStorageMetric })
        .eq('id', userProfile.id);
        
      if (profileUpdateError) throw profileUpdateError;
      
      setStorageUsed(recalculatedStorageMetric);
      await onDocumentDeleted(documentDatabaseId);
      
    } catch (error: any) {
      alert(`Failed to sync with secure storage: ${error.message}`);
    }
  };

  const formatStorageCapacityLabel = (byteCount: number) => {
    if (byteCount === 0) return '0 B';
    const logBase = 1024;
    const capacitySuffixes = ['B', 'KB', 'MB', 'GB'];
    const logIndex = Math.floor(Math.log(byteCount) / Math.log(logBase));
    return parseFloat((byteCount / Math.pow(logBase, logIndex)).toFixed(1)) + ' ' + capacitySuffixes[logIndex];
  };

  return (
    <div className="flex flex-col gap-4 w-64 h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl relative">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
        <h3 className="text-sm font-semibold text-white tracking-wide">Knowledge Base</h3>
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); executeDocumentUpload(e.dataTransfer.files); }}
        className={clsx("flex-shrink-0 w-full p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all cursor-pointer h-24", isDragging ? "border-blue-500 bg-blue-500/10" : "border-white/20 hover:border-white/40 bg-black/20")}
      >
        <input type="file" accept="application/pdf" className="hidden" id="file-upload" onChange={(e) => executeDocumentUpload(e.target.files)} />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2 w-full h-full">
          {isProcessing ? <Loader2 className="w-6 h-6 text-blue-400 animate-spin absolute" /> : <UploadCloud className="w-6 h-6 text-gray-400 absolute" />}
          <span className="text-xs text-gray-400 font-medium mt-8">{isProcessing ? "Processing..." : "Add PDF Document"}</span>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {activeDocuments.map(doc => (
          <div key={doc.id} className="group flex items-center justify-between bg-black/40 border border-white/5 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2 truncate pr-2">
              <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-xs text-gray-200 truncate font-medium">{doc.filename}</span>
            </div>
            <button onClick={() => executeDocumentDeletion(doc.id, doc.sizeBytes || 0)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all flex-shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex-shrink-0 pt-4 border-t border-white/10 mt-auto">
        <div className="flex justify-between text-[10px] text-gray-400 mb-1.5 font-medium tracking-wider uppercase">
          <span>Storage</span>
          <span>{formatStorageCapacityLabel(storageUsed)} / {planTier === "free" ? "500MB" : "1GB"}</span>
        </div>
        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((storageUsed / currentLimit) * 100, 100)}%` }}
            className={clsx("h-full transition-colors", (storageUsed / currentLimit) > 0.9 ? "bg-red-500" : "bg-[var(--color-accent)]")}
          />
        </div>
      </div>

      <AnimatePresence>
        {showUpsell && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-50 bg-[#0A0A15]/95 backdrop-blur-3xl rounded-3xl border border-red-500/30 p-6 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white tracking-wide">Capacity Reached</h4>
            <p className="text-xs text-gray-400 leading-relaxed">You have exceeded the 500MB storage limit on the Free tier. Upgrade to Pro for 1GB.</p>
            <button onClick={() => setShowUpsell(false)} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all">
              Upgrade to Pro - 1GB
            </button>
            <button onClick={() => setShowUpsell(false)} className="text-xs text-gray-500 hover:text-white mt-1 transition-colors">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
