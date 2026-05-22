"use client";

import { motion, LayoutGroup } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

interface LayoutProps {
  children: ReactNode;
  isGenerating?: boolean;
}

export const AntigravityLayout = ({ children, isGenerating = false }: LayoutProps) => {
  return (
    <LayoutGroup>
      <div className="flex h-[100dvh] w-full relative overflow-hidden bg-[#05050A]">
        {/* Dynamic mesh background */}
        <motion.div 
          animate={{
            opacity: isGenerating ? 0.8 : 0.3,
            scale: isGenerating ? 1.02 : 1,
            filter: isGenerating ? "brightness(1.4)" : "brightness(1)",
          }}
          transition={{ 
            duration: 2.5, 
            ease: "easeInOut", 
            repeat: isGenerating ? Infinity : 0, 
            repeatType: "mirror" 
          }}
          className="mesh-bg absolute inset-0 z-0 pointer-events-none"
        />
        
        {/* Main Interface */}
        <main className="relative z-10 flex-1 flex h-full w-full">
          {children}
        </main>
      </div>
    </LayoutGroup>
  );
};
