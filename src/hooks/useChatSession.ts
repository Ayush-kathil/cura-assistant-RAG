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
  const [messages, setMessages] = useState<Message[]>([]);
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [currentLeafId, setCurrentLeafId] = useState<string | null>(null);
  const [activeDocumentIds, setActiveDocumentIds] = useState<string[]>([]);
  const [personaInstruction, setPersonaInstruction] = useState<string>("");

  const [chatSessions, setChatSessions] = useState<any[]>([]);
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
    const { data } = await supabase.from('documents')
      .select('*')
      .eq('workspace_id', activeWorkspace.id)
      .order('created_at', { ascending: false });
    if (data) {
      setDocuments(data);
      setActiveDocumentIds(data.map((d: any) => d.id));
    }
  };

  const fetchChatSessions = async () => {
    if (!activeWorkspace) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserEmail(user.email || "U");
    const { data } = await supabase.from('chat_sessions')
      .select('*')
      .eq('workspace_id', activeWorkspace.id)
      .order('created_at', { ascending: false });
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



  const sendMessage = async (msg: string, parentId: string | null = null) => {
    if (!msg.trim()) return;
    
    // Default to the last message if parentId is not provided
    const actualParentId = parentId || (messages.length > 0 ? messages[messages.length - 1].id : null);

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: Message = { id: userMsgId, parentId: actualParentId, childrenIds: [], role: "user", content: msg };

    let newMsgsWithUser: Message[] = [];
    setMessages(prev => {
      const newMsgs = [...prev];
      const parent = newMsgs.find(p => p.id === actualParentId);
      if (parent) parent.childrenIds.push(userMsgId);
      newMsgsWithUser = [...newMsgs, userMsg];
      return newMsgsWithUser;
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

    return activeSessionId;
  };

  const saveAssistantMessage = async (sessionId: string, msg: string) => {
    if (!sessionId) return;
    const msgPayload = { session_id: sessionId, role: 'assistant', content: msg };
    await supabase.from('chat_messages').insert(msgPayload);
  };

  const sendMessage = async (msg: string, parentId: string | null = null) => {
    if (!msg.trim()) return;
    
    // Default to the last message if parentId is not provided
    const actualParentId = parentId || (messages.length > 0 ? messages[messages.length - 1].id : null);

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: Message = { id: userMsgId, parentId: actualParentId, childrenIds: [], role: "user", content: msg };

    let newMsgsWithUser: Message[] = [];
    setMessages(prev => {
      const newMsgs = [...prev];
      const parent = newMsgs.find(p => p.id === actualParentId);
      if (parent) parent.childrenIds.push(userMsgId);
      newMsgsWithUser = [...newMsgs, userMsg];
      return newMsgsWithUser;
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

    const activeSessionId = await saveUserMessage(msg);

    setGenerationState("synthesizing");

    let finalAssistantText = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: msg, 
          messages: newMsgsWithUser,
          activeDocumentIds, 
          personaInstruction, 
          selectedModel,
          workspaceId: activeWorkspace?.id
        }),
      });

      if (!response.ok || !response.body) {
        const errText = await response.text();
        throw new Error(errText || "Failed to fetch response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let isFirstMetadataPacket = true;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          let chunkText = decoder.decode(value, { stream: true });
          
          if (isFirstMetadataPacket && chunkText.includes('---METADATA-END---')) {
             isFirstMetadataPacket = false;
             const split = chunkText.split('---METADATA-END---\\n\\n');
             try {
                const meta = JSON.parse(split[0]);
                if (meta.type === 'citations') {
                   setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, sources: meta.chunks } : m));
                }
             } catch (e) {
                console.error("Failed to parse citations metadata", e);
             }
             chunkText = split[1] || "";
          }
          
          finalAssistantText += chunkText;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: finalAssistantText } : m));
        }
      }


    } catch (err: any) {
      finalAssistantText += `\n\n**Error:** ${err.message}`;
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: m.content + `\n\n**Error:** ${err.message}` } : m));
    } finally {
      if (activeSessionId) {
        const msgPayload = { session_id: activeSessionId, role: 'assistant', content: finalAssistantText };
        console.log("[DB Write] table: chat_messages (assistant), payload:", msgPayload);
        const { error: msgError } = await supabase.from('chat_messages').insert(msgPayload);
        if (msgError) {
          console.error("[DB Error] table: chat_messages (assistant), error:", msgError);
          // don't throw in finally block as it masks original errors, but log loudly
        }
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
    sendMessage,
    saveUserMessage,
    saveAssistantMessage,
    loadChatSession,
    deleteChatSession,
    clearChat
  };
}
