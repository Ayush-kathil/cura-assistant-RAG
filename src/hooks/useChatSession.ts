import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Message } from "@/lib/storage";
import { GenerationState } from "@/components/chat/ChatInterface";
import { generateStreamingResponse, generateEmbedding, generateEmbeddingsBatch } from "@/lib/gemini";
import { VectorStoreData, chunkText, hybridSearchVectorStore } from "@/lib/vectorStore";

export interface DocumentItem {
  id: string;
  file_name: string;
  file_size_bytes: number;
  storage_path: string;
  vector_status: string;
  chunks?: string[];
}

export function useChatSession() {
  const supabase = createClient();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [currentLeafId, setCurrentLeafId] = useState<string | null>(null);
  const [activeDocumentIds, setActiveDocumentIds] = useState<string[]>([]);
  const [personaInstruction, setPersonaInstruction] = useState<string>("");
  const [vectorStore, setVectorStore] = useState<VectorStoreData>({ parents: [], children: [] });
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash");

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
    const { data: dbMessages } = await supabase.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
    if (dbMessages) {
      const uiMessages: Message[] = dbMessages.map((m: any) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        parentId: null,
        childrenIds: []
      }));
      setMessages(uiMessages);
      setCurrentSessionId(sessionId);
      if (uiMessages.length > 0) {
        setCurrentLeafId(uiMessages[uiMessages.length - 1].id);
      } else {
        setCurrentLeafId(null);
      }
    }
  };

  const deleteChatSession = async (sessionId: string) => {
    await supabase.from('chat_sessions').delete().eq('id', sessionId);
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setMessages([]);
      setCurrentSessionId(null);
      setCurrentLeafId(null);
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
    if (data) setDocuments(data);
  };

  const sendMessage = async (msg: string, parentId: string | null = null) => {
    if (!msg.trim()) return;
    
    // Default to the last message if parentId is not provided
    const actualParentId = parentId || (messages.length > 0 ? messages[messages.length - 1].id : null);

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: Message = { id: userMsgId, parentId: actualParentId, childrenIds: [], role: "user", content: msg };

    setMessages(prev => {
      const newMsgs = [...prev];
      const parent = newMsgs.find(p => p.id === actualParentId);
      if (parent) parent.childrenIds.push(userMsgId);
      return [...newMsgs, userMsg];
    });
    setCurrentLeafId(userMsgId);

    const botMsgId = `bot-${Date.now()}`;
    const botMsg: Message = { id: botMsgId, parentId: userMsgId, childrenIds: [], role: "assistant", content: "" };

    setMessages(prev => {
      const newMsgs = [...prev];
      const parent = newMsgs.find(p => p.id === userMsgId);
      if (parent) parent.childrenIds.push(botMsgId);
      return [...newMsgs, botMsg];
    });
    setCurrentLeafId(botMsgId);

    const { data: { user } } = await supabase.auth.getUser();
    let activeSessionId = currentSessionId;
    if (user) {
      if (!activeSessionId) {
        const { data: session } = await supabase.from('chat_sessions').insert({ user_id: user.id, title: msg.substring(0, 30) }).select().single();
        if (session) {
          activeSessionId = session.id;
          setCurrentSessionId(activeSessionId);
          setChatSessions(prev => [session, ...prev]);
        }
      }
      if (activeSessionId) {
        await supabase.from('chat_messages').insert({ session_id: activeSessionId, role: 'user', content: msg });
      }
    }

    setGenerationState("synthesizing");
    let contextChunks: any[] = [];
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    if (activeDocumentIds.length > 0) {
      const docsToIndex = documents.filter(d => activeDocumentIds.includes(d.id) && !vectorStore.parents.some(p => p.documentId === d.id));
      if (docsToIndex.length > 0) {
        let newParents = [...vectorStore.parents];
        let newChildren = [...vectorStore.children];
        for (const doc of docsToIndex) {
          try {
            let extractedChunks = doc.chunks && doc.chunks.length > 0 ? doc.chunks : null;
            if (!extractedChunks) {
              const { data, error } = await supabase.storage.from('nexus_docs').download(doc.storage_path);
              if (!error && data) {
                let fullText = "";
                if (doc.file_name.toLowerCase().endsWith('.pdf')) {
                  const arrayBuffer = await data.arrayBuffer();
                  const pdfjsLib = await import("pdfjs-dist");
                  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
                  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                  for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
                  }
                } else {
                  fullText = await data.text();
                }
                if (fullText.trim()) extractedChunks = chunkText(fullText);
              }
            }
            if (extractedChunks) {
              const parentChunks = extractedChunks.map((text: string, i: number) => ({ id: crypto.randomUUID(), documentId: doc.id, filename: doc.file_name, text, chunkIndex: i }));
              const embeddings = await generateEmbeddingsBatch(extractedChunks, apiKey);
              const childChunks = extractedChunks.map((text: string, i: number) => ({ id: crypto.randomUUID(), parentId: parentChunks[i].id, documentId: doc.id, filename: doc.file_name, text, embedding: embeddings[i], chunkIndex: i }));
              newParents = [...newParents, ...parentChunks];
              newChildren = [...newChildren, ...childChunks];
            }
          } catch (e) {
             console.error(e);
          }
        }
        const newStore = { parents: newParents, children: newChildren };
        setVectorStore(newStore);
        try {
          const queryEmbedding = await generateEmbedding(msg, apiKey);
          contextChunks = hybridSearchVectorStore(msg, queryEmbedding, newStore, activeDocumentIds, 3);
        } catch (e) {}
      } else {
        try {
          const queryEmbedding = await generateEmbedding(msg, apiKey);
          contextChunks = hybridSearchVectorStore(msg, queryEmbedding, vectorStore, activeDocumentIds, 3);
        } catch (e) {}
      }
    }

    let finalAssistantText = "";
    try {
      await generateStreamingResponse(
        msg, contextChunks, "no-doc", apiKey, 
        (text) => {
          finalAssistantText += text;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: m.content + text } : m));
        },
        personaInstruction, selectedModel
      );
    } catch (err: any) {
      finalAssistantText += `\n\n**Error:** ${err.message}`;
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: m.content + `\n\n**Error:** ${err.message}` } : m));
    } finally {
      if (user && activeSessionId) {
        await supabase.from('chat_messages').insert({ session_id: activeSessionId, role: 'assistant', content: finalAssistantText });
      }
      setGenerationState("idle");
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentLeafId(null);
    setCurrentSessionId(null);
  };

  return {
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
  };
}
