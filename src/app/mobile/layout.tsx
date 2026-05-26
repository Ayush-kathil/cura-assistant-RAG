import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nexus RAG Mobile',
  description: 'Enterprise-grade RAG platform for your private knowledge base',
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-0 sm:p-4" suppressHydrationWarning>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap"
        rel="stylesheet"
      />
      <div className="w-full max-w-sm h-[100dvh] sm:h-[844px] sm:rounded-[40px] sm:shadow-2xl sm:shadow-black/50 overflow-hidden bg-[#0e131e] relative">
        {children}
      </div>
    </div>
  );
}
