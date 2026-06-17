import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Message } from "@/lib/storage";
import { GenerationState } from "@/components/chat/ChatInterface";

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
  const [vectorStore, setVectorStore] = useState<any>(null);
  const memoryStoreRef = useRef<any>(null);
  const indexedDocIdsRef = useRef<Set<string>>(new Set());
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
    let contextStr = "";
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    if (activeDocumentIds.length > 0) {
      if (!memoryStoreRef.current) {
         const { MemoryVectorStore } = await import("@/lib/memoryVectorStore");
         const { GoogleGenerativeAIEmbeddings } = await import("@langchain/google-genai");
         const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey, modelName: "text-embedding-004", taskType: "RETRIEVAL_QUERY" as any });
         memoryStoreRef.current = new MemoryVectorStore(embeddings);
      }

      const docsToIndex = documents.filter(d => activeDocumentIds.includes(d.id) && !indexedDocIdsRef.current.has(d.id));
      if (docsToIndex.length > 0) {
        const { RecursiveCharacterTextSplitter } = await import("@langchain/textsplitters");
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });

        for (const doc of docsToIndex) {
          try {
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
                  fullText += textContent.items.map((item: any) => item.str + (item.hasEOL ? '\n' : '')).join("") + "\n";
                }
              } else {
                fullText = await data.text();
              }
              if (fullText.trim()) {
                const chunks = await splitter.createDocuments([fullText], [{ source: doc.file_name, documentId: doc.id }]);
                await memoryStoreRef.current.addDocuments(chunks);
                indexedDocIdsRef.current.add(doc.id);
              }
            }
          } catch (e) {
             console.error(e);
          }
        }
      }
      
      try {
        const results = await memoryStoreRef.current.similaritySearch(msg, 15, (doc: any) => activeDocumentIds.includes(doc.metadata.documentId));
        contextStr = results.map((r: any, i: number) => `--- Chunk ${i+1} (Source: ${r.metadata.source}) ---\n${r.pageContent}`).join("\n\n");
      } catch (e) {
        console.error("Search error", e);
      }
    }

    let finalAssistantText = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: msg, contextStr, apiKey, personaInstruction, selectedModel }),
      });

      if (!response.ok || !response.body) {
        const errText = await response.text();
        throw new Error(errText || "Failed to fetch response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkText = decoder.decode(value, { stream: true });
          finalAssistantText += chunkText;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: finalAssistantText } : m));
        }
      }
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
