import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Message } from "@/lib/storage";
import { useWorkspace } from "@/contexts/WorkspaceContext";
export type GenerationState = "idle" | "synthesizing";

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
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [currentLeafId, setCurrentLeafId] = useState<string | null>(null);
  const [activeDocumentIds, setActiveDocumentIds] = useState<string[]>([]);
  const [personaInstruction, setPersonaInstruction] = useState<string>("");

  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [sessionPage, setSessionPage] = useState(0);
  const [hasMoreSessions, setHasMoreSessions] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash");
  
  const { activeWorkspace } = useWorkspace();

  useEffect(() => {
    if (activeWorkspace) {
      fetchDocuments();
      fetchChatSessions();
    }
  }, [activeWorkspace]);

  const fetchDocuments = async () => {
    if (!activeWorkspace) return;
    setIsLoadingDocuments(true);
    const { data } = await supabase.from('documents')
      .select('*')
      .eq('workspace_id', activeWorkspace.id)
      .order('created_at', { ascending: false });
    if (data) {
      setDocuments(data);
      setActiveDocumentIds(data.map((d: any) => d.id));
    }
    setIsLoadingDocuments(false);
  };

  const fetchChatSessions = async (page = 0, query = searchQuery, append = false) => {
    if (!activeWorkspace) return;
    setIsLoadingSessions(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoadingSessions(false);
      return;
    }
    setUserEmail(user.email || "U");

    const pageSize = 15;
    const start = page * pageSize;
    const end = start + pageSize - 1;

    let dbQuery = supabase.from('chat_sessions')
      .select('*')
      .eq('workspace_id', activeWorkspace.id)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (query) {
      dbQuery = dbQuery.ilike('title', `%${query}%`);
    }

    const { data } = await dbQuery;
    
    if (data) {
      if (append) {
        setChatSessions(prev => [...prev, ...data]);
      } else {
        setChatSessions(data);
      }
      setHasMoreSessions(data.length === pageSize);
      setSessionPage(page);
      setSearchQuery(query);
    } else {
      setHasMoreSessions(false);
    }
    setIsLoadingSessions(false);
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



  const saveUserMessage = async (msg: string): Promise<string> => {
    if (!msg.trim()) return "";
    
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      if (!activeWorkspace) throw new Error("No active workspace selected");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const sessionPayload = {
          user_id: user.id,
          workspace_id: activeWorkspace.id,
          title: msg.substring(0, 30) + '...'
        };
        const { data: session, error: sessionError } = await supabase.from('chat_sessions').insert(sessionPayload).select().single();
        if (sessionError) throw sessionError;
        if (session) {
          activeSessionId = session.id;
          setCurrentSessionId(activeSessionId);
          setChatSessions(prev => [session, ...prev]);
        }
      }
    }
    
    if (activeSessionId) {
      const msgPayload = { session_id: activeSessionId, role: 'user', content: msg };
      await supabase.from('chat_messages').insert(msgPayload);
    }

    return activeSessionId || "";
  };

  const saveAssistantMessage = async (sessionId: string, msg: string) => {
    if (!sessionId) return;
    const msgPayload = { session_id: sessionId, role: 'assistant', content: msg };
    await supabase.from('chat_messages').insert(msgPayload);
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentLeafId(null);
    setCurrentSessionId(null);
  };

  return {
    documents,
    isLoadingDocuments,
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
    setCurrentSessionId,
    userEmail,
    selectedModel,
    setSelectedModel,
    saveUserMessage,
    saveAssistantMessage,
    loadChatSession,
    deleteChatSession,
    fetchChatSessions,
    sessionPage,
    hasMoreSessions,
    isLoadingSessions,
    searchQuery,
    clearChat
  };
}
