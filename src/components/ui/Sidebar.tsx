"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Edit2, Trash2, X, Menu } from "lucide-react";
import clsx from "clsx";
import { ChatSession } from "@/lib/storage";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
}

export const Sidebar = ({
  isOpen,
  setIsOpen,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession
}: SidebarProps) => {
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden absolute top-4 left-4 z-50 p-3 bg-[var(--color-glass)] border border-[var(--color-border)] rounded-xl backdrop-blur-xl text-white shadow-xl"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            layout
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={clsx(
              "fixed lg:relative z-50 lg:z-10 flex flex-col h-full w-[280px] bg-[#0A0A15]/90 backdrop-blur-3xl border-r border-white/10 shrink-0",
              !isOpen && "lg:hidden"
            )}
          >
            <div className="p-6 flex items-center justify-between">
              <h1 className="text-2xl font-light tracking-[0.2em] text-white">CURA</h1>
              <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={onCreateSession}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--color-accent)] hover:bg-blue-500 transition-colors text-white rounded-xl shadow-lg shadow-blue-500/20 font-medium"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-6">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={clsx(
                    "group relative flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border",
                    activeSessionId === session.id
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  )}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span className="truncate text-sm font-medium">{session.name}</span>
                  </div>
                  
                  <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt("Rename chat:", session.name);
                        if (newName?.trim()) onRenameSession(session.id, newName.trim());
                      }}
                      className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this chat?")) onDeleteSession(session.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
