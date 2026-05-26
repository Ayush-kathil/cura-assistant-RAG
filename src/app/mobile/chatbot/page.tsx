"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function MobileChatbot() {
  const [isDark, setIsDark] = useState(true);
  const [showCitations, setShowCitations] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className={`${isDark ? 'dark' : ''} h-full overflow-hidden relative`}>
      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #464554; border-radius: 10px; }
        .glass-panel {
            background: rgba(14, 19, 30, 0.8);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        .chat-container { height: calc(100% - 144px); }
      `}</style>

      <div className="bg-background text-on-surface font-body-md selection:bg-primary/30 h-full flex flex-col transition-colors duration-200">
        {/* TopAppBar */}
        <header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md text-primary dark:text-primary-fixed-dim docked full-width top-0 sticky z-50 border-b border-outline-variant/30 flat no-shadows px-lg py-md flex justify-between items-center w-full max-w-container-max mx-auto shrink-0">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined font-headline-md text-headline-md font-bold tracking-tight text-on-surface dark:text-on-surface" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>hub</span>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface dark:text-on-surface leading-tight">Nexus RAG</span>
              <span className="font-label-md text-label-md text-secondary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                Connected to 14 Sources
              </span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button onClick={() => setIsDark(!isDark)} className="hover:text-secondary transition-colors duration-200 scale-95 active:scale-90 transition-transform">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button className="hover:text-secondary transition-colors duration-200 scale-95 active:scale-90 transition-transform">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>more_vert</span>
            </button>
          </div>
        </header>

        {/* Chat Canvas */}
        <main className="chat-container overflow-y-auto px-md py-lg space-y-lg pb-32">
          {/* AI Response with Citations */}
          <div className="flex flex-col items-start gap-xs max-w-[85%]">
            <div className="bg-surface-container border-l-2 border-secondary p-md rounded-xl rounded-tl-none shadow-sm">
              <p className="font-body-md text-on-surface">
                Based on the current knowledge base, the Enterprise Workspace is optimized for v2.4.0. The RAG pipeline is currently processing 14 disparate data sources including your internal Wiki and API documentation.
                <button onClick={() => setShowCitations(true)} className="inline-flex items-center bg-secondary/10 border border-secondary/20 rounded-full px-2 py-0.5 ml-1 transition-all hover:bg-secondary/20 active:scale-95">
                  <span className="font-mono-code text-[10px] text-secondary font-bold">CITATIONS [3]</span>
                </button>
              </p>
              <div className="mt-sm flex gap-xs flex-wrap">
                <span className="bg-surface-container-highest border border-outline-variant/30 px-sm py-xs rounded text-[10px] font-mono-code text-outline uppercase">latency: 240ms</span>
                <span className="bg-surface-container-highest border border-outline-variant/30 px-sm py-xs rounded text-[10px] font-mono-code text-outline uppercase">tokens: 142</span>
              </div>
            </div>
            <span className="text-outline text-body-sm px-xs italic">Nexus Assistant • 10:12 AM</span>
          </div>

          {/* User Message */}
          <div className="flex flex-col items-end gap-xs ml-auto max-w-[85%]">
            <div className="bg-background border border-primary/40 p-md rounded-xl rounded-tr-none">
              <p className="font-body-md text-on-surface">
                Can you summarize the performance impact of the new vector indexing update mentioned in the documentation?
              </p>
            </div>
            <span className="text-outline text-body-sm px-xs italic">You • 10:14 AM</span>
          </div>

          {/* AI Streaming Response */}
          <div className="flex flex-col items-start gap-xs max-w-[85%]">
            <div className="bg-surface-container border-l-2 border-secondary p-md rounded-xl rounded-tl-none shadow-sm min-w-[200px]">
              <div className="flex gap-1 items-center py-2">
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></div>
              </div>
              <p className="font-body-md text-on-surface-variant italic">Retrieving context from documentation...</p>
              {/* Citation Badge appearing during stream */}
              <div className="mt-md h-1 bg-surface-container-highest w-full rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-2/3 shadow-[0_0_8px_rgba(76,215,246,0.5)] animate-pulse"></div>
              </div>
            </div>
          </div>
        </main>

        {/* Floating Input Bar */}
        <div className="absolute bottom-16 left-0 w-full p-md glass-panel border-t border-outline-variant/20 z-40">
          <div className="max-w-container-max mx-auto flex flex-col gap-sm">
            {/* Quick Options / Model Selector */}
            <div className="flex items-center gap-sm overflow-x-auto no-scrollbar py-1">
              <button className="flex items-center gap-1 bg-surface-container-high border border-outline-variant/30 px-sm py-1 rounded-full whitespace-nowrap text-on-surface-variant hover:text-primary transition-all active:scale-95">
                <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>psychology</span>
                <span className="font-label-md text-label-md">Nexus-v4 (Pro)</span>
                <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>expand_more</span>
              </button>
              <button className="flex items-center gap-1 bg-surface-container-high border border-outline-variant/30 px-sm py-1 rounded-full whitespace-nowrap text-on-surface-variant active:scale-95">
                <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>tune</span>
                <span className="font-label-md text-label-md">Temp: 0.7</span>
              </button>
              <button className="flex items-center gap-1 bg-surface-container-high border border-outline-variant/30 px-sm py-1 rounded-full whitespace-nowrap text-on-surface-variant active:scale-95">
                <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>history_edu</span>
                <span className="font-label-md text-label-md">Summary Mode</span>
              </button>
            </div>
            {/* Input Controls */}
            <div className="flex items-center gap-sm bg-surface-container-highest rounded-full border border-outline-variant/50 p-1 pl-md shadow-inner">
              <button className="text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>attach_file</span>
              </button>
              <textarea 
                ref={textareaRef}
                onInput={handleInput}
                className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface font-body-md py-2 resize-none max-h-32 overflow-y-auto no-scrollbar outline-none" 
                placeholder="Ask anything about your data..." 
                rows={1}
              ></textarea>
              <button className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary-container transition-all active:scale-90 shrink-0">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Shell */}
        <nav className="absolute bottom-0 w-full z-50 border-t border-outline-variant/30 shadow-lg bg-surface-container-highest dark:bg-surface-container-highest flex justify-around items-center h-16 px-md shrink-0">
            <div className="flex flex-col items-center justify-center text-secondary bg-[rgba(76,215,246,0.1)] rounded-xl px-4 py-1">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>chat</span>
              <span className="font-label-md text-label-md">Chat</span>
            </div>
            <Link href="/mobile/kb" className="flex flex-col items-center justify-center text-on-surface-variant active:bg-surface-bright">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>storage</span>
              <span className="font-label-md text-label-md">Data</span>
            </Link>
            <Link href="/mobile/home" className="flex flex-col items-center justify-center text-on-surface-variant active:bg-surface-bright">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>home</span>
              <span className="font-label-md text-label-md">Home</span>
            </Link>
            <div className="flex flex-col items-center justify-center text-on-surface-variant active:bg-surface-bright">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>person</span>
              <span className="font-label-md text-label-md">Profile</span>
            </div>
        </nav>

        {/* Citations Drawer (Modal) */}
        {showCitations && (
          <div className="absolute inset-0 z-[100] flex items-end">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowCitations(false)}></div>
            <div className="relative w-full bg-surface-container p-lg rounded-t-3xl border-t border-outline-variant/30 transition-transform transform translate-y-0 animate-in slide-in-from-bottom duration-300">
              <div className="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mb-lg"></div>
              <div className="flex justify-between items-center mb-md">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Source Citations</h3>
                <button onClick={() => setShowCitations(false)}>
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>close</span>
                </button>
              </div>
              <div className="space-y-md max-h-[50vh] overflow-y-auto">
                <div className="p-md bg-surface-container-low border border-outline-variant/20 rounded-xl">
                  <div className="flex items-center justify-between mb-xs">
                    <span className="font-label-md text-label-md text-secondary">[1] Infrastructure_Specs_v2.pdf</span>
                    <span className="text-[10px] font-mono-code bg-secondary/10 px-1 text-secondary rounded">Similarity: 0.98</span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant italic">"...indexing latency reduced by 42% following the implementation of the HNSW algorithm clusters..."</p>
                </div>
                <div className="p-md bg-surface-container-low border border-outline-variant/20 rounded-xl">
                  <div className="flex items-center justify-between mb-xs">
                    <span className="font-label-md text-label-md text-secondary">[2] API-Docs-Endpoint-Refresh</span>
                    <span className="text-[10px] font-mono-code bg-secondary/10 px-1 text-secondary rounded">Similarity: 0.84</span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant italic">"...tokenization pipeline now supports multi-modal embeddings for PDF and Excel ingestion..."</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
