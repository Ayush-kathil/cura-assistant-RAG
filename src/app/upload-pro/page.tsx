"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
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
          .limit(3);
        if (data) setRecentDocs(data);
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
      console.log("[DB Write] table: documents, payload:", docPayload);
      const { data: docData, error: dbError } = await supabase.from('documents').insert(docPayload).select().single();
      
      if (dbError) {
        console.error("[DB Error] table: documents, error:", dbError);
        throw dbError;
      }

      const versionPayload = {
        document_id: docData.id,
        version_number: 1,
        checksum: "pending_checksum"
      };
      console.log("[DB Write] table: document_versions, payload:", versionPayload);
      const { data: versionData, error: versionError } = await supabase.from('document_versions').insert(versionPayload).select().single();

      if (versionError) {
        console.error("[DB Error] table: document_versions, error:", versionError);
        throw versionError;
      }

      await supabase.from('documents').update({
        current_version_id: versionData.id
      }).eq('id', docData.id);
      
      // Notify ingest
      console.log("[UPLOAD] Triggering /api/ingest for document:", docData.id);
      const ingestRes = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docData.id, workspaceId: activeWorkspace.id })
      });
      if (!ingestRes.ok) {
        // Rollback: delete document if ingestion failed (e.g. timeout for large PDFs)
        await supabase.from('documents').delete().eq('id', docData.id);
        await supabase.storage.from('nexus_docs').remove([filePath]);
        throw new Error("[UPLOAD] /api/ingest failed: " + await ingestRes.text());
      }
      
      setRecentDocs(prev => [docData, ...prev].slice(0, 3));
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
      const { error: dbError } = await supabase.from('documents').delete().eq('id', docId);
      if (dbError) throw dbError;
      
      const { error: storageError } = await supabase.storage.from('nexus_docs').remove([storagePath]);
      if (storageError) throw storageError;

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
    <div className="bg-background text-on-background font-body-md min-h-screen flex overflow-hidden">
      
      {/* SideNavBar Anchor */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full z-40 flex-col p-4 bg-surface-container-low h-screen w-64 rounded-r-lg shadow-lg shadow-primary/5 transition-all duration-300 ease-in-out">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" data-icon="clinical_notes">clinical_notes</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md text-primary leading-tight">Cura AI</h1>
            <p className="text-[10px] font-label-sm text-on-surface-variant uppercase tracking-wider">Your friendly companion</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/workspace" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-secondary-container/50 transition-all rounded-xl font-body-md text-body-md">
            <span className="material-symbols-outlined" data-icon="chat_bubble">chat_bubble</span>
            <span>Chat</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-secondary-container/50 transition-all rounded-xl font-body-md text-body-md">
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/upload-pro" className="flex items-center gap-4 px-4 py-3 bg-primary-container text-on-primary-container rounded-xl font-body-md text-body-md">
            <span className="material-symbols-outlined" data-icon="auto_stories" style={{fontVariationSettings: "'FILL' 1"}}>auto_stories</span>
            <span className="font-bold">Resources</span>
          </Link>
        </nav>
        
        <div className="mt-auto">
          <Link href="/workspace" className="w-full py-4 bg-primary text-white rounded-xl font-label-md flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md">
            <span className="material-symbols-outlined" data-icon="add">add</span>
            New Conversation
          </Link>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 ml-0 md:ml-64 relative overflow-y-auto h-screen custom-scrollbar bg-background">
        
        {/* Floating Header */}
        <header className="sticky top-0 z-30 px-margin-desktop py-6 flex justify-between items-center bg-background/80 backdrop-blur-md">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">Upload Documents</h2>
            <p className="font-body-md text-on-surface-variant">Share medical reports or health logs with Cura for personalized insights.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary" data-icon="notifications">notifications</span>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden bg-white flex items-center justify-center font-bold text-primary">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <section className="px-margin-desktop pb-12 max-w-5xl mx-auto space-y-10">
          
          {/* Upload Area */}
          <div 
            onDragEnter={preventDefaults}
            onDragOver={preventDefaults}
            onDragLeave={preventDefaults}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative overflow-hidden glass-panel rounded-xl p-12 flex flex-col items-center justify-center border-4 border-dashed border-primary-container/40 transition-all duration-300 group cursor-pointer hover:border-primary/50"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.txt,.md" />
            
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              {isUploading ? (
                <div className="w-20 h-20 bg-white shadow-xl shadow-primary/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 bg-primary-container/20 rounded-full animate-ping opacity-25"></div>
                  <div className="relative w-20 h-20 bg-white shadow-xl shadow-primary/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-primary animate-bounce" data-icon="upload_file">upload_file</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="text-center space-y-2 z-10">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {isUploading ? `Uploading ${uploadProgress}%...` : 'Drag & Drop PDF Reports'}
              </h3>
              <p className="font-body-md text-on-surface-variant max-w-sm mx-auto">Upload blood work, symptom logs, or wellness PDFs. Cura will analyze them with you.</p>
            </div>
            
            <div className="mt-8 flex gap-4 z-10">
              <button disabled={isUploading} className="px-6 py-3 bg-primary text-white rounded-full font-label-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50">
                Browse Files
              </button>
            </div>
            <p className="mt-6 text-label-sm text-on-tertiary-fixed-variant">Maximum file size: 25MB • Supported format: .PDF</p>
          </div>
          
          {/* Recently Uploaded */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-headline-md text-headline-md text-primary">Recent Analysis</h4>
              <button className="text-label-md text-primary hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {recentDocs.length === 0 ? (
                <div className="border-2 border-dashed border-outline-variant/30 rounded-lg p-5 flex items-center justify-center gap-3 text-on-surface-variant">
                  <span className="font-label-md">No documents uploaded yet</span>
                </div>
              ) : (
                recentDocs.map((doc, idx) => (
                  <div key={idx} className="glass-panel rounded-lg p-5 flex items-start gap-4 hover:shadow-xl transition-all border border-transparent hover:border-primary-container/50">
                    <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h5 className="font-label-md text-on-surface truncate flex-1">{doc.file_name}</h5>
                        <button 
                          onClick={() => handleDeleteDocument(doc.id, doc.storage_path)}
                          className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-full transition-colors flex-shrink-0 flex items-center justify-center"
                          title="Delete Document"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      <p className="text-label-sm text-on-tertiary-fixed-variant mb-3">{(doc.file_size_bytes / 1024 / 1024).toFixed(2)} MB</p>
                      
                      <div className="flex items-center gap-2 py-1 px-3 bg-primary-container/30 w-fit rounded-full">
                        <span className="material-symbols-outlined text-sm text-on-primary-container" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                        <span className="text-[11px] font-bold text-on-primary-container uppercase">Ready</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-outline-variant/30 rounded-lg p-5 flex items-center justify-center gap-3 text-on-surface-variant hover:border-primary-container transition-colors cursor-pointer group">
                <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">add_circle</span>
                <span className="font-label-md">Upload more for history</span>
              </div>
            </div>
          </div>
          
          {/* Educational Tip */}
          <div className="p-8 rounded-xl bg-gradient-to-br from-primary-container/40 to-secondary-container/20 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
            <div className="w-24 h-24 shrink-0 rounded-full bg-white flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-4xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>
            </div>
            <div className="space-y-2">
              <h4 className="font-headline-md text-headline-md text-primary">Your Privacy First</h4>
              <p className="font-body-md text-on-primary-container">All uploaded documents are encrypted and only accessible to you. Cura uses local-first processing for sensitive medical metadata to ensure your data never leaves the secure environment without your consent.</p>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="w-full py-12 px-margin-desktop mt-auto flex flex-col items-center gap-4 bg-surface-container-highest rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm" data-icon="clinical_notes">clinical_notes</span>
            </div>
            <span className="font-headline-md text-primary">Cura AI</span>
          </div>
          <nav className="flex gap-8">
            <a className="font-label-sm text-on-tertiary-fixed-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-sm text-on-tertiary-fixed-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="font-label-sm text-on-tertiary-fixed-variant hover:text-primary transition-colors" href="#">Contact Us</a>
          </nav>
          <p className="font-label-sm text-on-tertiary-fixed-variant opacity-70">© 2024 Cura AI. Made with empathy.</p>
        </footer>
      </main>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-primary-container/20 flex items-center justify-around px-4 z-50">
        <Link href="/workspace" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">chat_bubble</span>
          <span className="text-[10px] font-bold">Chat</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold">Dash</span>
        </Link>
        <Link href="/upload-pro" className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>auto_stories</span>
          <span className="text-[10px] font-bold">Docs</span>
        </Link>
      </nav>
    </div>
  );
}
