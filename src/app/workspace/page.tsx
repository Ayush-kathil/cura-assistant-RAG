"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useChatSession } from "@/hooks/useChatSession";
import { MobileCurioHome } from "@/components/chat/MobileCurioHome";
import { MobileCurioChat } from "@/components/chat/MobileCurioChat";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function WorkspacePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileView, setMobileView] = useState<'home' | 'chat' | 'kb'>('home');
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

  const handleStartMobileChat = (initialMessage?: string) => {
    setMobileView('chat');
    if (initialMessage) {
      sendMessage(initialMessage);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans overflow-hidden min-h-[100dvh]">
      
      {/* --- MOBILE VIEW --- */}
      <div className="md:hidden h-full flex flex-col">
        {mobileView === 'home' && (
          <MobileCurioHome 
            userEmail={userEmail} 
            onNavigate={setMobileView} 
            onStartChat={handleStartMobileChat} 
          />
        )}
        {mobileView === 'chat' && (
          <MobileCurioChat 
            messages={messages} 
            userEmail={userEmail} 
            generationState={generationState}
            onNavigate={setMobileView} 
            onSendMessage={(msg) => sendMessage(msg, currentLeafId)} 
          />
        )}
        {mobileView === 'kb' && (
          <div className="flex flex-col h-full bg-white p-6">
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Knowledge Base</h2>
              <button onClick={() => setMobileView('home')} className="p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto">
              <p className="text-slate-500 mb-4 text-sm">Upload documents to allow Curio to answer questions based on your data.</p>
              {documents.map(doc => (
                <div key={doc.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl mb-2 shadow-sm">
                  <span className="text-sm font-medium truncate">{doc.file_name}</span>
                </div>
              ))}
              {documents.length === 0 && <p className="text-sm text-slate-400 italic">No documents uploaded yet.</p>}
            </div>
          </div>
        )}
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:flex h-[100dvh] overflow-hidden p-2 gap-2 relative bg-slate-100">
        
        {/* Left Sidebar */}
        <aside className="bg-white border border-slate-200 relative h-full w-[280px] z-40 flex flex-col py-6 overflow-hidden rounded-3xl shadow-sm">
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
            <button onClick={clearChat} className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-bold text-sm py-3 rounded-2xl active:scale-95 transition-all hover:bg-blue-600 shadow-md">
              <span className="material-symbols-outlined text-[18px]">add_comment</span>
              New Chat
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 space-y-1 relative z-10 custom-scrollbar">
            {chatSessions.length === 0 ? (
              <div className="px-4 py-2 mt-4 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No history yet</span>
              </div>
            ) : (
              chatSessions.map(session => (
                <div key={session.id} onClick={() => loadChatSession(session.id)} className={`text-slate-600 hover:bg-slate-50 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all group ${currentSessionId === session.id ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span className="text-sm truncate">{session.title}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteChatSession(session.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))
            )}
          </nav>

          <div className="mt-auto px-6 pt-4 border-t border-slate-100">
            <div onClick={handleLogout} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
              <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-500">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-slate-700">Logout</p>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">logout</span>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col relative bg-[#FAFCFF] min-w-0 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <img src="/mobile-assets/curio.png" className="w-6 h-6 object-contain" /> Curio AI
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-bold text-[11px] uppercase tracking-wider">{documents.length} Docs Indexed</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
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
