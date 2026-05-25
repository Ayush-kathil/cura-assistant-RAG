import { VectorStoreData, ScoredChunk } from "./vectorStore";

export interface Message {
  id: string;
  parentId: string | null;
  childrenIds: string[];
  role: "user" | "assistant";
  content: string;
  sources?: ScoredChunk[];
  isWelcome?: boolean;
  orchestrationPath?: string[];
  telemetry?: { vectorSearchMs?: number; rerankerMs?: number; ttftMs?: number; };
  requiresApproval?: boolean;
  isApproved?: boolean;
}

export interface ChatDocument {
  id: string;
  filename: string;
  sizeBytes?: number;
}

export interface ChatSession {
  id: string;
  name: string;
  createdAt: number;
  documents: ChatDocument[];
  activeDocumentIds: string[];
  vectorStore: VectorStoreData;
  messages: Message[];
  currentLeafId: string | null;
  devModeEnabled?: boolean;
}

const STORAGE_KEY = "cura_sessions";

export const getSessions = (): ChatSession[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSessions = (sessions: ChatSession[], isTracePrivacyEnabled: boolean = false) => {
  if (typeof window === "undefined" || isTracePrivacyEnabled) return;
  const strippedSessions = sessions.map(session => ({
    ...session,
    vectorStore: { parents: [], children: [] }
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
    vectorStore: { parents: [], children: [] },
    messages: [],
    currentLeafId: null,
    devModeEnabled: false
  };
};

export const deleteSession = (id: string, sessions: ChatSession[]): ChatSession[] => {
  return sessions.filter(s => s.id !== id);
};

export const renameSession = (id: string, newName: string, sessions: ChatSession[]): ChatSession[] => {
  return sessions.map(s => s.id === id ? { ...s, name: newName } : s);
};
