"use client";

import { useState, useRef, ReactNode, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface SplitWorkspaceProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export const SplitWorkspace = ({ leftPanel, rightPanel }: SplitWorkspaceProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const widthRatio = useMotionValue(0.5);

  const leftWidth = useTransform(widthRatio, (r) => `${r * 100}%`);
  const rightWidth = useTransform(widthRatio, (r) => `${(1 - r) * 100}%`);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = (e.clientX - rect.left) / rect.width;
      if (newRatio >= 0.3 && newRatio <= 0.7) {
        widthRatio.set(newRatio);
      }
    };

    const handlePointerUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, widthRatio]);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 h-1/2">{leftPanel}</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden relative selection:bg-blue-500/30 selection:text-white">
      <motion.div style={{ width: leftWidth }} className="h-full relative overflow-hidden flex flex-col pt-8 pb-8 pl-8 pr-4">
        <div className="flex-1 w-full h-full relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
          {leftPanel}
        </div>
      </motion.div>

      <div
        className="w-2 hover:w-3 hover:bg-blue-500/50 cursor-col-resize flex items-center justify-center transition-all z-50 h-full -mx-1"
        onPointerDown={handlePointerDown}
      >
        <div className="h-8 w-1 bg-white/20 rounded-full" />
      </div>

      <motion.div style={{ width: rightWidth }} className="h-full relative overflow-hidden flex flex-col pt-8 pb-8 pl-4 pr-8">
         <div className="flex-1 w-full h-full relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
          {rightPanel}
        </div>
      </motion.div>

      {isDragging && <div className="fixed inset-0 z-50 cursor-col-resize bg-transparent" />}
    </div>
  );
};
