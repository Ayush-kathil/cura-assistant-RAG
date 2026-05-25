import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, MessageSquare, Trash2, Edit2, X, Download, ShieldAlert, ShieldCheck, Folder } from "lucide-react";
import clsx from "clsx";
import { ChatSession } from "@/lib/storage";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  isTracePrivacyEnabled: boolean;
  onTogglePrivacyMode: () => void;
}

export const Sidebar = ({
  isOpen,
  setIsOpen,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  isTracePrivacyEnabled,
  onTogglePrivacyMode
}: SidebarProps) => {

  const handleExport = (format: "json" | "csv") => {
    if (!activeSessionId) return;
    const session = sessions.find(s => s.id === activeSessionId);
    if (!session) return;
    
    if (format === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session.messages, null, 2));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `session-${session.id}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } else {
      const csvHeader = "Role,Content,Sources\n";
      const csvRows = session.messages.map(m => `"${m.role}","${m.content.replace(/"/g, '""')}","${m.sources ? m.sources.length : 0} sources"`);
      const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvHeader + csvRows.join("\n"));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `session-${session.id}.csv`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  };

  const today = new Date().setHours(0, 0, 0, 0);
  
  const todaySessions = sessions.filter(s => s.createdAt >= today);
  const olderSessions = sessions.filter(s => s.createdAt < today);

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.div
        initial={false}
        animate={{ width: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}
        className={clsx(
          "fixed lg:relative z-50 h-[100dvh] lg:h-full flex flex-col bg-[#0A0A15]/95 backdrop-blur-3xl border-r border-[var(--color-border)] shadow-2xl lg:shadow-none overflow-hidden shrink-0",
          !isOpen && "pointer-events-none lg:pointer-events-auto border-none lg:w-0"
        )}
      >
        <div className="flex-none p-6 pt-safe lg:pt-6 border-b border-[var(--color-border)] bg-black/20 relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-xs">C</span>
              CURA
            </h2>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-white/10 rounded-full text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={onCreateSession}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-[var(--color-accent)] hover:bg-blue-400 text-white font-medium py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            New Workspace
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {todaySessions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 flex items-center gap-2">
                <Folder className="w-3.5 h-3.5" /> Today
              </h3>
              {todaySessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={activeSessionId === session.id}
                  onSelect={() => onSelectSession(session.id)}
                  onDelete={() => onDeleteSession(session.id)}
                  onRename={(newName) => onRenameSession(session.id, newName)}
                />
              ))}
            </div>
          )}

          {olderSessions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 flex items-center gap-2">
                <Folder className="w-3.5 h-3.5" /> Archive
              </h3>
              {olderSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={activeSessionId === session.id}
                  onSelect={() => onSelectSession(session.id)}
                  onDelete={() => onDeleteSession(session.id)}
                  onRename={(newName) => onRenameSession(session.id, newName)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-none p-4 border-t border-[var(--color-border)] bg-black/20 space-y-3">
           <button 
             onClick={onTogglePrivacyMode}
             className={clsx(
               "w-full min-h-[44px] flex items-center justify-between px-4 py-3 rounded-xl transition-colors border",
               isTracePrivacyEnabled ? "bg-red-900/20 border-red-500/30 text-red-400" : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
             )}
           >
             <div className="flex items-center gap-2 text-sm font-medium">
               {isTracePrivacyEnabled ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
               Zero-Trace Mode
             </div>
             <div className={clsx("w-8 h-4 rounded-full relative transition-colors", isTracePrivacyEnabled ? "bg-red-500" : "bg-gray-600")}>
                <motion.div layout className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow-sm" animate={{ x: isTracePrivacyEnabled ? 18 : 2 }} />
             </div>
           </button>
           
           <div className="flex gap-2">
             <button onClick={() => handleExport("json")} className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-gray-300 transition-colors">
               <Download className="w-3.5 h-3.5" /> JSON
             </button>
             <button onClick={() => handleExport("csv")} className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-gray-300 transition-colors">
               <Download className="w-3.5 h-3.5" /> CSV
             </button>
           </div>
        </div>
      </motion.div>
    </>
  );
};

const SessionItem = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename
}: {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(session.name);
  
  return (
    <div
      onClick={() => { if (!editing) onSelect(); }}
      className={clsx(
        "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all min-h-[44px]",
        isActive ? "bg-white/10 border border-white/10 text-white shadow-inner" : "hover:bg-white/5 text-gray-400 hover:text-gray-200"
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <MessageSquare className={clsx("w-4 h-4 shrink-0", isActive && "text-[var(--color-accent)]")} />
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              setEditing(false);
              if (name.trim() && name !== session.name) onRename(name.trim());
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditing(false);
                if (name.trim() && name !== session.name) onRename(name.trim());
              }
            }}
            className="bg-black/50 border border-[var(--color-accent)] rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        ) : (
          <span className="text-sm font-medium truncate tracking-wide">{session.name}</span>
        )}
      </div>

      {!editing && (
        <div className={clsx("flex items-center gap-1 opacity-0 transition-opacity", isActive ? "opacity-100" : "group-hover:opacity-100")}>
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 hover:bg-red-500/20 rounded-md text-gray-400 hover:text-red-400 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
