"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useChatSession } from "@/hooks/useChatSession";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
    sendMessage,
    loadChatSession,
    deleteChatSession,
    clearChat
  } = useChatSession();

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      setUploadProgress(40);
      const { error: uploadError } = await supabase.storage.from('nexus_docs').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      setUploadProgress(70);
      
      const { data, error: dbError } = await supabase.from('documents').insert({
        user_id: user.id,
        file_name: file.name,
        file_size_bytes: file.size,
        storage_path: filePath,
        vector_status: 'pending'
      }).select().single();
      
      if (dbError) throw dbError;
      
      setDocuments(prev => [data, ...prev]);
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
    <div className="font-body-md text-body-md bg-[#f9f9ff] text-[#111c2c] h-screen flex overflow-hidden">
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="md:hidden absolute inset-0 bg-slate-900/20 z-30 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <aside className={`fixed md:relative left-0 top-0 h-full z-40 flex flex-col p-4 bg-white border-r border-gray-200 w-64 shadow-lg shadow-primary/5 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col gap-6 h-full">
          <div className="px-2 pt-4">
            <h1 className="font-headline-md text-headline-md text-primary font-bold">Cura AI</h1>
            <p className="font-label-sm text-label-sm text-gray-500">Your friendly companion</p>
          </div>
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-gray-800 capitalize">{firstName}</span>
              <span className="text-[10px] uppercase tracking-wider text-primary font-bold">Free Plan</span>
            </div>
          </div>
          
          <button onClick={() => { clearChat(); setIsSidebarOpen(false); }} className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-transform">
            <span className="material-symbols-outlined">add</span>
            <span className="font-label-md">New Chat</span>
          </button>

          <nav className="flex-1 flex flex-col gap-2 mt-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-all duration-300 ease-in-out">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-label-md">Dashboard</span>
            </Link>
            <Link href="/workspace" className="flex items-center gap-3 px-4 py-3 bg-[#e7eeff] text-[#005870] rounded-xl transition-all duration-300 ease-in-out font-bold">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>chat_bubble</span>
              <span className="font-label-md">Chat</span>
            </Link>
            <Link href="/upload-pro" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-all duration-300 ease-in-out">
              <span className="material-symbols-outlined">upload_file</span>
              <span className="font-label-md">Upload Data</span>
            </Link>
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-100 overflow-y-auto max-h-[250px] custom-scrollbar pr-2">
            <h3 className="text-label-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Recent Chats</h3>
            <div className="flex flex-col gap-1">
              {chatSessions.length === 0 ? (
                <div className="px-2 py-2 text-label-md text-gray-400">No history yet</div>
              ) : (
                chatSessions.map(session => (
                  <div key={session.id} className="flex justify-between items-center group">
                    <div 
                      onClick={() => { loadChatSession(session.id); setIsSidebarOpen(false); }} 
                      className={`px-3 py-2 text-label-md rounded-xl truncate cursor-pointer flex-1 transition-all ${currentSessionId === session.id ? 'bg-[#e7eeff] text-[#005870] font-bold' : 'text-gray-500 hover:text-primary hover:bg-gray-50'}`}
                    >
                      {session.title}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteChatSession(session.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-opacity">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col relative bg-white md:bg-transparent min-w-0 md:rounded-l-3xl shadow-[-20px_0_40px_rgba(12,103,128,0.03)] border-l border-gray-200">
        
        {/* Chat Header */}
        <header className="flex items-center justify-between px-6 py-4 md:py-6 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-headline-md text-headline-md text-[#5ebce3] font-semibold">
              {currentSessionId ? chatSessions.find(s => s.id === currentSessionId)?.title || "Current Session" : "New Session"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-[#e3f4fb] text-[#2c6e8e] rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#1b4e6b] animate-pulse"></span>
              <span className="text-[12px] uppercase tracking-wider">{documents.length} Docs Indexed</span>
            </div>
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-primary">more_vert</span>
            </button>
          </div>
        </header>

        {/* ChatInterface container */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <ChatInterface 
            messages={messages}
            onSendMessage={(msg, parentId) => sendMessage(msg, parentId)}
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
          />
        </div>
      </main>
    </div>
  );
}
