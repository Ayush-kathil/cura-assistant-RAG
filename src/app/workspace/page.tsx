// @ts-nocheck
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useChatSession } from "@/hooks/useChatSession";
import { Menu, X, MessageSquare, LayoutDashboard, Database, PlusCircle, User, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function WorkspacePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    documents,
    setDocuments,
    messages,
    setMessages,
    generationState,
    currentLeafId,
    activeDocumentIds,
    setActiveDocumentIds,
    personaInstruction,
    setPersonaInstruction,
    chatSessions,
    currentSessionId,
    userEmail,
    selectedModel,
    setSelectedModel,
    saveUserMessage,
    saveAssistantMessage,
    loadChatSession,
    deleteChatSession,
    clearChat
  } = useChatSession();
  
  const { activeWorkspace } = useWorkspace();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
      
      const { data: docData, error: dbError } = await supabase.from('documents').insert({
        workspace_id: activeWorkspace.id,
        user_id: user.id,
        file_name: file.name,
        file_size_bytes: file.size,
        storage_path: filePath,
        vector_status: 'pending'
      }).select().single();
      
      if (dbError) throw dbError;

      const { data: versionData, error: versionError } = await supabase.from('document_versions').insert({
        document_id: docData.id,
        version_number: 1,
        checksum: "pending_checksum"
      }).select().single();

      if (versionError) throw versionError;

      await supabase.from('documents').update({
        current_version_id: versionData.id
      }).eq('id', docData.id);
      
      // Notify ingest
      await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docData.id, workspaceId: activeWorkspace.id })
      });
      
      setDocuments(prev => [docData, ...prev]);
      setUploadProgress(100);
      
    } catch (e) {
      console.error(e);
      alert("Failed to upload document");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDocument = async (docId: string, storagePath: string) => {
    try {
      const { error: storageError } = await supabase.storage.from('nexus_docs').remove([storagePath]);
      if (storageError) console.error("Storage deletion error:", storageError);
      
      const { error: dbError } = await supabase.from('documents').delete().eq('id', docId);
      if (dbError) throw dbError;
      
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setActiveDocumentIds(prev => prev.filter(id => id !== docId));
    } catch (e) {
      console.error(e);
      alert("Failed to delete document");
    }
  };

  const firstName = userEmail?.split('@')[0] || 'Guest';

  return (
    <div className="bg-slate-50 h-screen text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 flex overflow-hidden">
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="md:hidden absolute inset-0 bg-slate-900/20 z-30 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <aside className={`fixed md:relative left-0 top-0 h-full z-40 flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 p-6 mb-4">
          <img src="/bot.jpg" alt="Cura Logo" className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
          <div>
            <h1 className="font-light text-xl tracking-tighter text-slate-900 uppercase">Cura</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Your AI Companion</p>
          </div>
        </div>
        
        <div className="px-4 mb-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700 capitalize">{firstName}</span>
              <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">Free Plan</span>
            </div>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          <Link href="/workspace" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-all rounded-xl text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link href="/upload-pro" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-all rounded-xl text-sm font-medium">
            <Database className="w-4 h-4" />
            <span>Resources</span>
          </Link>
        </nav>

        <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 px-4 pb-4 space-y-6">
          {(() => {
            const groups: Record<string, any[]> = { 'Today': [], 'Previous 7 Days': [], 'Older': [] };
            const today = new Date();
            today.setHours(0,0,0,0);
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            chatSessions.forEach(session => {
              const sessionDate = new Date(session.created_at);
              if (sessionDate >= today) groups['Today'].push(session);
              else if (sessionDate >= sevenDaysAgo) groups['Previous 7 Days'].push(session);
              else groups['Older'].push(session);
            });

            return Object.entries(groups).map(([label, sessions]) => (
              sessions.length > 0 && (
                <div key={label} className="flex flex-col gap-1">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-2">{label}</h3>
                  {sessions.map(session => (
                    <div key={session.id} className="flex justify-between items-center group rounded-lg transition-all hover:bg-slate-100 pr-1">
                      <button 
                        onClick={() => { loadChatSession(session.id); setIsSidebarOpen(false); }} 
                        className={`px-3 py-2 text-sm truncate flex-1 text-left ${currentSessionId === session.id ? 'bg-blue-50 text-blue-700 font-medium rounded-lg' : 'text-slate-500 font-light'}`}
                      >
                        {session.title}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteChatSession(session.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )
            ));
          })()}
          
          {chatSessions.length === 0 && (
            <div className="px-2 py-2 text-xs text-slate-400 font-light">No history yet</div>
          )}
        </div>

        <div className="p-4 mt-auto border-t border-slate-100">
          <button onClick={() => { clearChat(); setIsSidebarOpen(false); }} className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
            <PlusCircle className="w-4 h-4" />
            New Session
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col relative bg-white md:bg-transparent min-w-0 md:rounded-l-3xl shadow-[-10px_0_40px_rgba(0,0,0,0.03)] border-l border-slate-200">
        
        {/* Chat Header */}
        <header className="flex items-center justify-between px-6 py-4 md:py-6 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-medium text-slate-800 tracking-tight">
              {currentSessionId ? chatSessions.find(s => s.id === currentSessionId)?.title || "Current Session" : "New Session"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-wider font-bold">{documents.length} Docs Indexed</span>
            </div>
            {isUploading && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                Uploading {uploadProgress}%
              </div>
            )}
            <Link href="/dashboard" className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full font-medium shadow-md hover:bg-slate-800 transition-all text-sm">
              <LayoutDashboard className="w-4 h-4" />
              Save & Dashboard
            </Link>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-200 hover:shadow-md transition-all text-slate-500">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ChatInterface container */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-white">
          <ChatInterface 
            messages={messages}
            setMessages={setMessages}
            currentSessionId={currentSessionId}
            saveUserMessage={saveUserMessage}
            saveAssistantMessage={saveAssistantMessage}
            generationState={generationState}
            onNewSession={clearChat}
            documents={documents.map(d => ({ id: d.id, filename: d.file_name }))}
            activeDocumentIds={activeDocumentIds}
            onToggleDocument={(id) => setActiveDocumentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            currentLeafId={currentLeafId}
            onNavigateBranch={(id) => {}}
            onToggleKbExplorer={() => {}}
            personaInstruction={personaInstruction}
            onPersonaChange={setPersonaInstruction}
            onSetScopedDocument={(id) => id ? setActiveDocumentIds([id]) : setActiveDocumentIds([])}
            onApproveAction={() => {}}
            onViewArtifact={() => {}}
            isDevMode={true}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onTriggerUpload={() => fileInputRef.current?.click()}
          />
        </div>
      </main>
      
      {/* Hidden file input for document upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".pdf,.txt,.md,.csv" 
      />
    </div>
  );
}
