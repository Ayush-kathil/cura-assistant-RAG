import { ChunkedDocument } from "./vectorStore";
import { Message } from "@/components/chat/ChatInterface";

export interface ChatDocument {
  id: string;
  filename: string;
}

export interface ChatSession {
  id: string;
  name: string;
  createdAt: number;
  documents: ChatDocument[];
  activeDocumentIds: string[];
  vectorStore: ChunkedDocument[];
  messages: Message[];
}

const STORAGE_KEY = "cura_sessions";

export const getSessions = (): ChatSession[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSessions = (sessions: ChatSession[]) => {
  if (typeof window === "undefined") return;
  const strippedSessions = sessions.map(session => ({
    ...session,
    vectorStore: []
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(strippedSessions));
};

export const createSession = (name: string = "New Chat"): ChatSession => {
  return {
    id: `session-${Date.now()}`,
    name,
    createdAt: Date.now(),
    documents: [],
    activeDocumentIds: [],
    vectorStore: [],
    messages: []
  };
};

export const deleteSession = (id: string, sessions: ChatSession[]): ChatSession[] => {
  return sessions.filter(s => s.id !== id);
};

export const renameSession = (id: string, newName: string, sessions: ChatSession[]): ChatSession[] => {
  return sessions.map(s => s.id === id ? { ...s, name: newName } : s);
};
