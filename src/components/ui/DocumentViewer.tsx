"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { FileText } from "lucide-react";
import { ChunkedDocument } from "@/lib/vectorStore";
import { useEffect, useRef } from "react";

interface DocumentViewerProps {
  documentName: string;
  chunks: ChunkedDocument[];
  activeChunkIndex: number | null;
}

export const DocumentViewer = ({ documentName, chunks, activeChunkIndex }: DocumentViewerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const chunkRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (activeChunkIndex !== null && chunkRefs.current[activeChunkIndex]) {
      chunkRefs.current[activeChunkIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeChunkIndex]);

  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-glass)] backdrop-blur-xl border-l border-[var(--color-border)] shadow-2xl">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--color-border)] bg-black/20">
        <div className="p-2 bg-white/10 rounded-lg text-gray-300">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white tracking-wide truncate max-w-[300px]">
            {documentName}
          </h3>
          <p className="text-xs text-gray-400">Source Document Viewer</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {chunks.map((chunk) => {
          const isActive = activeChunkIndex === chunk.chunkIndex;
          return (
            <motion.div
              key={chunk.id}
              ref={(el) => { chunkRefs.current[chunk.chunkIndex] = el; }}
              animate={{
                backgroundColor: isActive ? "rgba(59, 130, 246, 0.15)" : "rgba(0, 0, 0, 0)",
                borderColor: isActive ? "rgba(59, 130, 246, 0.4)" : "transparent",
              }}
              transition={{ duration: 0.3 }}
              className={clsx(
                "p-4 rounded-xl border transition-colors cursor-text relative group",
                isActive ? "shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "hover:bg-white/5"
              )}
            >
              <div className="absolute -left-2 top-4 w-1 h-8 rounded-r-md bg-blue-500 opacity-0 transition-opacity" style={{ opacity: isActive ? 1 : 0 }} />
              <div className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-widest font-semibold flex items-center gap-2">
                <span>Chunk {chunk.chunkIndex}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                {chunk.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
