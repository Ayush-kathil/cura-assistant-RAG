import { motion, AnimatePresence } from "framer-motion";
// ScoredChunk removed
import { X, Network, FileText, FilterX, PlusCircle } from "lucide-react";
import clsx from "clsx";

interface KbExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  lastSources: any[];
  excludedChunkIds: string[];
  onToggleExclude: (chunkId: string) => void;
}

export const KbExplorer = ({ isOpen, onClose, lastSources, excludedChunkIds, onToggleExclude }: KbExplorerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[360px] bg-[#0A0A15]/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col lg:relative lg:inset-auto lg:z-auto lg:h-full lg:w-[320px] lg:translate-x-0"
          >
            <div className="flex-none p-4 pt-safe lg:pt-4 border-b border-white/10 flex items-center justify-between bg-black/20">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-[var(--color-accent)]" />
                Knowledge Base Explorer
              </h3>
              <button 
                onClick={onClose} 
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Context Mapping</p>
              
              {lastSources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-400">No context injected in the last response.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lastSources.map((source) => {
                    const isExcluded = excludedChunkIds.includes(source.chunk.id);
                    
                    return (
                      <div key={source.chunk.id} className={clsx("p-3 rounded-xl border transition-colors duration-300", isExcluded ? "bg-red-900/10 border-red-500/20" : "bg-white/5 border-white/10")}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className={clsx("w-3.5 h-3.5 shrink-0", isExcluded ? "text-red-400" : "text-blue-300")} />
                            <span className="text-xs font-semibold text-white truncate">
                              {source.chunk.filename}
                            </span>
                          </div>
                          <span className={clsx("text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0", isExcluded ? "bg-red-500/20 text-red-300" : "bg-blue-500/20 text-blue-300")}>
                            Score: {source.score.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="text-[11px] text-gray-400 line-clamp-3 bg-black/20 p-2 rounded-lg border border-white/5 mb-3 font-mono leading-relaxed">
                          {source.childMatchText}
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            onClick={() => onToggleExclude(source.chunk.id)}
                            className={clsx(
                              "text-xs flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg transition-colors font-medium",
                              isExcluded 
                                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400" 
                                : "bg-white/5 hover:bg-white/10 text-gray-300"
                            )}
                          >
                            {isExcluded ? (
                               <>Restore Context <PlusCircle className="w-3.5 h-3.5"/></>
                            ) : (
                               <>Force Exclude <FilterX className="w-3.5 h-3.5"/></>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
