"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, MessageSquare, LayoutDashboard, Database, RefreshCw, FileText, Trash2, PlusCircle, ShieldCheck, FileCheck2, Loader2, ArrowLeft } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const { activeWorkspace } = useWorkspace();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && activeWorkspace) {
        setUserEmail(user.email || "");
        // Fetch recent docs
        const { data } = await supabase
          .from('documents')
          .select('*')
          .eq('workspace_id', activeWorkspace.id)
          .order('created_at', { ascending: false })
          .limit(4);
        if (data) setRecentDocs(data);
        setIsLoadingDocs(false);
      } else if (!user) {
        router.push('/login');
      }
    }
    loadUser();
  }, [supabase, router, activeWorkspace]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | any) => {
    const file = event.target?.files?.[0] || event.dataTransfer?.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      if (!activeWorkspace) {
        alert("No active workspace selected");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      setUploadProgress(40);
      const { error: uploadError } = await supabase.storage.from('nexus_docs').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      setUploadProgress(70);
      
      const docPayload = {
        workspace_id: activeWorkspace.id,
        user_id: user.id,
        file_name: file.name,
        file_size_bytes: file.size,
        storage_path: filePath,
        vector_status: 'pending'
      };
      const { data: docData, error: dbError } = await supabase.from('documents').insert(docPayload).select().single();
      
      if (dbError) throw dbError;

      const versionPayload = {
        document_id: docData.id,
        version_number: 1,
        checksum: "pending_checksum"
      };
      const { data: versionData, error: versionError } = await supabase.from('document_versions').insert(versionPayload).select().single();

      if (versionError) throw versionError;

      await supabase.from('documents').update({
        current_version_id: versionData.id
      }).eq('id', docData.id);
      
      // Notify ingest
      const ingestRes = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docData.id, workspaceId: activeWorkspace.id })
      });
      if (!ingestRes.ok) {
        await supabase.from('documents').delete().eq('id', docData.id);
        await supabase.storage.from('nexus_docs').remove([filePath]);
        throw new Error("[UPLOAD] /api/ingest failed: " + await ingestRes.text());
      }
      
      setRecentDocs(prev => [docData, ...prev].slice(0, 4));
      setUploadProgress(100);
      
    } catch (e) {
      console.error(e);
      alert("Failed to upload document. If it is a very large PDF, it may have timed out during vector generation.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDocument = async (docId: string, storagePath: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      const { error: storageError } = await supabase.storage.from('nexus_docs').remove([storagePath]);
      if (storageError) throw new Error(`Storage deletion failed: ${storageError.message}`);

      const { error: dbError } = await supabase.from('documents').delete().eq('id', docId);
      if (dbError) throw dbError;

      setRecentDocs(prev => prev.filter(d => d.id !== docId));
    } catch (e) {
      console.error(e);
      alert("Failed to delete document");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e);
  };

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const firstName = userEmail.split('@')[0] || 'Guest';

  return (
    <div className="bg-slate-50 min-h-[100dvh] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full z-40 flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 transition-all duration-300">
        <div className="flex items-center gap-3 p-6 mb-4">
          <img src="/bot.jpg" alt="Cura Logo" className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
          <div>
            <h1 className="font-light text-xl tracking-tighter text-slate-900 uppercase">Cura</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Your AI Companion</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/workspace" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-all rounded-xl text-sm font-medium">
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-all rounded-xl text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link href="/upload-pro" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
            <Database className="w-4 h-4" />
            <span>Resources</span>
          </Link>
        </nav>
        
        <div className="p-4 mt-auto">
          <Link href="/workspace" className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
            <PlusCircle className="w-4 h-4" />
            New Session
          </Link>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-64 relative overflow-y-auto h-[100dvh] custom-scrollbar">
        
        {/* Header */}
        <header className="sticky top-0 z-30 px-8 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-light text-slate-900 tracking-tight">Upload Documents</h2>
            <p className="text-sm text-slate-500 font-light mt-1">Share knowledge with Cura for personalized insights.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors mr-2 hidden md:block">Return Home</Link>
            <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center font-medium text-slate-600 shadow-sm">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <section className="px-8 py-10 max-w-4xl mx-auto space-y-12">
          
          {/* Upload Area */}
          <div 
            onDragEnter={preventDefaults}
            onDragOver={preventDefaults}
            onDragLeave={preventDefaults}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative overflow-hidden bg-white rounded-3xl p-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 transition-all duration-300 group cursor-pointer hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.txt,.md" />
            
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              {isUploading ? (
                <div className="w-20 h-20 bg-blue-50 border border-blue-100 shadow-xl shadow-blue-500/10 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25" />
                  <div className="relative w-20 h-20 bg-white border border-slate-100 shadow-xl shadow-slate-200 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileUp className="w-8 h-8 text-blue-500" />
                  </div>
                </>
              )}
            </div>
            
            <div className="text-center space-y-2 z-10">
              <h3 className="text-2xl font-light text-slate-900 tracking-tight">
                {isUploading ? `Uploading ${uploadProgress}%...` : 'Drag & Drop PDFs'}
              </h3>
              <p className="text-slate-500 font-light max-w-sm mx-auto text-sm">Upload context documents, reports, or logs. Cura will analyze them intelligently.</p>
            </div>
            
            <div className="mt-8 z-10">
              <button disabled={isUploading} className="px-8 py-3 bg-blue-600 text-white rounded-full text-sm font-medium uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50">
                Browse Files
              </button>
            </div>
            <p className="mt-6 text-xs text-slate-400 font-medium uppercase tracking-widest">Max 25MB • PDF, TXT</p>
          </div>
          
          {/* Recently Uploaded */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-lg font-medium text-slate-900">Recent Analysis</h4>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">View All &rarr;</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoadingDocs ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-5 flex items-start gap-4 border border-slate-200 animate-pulse">
                     <div className="w-12 h-12 bg-slate-100 rounded-xl shrink-0" />
                     <div className="flex-1 min-w-0 space-y-2 py-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/4 mb-3" />
                        <div className="h-6 bg-emerald-50 rounded w-16" />
                     </div>
                  </div>
                ))
              ) : recentDocs.length === 0 ? (
                <div className="col-span-2 border border-slate-200 bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-8 h-8 mb-3 opacity-50" />
                  <span className="text-sm font-medium">No documents uploaded yet</span>
                </div>
              ) : (
                recentDocs.map((doc, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={doc.id} 
                    className="bg-white rounded-2xl p-5 flex items-start gap-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h5 className="text-sm font-medium text-slate-800 truncate flex-1" title={doc.file_name}>{doc.file_name}</h5>
                        <button 
                          onClick={() => handleDeleteDocument(doc.id, doc.storage_path)}
                          className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB</p>
                      
                      <div className="flex items-center gap-1.5 py-1 px-2.5 bg-emerald-50 border border-emerald-100 w-fit rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Ready</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
          
          {/* Educational Tip */}
          <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-xl shadow-slate-900/10">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="w-20 h-20 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <div className="space-y-3 z-10">
              <h4 className="text-xl font-medium tracking-tight">Enterprise-Grade Security</h4>
              <p className="text-slate-300 text-sm font-light leading-relaxed max-w-xl">
                All uploaded documents are encrypted and accessible exclusively within your private workspace. Cura uses localized vector processing to ensure your intellectual property never leaves our secure environment.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around px-4 z-50">
        <Link href="/workspace" className="flex flex-col items-center gap-1 text-slate-500">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold">Chat</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-slate-500">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Dash</span>
        </Link>
        <Link href="/upload-pro" className="flex flex-col items-center gap-1 text-blue-600">
          <Database className="w-5 h-5" />
          <span className="text-[10px] font-bold">Docs</span>
        </Link>
      </nav>
    </div>
  );
}
