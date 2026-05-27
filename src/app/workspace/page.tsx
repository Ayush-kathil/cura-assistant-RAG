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

  return (
    <div className="bg-slate-50 text-slate-900 font-sans overflow-hidden min-h-[100dvh]">
      <div className="flex h-[100dvh] overflow-hidden md:p-2 md:gap-2 relative bg-slate-100">
        
        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="md:hidden absolute inset-0 bg-slate-900/20 z-30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside className={`bg-white border-r md:border border-slate-200 absolute md:relative h-full w-[280px] z-40 flex flex-col py-6 overflow-hidden md:rounded-3xl shadow-sm transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="px-6 mb-6">
            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold">C</div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-sm text-blue-900 truncate">Curio Workspace</p>
                <p className="text-[10px] text-blue-600 uppercase tracking-widest">Personal</p>
              </div>
            </div>
          </div>

          <div className="px-6 mb-4">
            <button onClick={() => { clearChat(); setIsSidebarOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-bold text-sm py-3 rounded-2xl active:scale-95 transition-all hover:bg-blue-600 shadow-md">
              <span className="material-symbols-outlined text-[18px]">add_comment</span>
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-6 relative z-10 custom-scrollbar">
            {/* Knowledge Base Section */}
            <div>
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Knowledge Base</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{documents.length}</span>
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all mb-3 group relative overflow-hidden"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500 animate-spin">refresh</span>
                    <span className="text-xs font-bold text-blue-600">Uploading {uploadProgress}%</span>
                    <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-500 transition-colors">cloud_upload</span>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600">Upload PDF</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".pdf,.txt,.md" 
                />
              </div>

              <div className="space-y-1">
                {documents.slice(0, 3).map(doc => (
                  <div key={doc.id} className="group text-slate-600 bg-white border border-slate-100 rounded-xl p-2.5 flex items-center gap-2 text-xs hover:border-slate-200 transition-all shadow-sm">
                    <span className="material-symbols-outlined text-[16px] text-blue-500">description</span>
                    <span className="truncate flex-1 font-medium">{doc.file_name}</span>
                    <button onClick={() => handleDeleteDocument(doc.id, doc.storage_path)} className="opacity-100 md:opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                ))}
                {documents.length > 3 && (
                  <div className="text-center mt-2">
                    <button className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-wider">View All ({documents.length})</button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat History Section */}
            <div>
              <div className="mb-3 px-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chat History</span>
              </div>
              <div className="space-y-1">
                {chatSessions.length === 0 ? (
                  <div className="px-2 py-2 text-center">
                    <span className="text-xs font-medium text-slate-400">No history yet</span>
                  </div>
                ) : (
                  chatSessions.map(session => (
                    <div key={session.id} onClick={() => { loadChatSession(session.id); setIsSidebarOpen(false); }} className={`text-slate-600 hover:bg-slate-50 rounded-2xl p-2.5 flex items-center justify-between cursor-pointer transition-all group ${currentSessionId === session.id ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        <span className="text-xs truncate font-medium">{session.title}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteChatSession(session.id); }} className="opacity-100 md:opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto px-6 pt-4 border-t border-slate-100 pb-2">
            <div className="text-center pb-2">
               <p className="text-[10px] text-slate-400 font-medium">Developed by Kathil Softwares Limited by Ayush</p>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col relative bg-[#FAFCFF] min-w-0 md:rounded-3xl md:border border-slate-200 shadow-sm overflow-hidden">
          <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <img src="/mobile-assets/curio.png" className="w-8 h-8 object-cover rounded-full bg-slate-100 border border-slate-200 shadow-sm p-0.5" /> 
                <span className="hidden sm:inline">Curio AI</span>
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-bold text-[11px] uppercase tracking-wider">{documents.length} Docs Indexed</span>
              </div>
              <div onClick={() => router.push('/workspace/profile')} className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-sm cursor-pointer hover:bg-blue-600 transition-colors">
                {userEmail?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative">
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

    </div>
  );
}
