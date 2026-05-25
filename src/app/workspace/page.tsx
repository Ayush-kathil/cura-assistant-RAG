"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ChatInterface, GenerationState } from "@/components/chat/ChatInterface";
import { Message } from "@/lib/storage";
import { generateStreamingResponse, generateEmbedding, generateEmbeddingsBatch } from "@/lib/gemini";
import { VectorStoreData, chunkText, hybridSearchVectorStore } from "@/lib/vectorStore";
import Link from "next/link";

interface DocumentItem {
  id: string;
  file_name: string;
  file_size_bytes: number;
  storage_path: string;
  vector_status: string;
  chunks?: string[];
}

export default function WorkspacePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [currentLeafId, setCurrentLeafId] = useState<string | null>(null);
  const [activeDocumentIds, setActiveDocumentIds] = useState<string[]>([]);
  const [personaInstruction, setPersonaInstruction] = useState<string>("");
  const [vectorStore, setVectorStore] = useState<VectorStoreData>({ parents: [], children: [] });
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
    fetchChatSessions();
  }, []);

  const fetchChatSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserEmail(user.email || "U");
    const { data } = await supabase.from('chat_sessions').select('*').order('created_at', { ascending: false });
    if (data) setChatSessions(data);
  };

  const loadChatSession = async (sessionId: string) => {
    const { data: messages } = await supabase.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
    if (messages) {
      // Reconstruct messages for UI
      const uiMessages: Message[] = messages.map((m: any) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        parentId: null, // simplify for loaded history
        childrenIds: []
      }));
      setMessages(uiMessages);
      setCurrentSessionId(sessionId);
    }
  };

  const deleteChatSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('chat_sessions').delete().eq('id', sessionId);
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  const fetchDocuments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(error);
    } else if (data) {
      setDocuments(data);
    }
  };

  const handleSendMessage = async (msg: string, parentId: string | null) => {
    const userMsgId = `msg-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      parentId,
      childrenIds: [],
      role: "user",
      content: msg
    };

    setMessages(prev => {
      const parent = prev.find(p => p.id === parentId);
      if (parent) parent.childrenIds.push(userMsgId);
      return [...prev, userMsg];
    });
    setCurrentLeafId(userMsgId);

    const botMsgId = `bot-${Date.now()}`;
    const botMsg: Message = {
      id: botMsgId,
      parentId: userMsgId,
      childrenIds: [],
      role: "assistant",
      content: ""
    };

    setMessages(prev => {
      const parent = prev.find(p => p.id === userMsgId);
      if (parent) parent.childrenIds.push(botMsgId);
      return [...prev, botMsg];
    });
    setCurrentLeafId(botMsgId);

    // Save to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let sessionId = currentSessionId;
      if (!sessionId) {
        const { data: session } = await supabase.from('chat_sessions').insert({ user_id: user.id, title: msg.substring(0, 30) }).select().single();
        if (session) {
          sessionId = session.id;
          setCurrentSessionId(sessionId);
          setChatSessions(prev => [session, ...prev]);
        }
      }
      if (sessionId) {
        await supabase.from('chat_messages').insert({ session_id: sessionId, role: 'user', content: msg });
      }
    }

    setGenerationState("synthesizing");
    let contextChunks: any[] = [];
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    if (activeDocumentIds.length > 0) {
      // Index any active documents that haven't been indexed yet
      const docsToIndex = documents.filter(d => 
        activeDocumentIds.includes(d.id) && 
        !vectorStore.parents.some(p => p.documentId === d.id)
      );

      if (docsToIndex.length > 0) {
        let newParents = [...vectorStore.parents];
        let newChildren = [...vectorStore.children];

        for (const doc of docsToIndex) {
          try {
            let extractedChunks = doc.chunks && doc.chunks.length > 0 ? doc.chunks : null;

            if (!extractedChunks) {
              const { data, error } = await supabase.storage.from('nexus_docs').download(doc.storage_path);
              if (error || !data) continue;

              let fullText = "";
              if (doc.file_name.toLowerCase().endsWith('.pdf')) {
                const arrayBuffer = await data.arrayBuffer();
                const pdfjsLib = await import("pdfjs-dist");
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const textContent = await page.getTextContent();
                  const pageText = textContent.items.map((item: any) => item.str).join(" ");
                  fullText += pageText + "\n";
                }
              } else {
                fullText = await data.text();
              }

              if (!fullText.trim()) continue;
              extractedChunks = chunkText(fullText);
            }

            const parentChunks = extractedChunks.map((text: string, i: number) => ({
              id: crypto.randomUUID(),
              documentId: doc.id,
              filename: doc.file_name,
              text,
              chunkIndex: i
            }));

            const embeddings = await generateEmbeddingsBatch(extractedChunks, apiKey);
            const childChunks = extractedChunks.map((text: string, i: number) => ({
              id: crypto.randomUUID(),
              parentId: parentChunks[i].id,
              documentId: doc.id,
              filename: doc.file_name,
              text,
              embedding: embeddings[i],
              chunkIndex: i
            }));

            newParents = [...newParents, ...parentChunks];
            newChildren = [...newChildren, ...childChunks];
          } catch (e) {
            console.error("Failed to index doc:", doc.file_name, e);
          }
        }

        const newStore = { parents: newParents, children: newChildren };
        setVectorStore(newStore);
        
        try {
          const queryEmbedding = await generateEmbedding(msg, apiKey);
          contextChunks = hybridSearchVectorStore(msg, queryEmbedding, newStore, activeDocumentIds, 3);
        } catch (e) {
          console.error("Search failed", e);
        }
      } else {
        try {
          const queryEmbedding = await generateEmbedding(msg, apiKey);
          contextChunks = hybridSearchVectorStore(msg, queryEmbedding, vectorStore, activeDocumentIds, 3);
        } catch (e) {
          console.error("Search failed", e);
        }
      }
    }

    let finalAssistantText = "";

    try {
      await generateStreamingResponse(
        msg, 
        contextChunks, 
        "no-doc", 
        apiKey, 
        (text) => {
          finalAssistantText += text;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: m.content + text } : m));
        },
        personaInstruction
      );
      
      // Save AI message to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Use the functional state pattern to get the most up to date sessionId
        setMessages(prev => {
           // This is just a trick to ensure we execute after state updates, 
           // but actually we already have the ID in `currentSessionId` from before, 
           // or we can use a ref. Wait, the state `currentSessionId` might be stale 
           // in this closure if it was just created.
           return prev;
        });
        // We know we updated currentSessionId earlier or it was already set. 
        // Let's use the local variable `sessionId` we created at the top.
      }
    } catch (err: any) {
      console.error(err);
      finalAssistantText += `\n\n**Error:** ${err.message}`;
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: m.content + `\n\n**Error:** ${err.message}` } : m));
    } finally {
      // Re-fetch user and save using the closure's latest data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         // To avoid stale closure on currentSessionId, we should fetch the most recent session for this user if we don't have it locally.
         // Actually, we can fetch the latest session since we just created it or are using it.
         const { data: recentSession } = await supabase.from('chat_sessions').select('id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
         if (recentSession) {
           await supabase.from('chat_messages').insert({ session_id: recentSession.id, role: 'assistant', content: finalAssistantText });
         }
      }
      setGenerationState("idle");
    }
  };

  const executeDocumentUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      if (file.size > 50 * 1024 * 1024) throw new Error("File exceeds 50MB limit");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      setUploadProgress(40);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('nexus_docs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      // Extract and chunk the document before saving to DB
      let fullText = "";
      try {
        if (file.name.toLowerCase().endsWith('.pdf')) {
          const arrayBuffer = await file.arrayBuffer();
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            fullText += pageText + "\n";
          }
        } else {
          fullText = await file.text();
        }
      } catch (err) {
        console.warn("Failed to parse document on upload, it will be parsed later.", err);
      }

      const extractedChunks = fullText.trim() ? chunkText(fullText) : [];

      setUploadProgress(80);

      const { data: docData, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_size_bytes: file.size,
          storage_path: uploadData.path,
          vector_status: 'indexing',
          chunks: extractedChunks
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);
      setDocuments(prev => [docData, ...prev]);

    } catch (err: any) {
      alert(`Upload Failed: ${err.message}`);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const executeDocumentDeletion = async (docId: string, storagePath: string) => {
    try {
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (dbError) throw dbError;

      const { error: storageError } = await supabase.storage
        .from('nexus_docs')
        .remove([storagePath]);

      if (storageError) throw storageError;

      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err: any) {
      alert(`Delete Failed: ${err.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      executeDocumentUpload(e.target.files[0]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="bg-[#020617] text-white font-body-md overflow-hidden min-h-screen">
      <header className="md:hidden flex items-center justify-between px-md py-sm bg-surface-container border-b border-outline-variant/30 sticky top-0 z-50">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-xs text-on-surface">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="font-headline-sm text-headline-sm text-primary tracking-tight">Cura</span>
        <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-xs text-on-surface">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <div className="flex h-[calc(100vh)] overflow-hidden p-2 gap-2 relative">
        
        {/* Mobile overlay for left sidebar */}
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside className={`bg-[#0A0A15] relative h-full w-[280px] sm:w-sidebar-width fixed md:relative z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'} transition-all duration-300 border border-white/10 flex flex-col py-lg overflow-hidden rounded-3xl shadow-2xl`}>
          
          {/* 3D Animated Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[50%] bg-blue-900/20 blur-[100px] rounded-full animate-[spin_20s_linear_infinite]" />
            <div className="absolute bottom-[-10%] right-[-20%] w-[120%] h-[60%] bg-cyan-900/10 blur-[120px] rounded-full animate-[spin_25s_linear_infinite_reverse]" />
            <div className="absolute top-[40%] left-[10%] w-[80%] h-[40%] bg-indigo-900/10 blur-[90px] rounded-full animate-pulse" />
          </div>

          <div className="px-md mb-lg relative z-10">
            <div className="flex items-center gap-sm bg-surface-container-high p-sm rounded-xl cursor-pointer hover:bg-surface-container-highest transition-all border border-outline-variant/20">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary font-bold">E</div>
              <div className="flex-1 overflow-hidden">
                <p className="font-label-md text-label-md truncate">Enterprise Docs</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Workspace</p>
              </div>
              <span className="material-symbols-outlined text-sm">unfold_more</span>
            </div>
          </div>

          <div className="px-md mb-md">
            <button onClick={() => { setMessages([]); setCurrentLeafId(null); setCurrentSessionId(null); }} className="w-full flex items-center justify-center gap-sm bg-blue-600 text-white font-label-md text-label-md py-md rounded-2xl active:scale-95 transition-all hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <span className="material-symbols-outlined">add_comment</span>
              New Chat
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-xs space-y-sm relative z-10 custom-scrollbar">
            {chatSessions.length === 0 ? (
              <div className="px-md py-xs mt-4">
                <span className="text-[11px] font-bold text-outline uppercase tracking-wider text-center block opacity-50">Your chat history will appear here</span>
              </div>
            ) : (
              chatSessions.map(session => (
                <div key={session.id} onClick={() => loadChatSession(session.id)} className={`text-on-surface-variant hover:bg-white/5 rounded-2xl mx-2 p-sm flex items-center justify-between cursor-pointer transition-all group ${currentSessionId === session.id ? 'bg-white/10 text-white' : ''}`}>
                  <div className="flex items-center gap-sm overflow-hidden">
                    <span className="material-symbols-outlined text-md">chat</span>
                    <span className="font-label-md text-label-md truncate">{session.title}</span>
                  </div>
                  <button onClick={(e) => deleteChatSession(session.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 hover:bg-red-400/10 rounded transition-all">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))
            )}
          </nav>

          <div className="mt-auto px-md pt-md border-t border-white/10 relative z-10">
            <div onClick={handleLogout} className="flex items-center gap-sm p-sm rounded-lg hover:bg-surface-container-high transition-all cursor-pointer">
              <div className="w-9 h-9 rounded-full border border-primary/30 bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">person</span>
              </div>
              <div className="flex-1">
                <p className="font-label-md text-label-md text-on-surface">Logout</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">logout</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col relative bg-[#0B1120] min-w-0 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* 3D Animated Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0B1120]/80 to-[#0B1120] animate-[spin_90s_linear_infinite_reverse]"></div>
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent opacity-50"></div>
          </div>
          <header className="flex items-center justify-between px-lg py-md border-b border-white/10 glass-panel sticky top-0 z-30 bg-[#0F172A]/80 backdrop-blur-md">
            <div className="flex items-center gap-lg">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex items-center justify-center p-2 rounded-xl hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-white">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
              </button>
              <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-white hidden sm:block">
                Workspace
              </h2>
            </div>
            <div className="flex items-center gap-lg">
              <div className="flex flex-col">
                <span className="text-[10px] text-outline uppercase font-bold tracking-widest">KB Status</span>
                <div className="flex items-center gap-xs">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-[pulse_2s_ease-in-out_infinite]"></span>
                  <span className="font-label-md text-label-md text-on-surface">{documents.length} Sources Active</span>
                </div>
              </div>
            </div>
            <div className="flex gap-sm">
              <Link href="/dashboard" className="w-10 h-10 rounded-full overflow-hidden object-cover bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] border-2 border-white/20">
                {userEmail?.[0]?.toUpperCase() || "U"}
              </Link>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative">
            <ChatInterface 
              messages={messages}
              onSendMessage={handleSendMessage}
              generationState={generationState}
              onNewSession={() => { setMessages([]); setCurrentLeafId(null); }}
              documents={documents.map(d => ({ id: d.id, filename: d.file_name }))}
              activeDocumentIds={activeDocumentIds}
              onToggleDocument={(id) => setActiveDocumentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
              currentLeafId={currentLeafId}
              onNavigateBranch={(id) => setCurrentLeafId(id)}
              onToggleKbExplorer={() => {}}
              personaInstruction={personaInstruction}
              onPersonaChange={setPersonaInstruction}
              onSetScopedDocument={(id) => id ? setActiveDocumentIds([id]) : setActiveDocumentIds([])}
              onApproveAction={() => {}}
              onViewArtifact={() => {}}
              isDevMode={true}
            />
          </div>
        </main>

        {/* Mobile overlay for right settings panel */}
        {isSettingsOpen && (
          <div 
            className="xl:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" 
            onClick={() => setIsSettingsOpen(false)}
          />
        )}

        <aside className={`${isSettingsOpen ? 'flex fixed inset-y-2 right-2 rounded-3xl z-50 w-[calc(100%-16px)] sm:w-[320px] shadow-2xl' : 'hidden'} xl:flex w-[320px] bg-surface-container-low border border-outline-variant/20 flex-col py-lg px-md overflow-y-auto transform transition-transform duration-300`}>
          {isSettingsOpen && (
            <button onClick={() => setIsSettingsOpen(false)} className="xl:hidden absolute top-4 right-4 text-outline hover:text-on-surface">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}

          <div className="mt-8 xl:mt-0 mb-lg flex justify-center">
             <Link href="/upload-pro" className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 rounded-2xl text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all text-black">
               Upgrade to Pro
             </Link>
          </div>

          <div className="mt-auto pt-8">
            <p className="text-[11px] font-bold text-outline uppercase tracking-widest mb-md">Data Ingestion</p>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.txt,.csv,.md"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-lg flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <span className="material-symbols-outlined text-outline text-3xl mb-sm group-hover:text-primary transition-colors group-hover:scale-110 duration-200">cloud_upload</span>
              <p className="font-label-md text-label-md text-on-surface">Click to ingest files</p>
              <p className="text-[11px] text-outline mt-xs">PDF, CSV, JSON, Markdown</p>
            </div>

            {isUploading && (
              <div className="mt-lg">
                <div className="flex justify-between items-center mb-xs">
                  <span className="text-[10px] font-bold text-on-surface truncate">Uploading to Nexus...</span>
                  <span className="text-[10px] text-secondary font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            <div className="mt-8 space-y-2 max-h-48 overflow-y-auto">
              <p className="text-[11px] font-bold text-outline uppercase tracking-widest mb-sm">Active Documents</p>
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between bg-surface-container p-2 rounded border border-outline-variant/20">
                  <span className="text-xs truncate max-w-[180px]" title={doc.file_name}>{doc.file_name}</span>
                  <button 
                    onClick={() => executeDocumentDeletion(doc.id, doc.storage_path)}
                    className="text-error hover:text-error-container p-1 rounded hover:bg-error/10"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
              {documents.length === 0 && !isUploading && (
                <p className="text-xs text-outline italic">No documents indexed.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <nav className="md:hidden fixed bottom-0 w-full bg-surface-container-highest z-50 flex justify-around items-center h-16 border-t border-outline-variant/30 shadow-lg px-md">
        <div className="flex flex-col items-center justify-center text-secondary bg-secondary/10 rounded-xl px-4 py-1">
          <span className="material-symbols-outlined">chat</span>
          <span className="font-label-md text-label-md">Chat</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant">
          <span className="material-symbols-outlined">storage</span>
          <span className="font-label-md text-label-md">Data</span>
        </div>
      </nav>
    </div>
  );
}
