"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AntigravityLayout } from "@/components/ui/Layout";
import { ApiKeyModal } from "@/components/ui/ApiKeyModal";
import { DocumentUploader } from "@/components/ui/DocumentUploader";
import { ChatInterface, Message, GenerationState } from "@/components/chat/ChatInterface";
import { Sidebar } from "@/components/ui/Sidebar";
import { chunkText, ChunkedDocument, searchVectorStore } from "@/lib/vectorStore";
import { generateEmbeddingsBatch, generateStreamingResponse, generateEmbedding, reformulateQuery } from "@/lib/gemini";
import { ChatSession, getSessions, saveSessions, createSession, deleteSession, renameSession } from "@/lib/storage";

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [generationState, setGenerationState] = useState<GenerationState>("idle");

  useEffect(() => {
    const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const storedKey = sessionStorage.getItem("gemini_api_key");
    
    if (envKey && envKey !== "your_api_key_here") {
      setApiKey(envKey);
    } else if (storedKey) {
      setApiKey(storedKey);
    }

    const loadedSessions = getSessions();
    if (loadedSessions.length > 0) {
      setSessions(loadedSessions);
      setActiveSessionId(loadedSessions[0].id);
    } else {
      const initSession = createSession();
      setSessions([initSession]);
      setActiveSessionId(initSession.id);
      saveSessions([initSession]);
    }

    setIsReady(true);
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  useEffect(() => {
    if (activeSession && activeSession.documents && activeSession.documents.length > 0 && activeSession.vectorStore.length === 0) {
      updateActiveSession({ documents: [], activeDocumentIds: [], messages: [] });
    }
  }, [activeSessionId]);

  const handleSaveApiKey = (key: string) => {
    sessionStorage.setItem("gemini_api_key", key);
    setApiKey(key);
  };

  const updateActiveSession = (updates: Partial<ChatSession>) => {
    setSessions(prev => {
      const updated = prev.map(s => s.id === activeSessionId ? { ...s, ...updates } : s);
      saveSessions(updated);
      return updated;
    });
  };

  const handleCreateSession = () => {
    const newSession = createSession(`Chat ${sessions.length + 1}`);
    const updated = [newSession, ...sessions];
    setSessions(updated);
    setActiveSessionId(newSession.id);
    saveSessions(updated);
  };

  const handleDeleteSession = (id: string) => {
    const updated = deleteSession(id, sessions);
    if (updated.length === 0) {
      const newSession = createSession();
      updated.push(newSession);
    }
    setSessions(updated);
    if (activeSessionId === id) setActiveSessionId(updated[0].id);
    saveSessions(updated);
  };

  const handleRenameSession = (id: string, newName: string) => {
    const updated = renameSession(id, newName, sessions);
    setSessions(updated);
    saveSessions(updated);
  };

  const handleHardReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    setApiKey(null);
    const initSession = createSession();
    setSessions([initSession]);
    setActiveSessionId(initSession.id);
  };

  const handleToggleDocument = (documentId: string) => {
    if (!activeSession) return;
    const currentIds = activeSession.activeDocumentIds || [];
    const newIds = currentIds.includes(documentId) 
      ? currentIds.filter(id => id !== documentId) 
      : [...currentIds, documentId];
    updateActiveSession({ activeDocumentIds: newIds });
  };

  const handleDocumentsProcessed = async (docsToProcess: { text: string; filename: string }[]) => {
    if (!apiKey || !activeSession) return;
    setIsProcessing(true);
    
    try {
      const newDocuments = [];
      const newVectorStore = [...activeSession.vectorStore];
      const newActiveDocumentIds = [...activeSession.activeDocumentIds];

      for (const doc of docsToProcess) {
        const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        newDocuments.push({ id: docId, filename: doc.filename });
        newActiveDocumentIds.push(docId);

        const chunks = chunkText(doc.text);
        const allEmbeddings = await generateEmbeddingsBatch(chunks, apiKey);
        
        for (let i = 0; i < chunks.length; i++) {
          newVectorStore.push({
            id: `chunk-${docId}-${i}`,
            documentId: docId,
            filename: doc.filename,
            text: chunks[i],
            embedding: allEmbeddings[i],
            chunkIndex: i + 1
          });
        }
      }
      
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `I've successfully processed ${newDocuments.length} document${newDocuments.length > 1 ? 's' : ''}. How can I assist you with this knowledge base?`,
        isWelcome: true
      };

      updateActiveSession({ 
        vectorStore: newVectorStore, 
        documents: [...activeSession.documents, ...newDocuments],
        activeDocumentIds: newActiveDocumentIds,
        name: newDocuments[0].filename.slice(0, 20),
        messages: activeSession.messages.length === 0 ? [welcomeMessage] : [...activeSession.messages, welcomeMessage]
      });
    } catch (error: any) {
      console.error("Failed to generate embeddings:", error);
      alert(`Failed to process documents. Error: ${error?.message || error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeRagPipeline = async (query: string) => {
    if (!apiKey || !activeSession || activeSession.vectorStore.length === 0) return;
    
    const userMessage: Message = { id: `user-${Date.now()}`, role: "user", content: query };
    const assistantId = `assistant-${Date.now()}`;
    const assistantMessagePlaceholder: Message = { id: assistantId, role: "assistant", content: "" };
    
    const currentMessages = [...activeSession.messages, userMessage, assistantMessagePlaceholder];
    updateActiveSession({ messages: currentMessages });
    
    try {
      setGenerationState("reformulating");
      const reformulatedQuery = await reformulateQuery(query, activeSession.messages, apiKey);
      
      setGenerationState("scanning");
      const queryEmbedding = await generateEmbedding(reformulatedQuery, apiKey);
      const topScoredChunks = searchVectorStore(queryEmbedding, activeSession.vectorStore, activeSession.activeDocumentIds, 3);
      
      setGenerationState("synthesizing");
      
      if (topScoredChunks.length === 0 || topScoredChunks[0].score < 0.45) {
        const fallbackMsg = "I could not find a highly relevant answer to this question in the active documents. Please ensure the relevant documents are toggled on in the Knowledge Base.";
        updateActiveSession({ 
          messages: [...activeSession.messages, userMessage, { id: assistantId, role: "assistant", content: fallbackMsg }]
        });
        return;
      }

      setSessions(prev => prev.map(s => {
        if (s.id !== activeSessionId) return s;
        const newMsgs = [...s.messages];
        const lastIdx = newMsgs.findIndex(m => m.id === assistantId);
        if (lastIdx > -1) newMsgs[lastIdx] = { ...newMsgs[lastIdx], sources: topScoredChunks };
        return { ...s, messages: newMsgs };
      }));
      
      let fullResponse = "";
      await generateStreamingResponse(reformulatedQuery, topScoredChunks, "Multiple Documents", apiKey, (chunkText) => {
        fullResponse += chunkText;
        setSessions(prev => prev.map(s => {
          if (s.id !== activeSessionId) return s;
          const newMsgs = [...s.messages];
          const lastIdx = newMsgs.findIndex(m => m.id === assistantId);
          if (lastIdx > -1) newMsgs[lastIdx] = { ...newMsgs[lastIdx], content: fullResponse };
          return { ...s, messages: newMsgs };
        }));
      });

      setSessions(prev => {
        const updated = prev.map(s => {
          if (s.id !== activeSessionId) return s;
          const newMsgs = [...s.messages];
          const lastIdx = newMsgs.findIndex(m => m.id === assistantId);
          if (lastIdx > -1) newMsgs[lastIdx] = { ...newMsgs[lastIdx], content: fullResponse };
          return { ...s, messages: newMsgs };
        });
        saveSessions(updated);
        return updated;
      });
      
    } catch (error: any) {
      console.error("Generation failed:", error);
      updateActiveSession({ 
        messages: [...activeSession.messages, userMessage, { id: assistantId, role: "assistant", content: `⚠️ Error: ${error?.message || error}` }]
      });
    } finally {
      setGenerationState("idle");
    }
  };

  const handleSendMessage = (query: string) => {
    executeRagPipeline(query);
  };

  const handleActionRequest = (action: "summarize" | "explain" | "rewrite", text: string) => {
    const promptMap = {
      summarize: `Please summarize the following text:\n\n"${text}"`,
      explain: `Please explain the following text in detail:\n\n"${text}"`,
      rewrite: `Please rewrite the following text to improve clarity and flow:\n\n"${text}"`
    };
    executeRagPipeline(promptMap[action]);
  };

  if (!isReady) return <div className="min-h-screen bg-[#05050A]" />;

  return (
    <>
      <AnimatePresence>
        {!apiKey && <ApiKeyModal onSave={handleSaveApiKey} />}
      </AnimatePresence>

      <AntigravityLayout isGenerating={generationState !== "idle"}>
        <Sidebar 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
        />
        
        <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full lg:p-8">
          <AnimatePresence mode="popLayout">
            {activeSession && activeSession.vectorStore.length === 0 ? (
              <motion.div 
                key="upload-view"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full flex justify-center items-center h-full"
              >
                <DocumentUploader 
                  onDocumentsProcessed={handleDocumentsProcessed} 
                  isProcessing={isProcessing} 
                />
              </motion.div>
            ) : activeSession ? (
              <motion.div
                key="chat-view"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl mx-auto h-full flex flex-col"
              >
                <ChatInterface 
                  messages={activeSession.messages}
                  onSendMessage={handleSendMessage}
                  generationState={generationState}
                  onActionRequest={handleActionRequest}
                  onNewSession={handleHardReset}
                  documents={activeSession.documents || []}
                  activeDocumentIds={activeSession.activeDocumentIds || []}
                  onToggleDocument={handleToggleDocument}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </AntigravityLayout>
    </>
  );
}
