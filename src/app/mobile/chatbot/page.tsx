"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';

const ms = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
const msFill = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";

export default function MobileChatbot() {
  const [isDark, setIsDark] = useState(true);
  const [showCitations, setShowCitations] = useState(false);
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className={`${isDark ? 'dark' : ''} flex flex-col h-full`}>
      <style>{`
        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #464554; border-radius: 10px; }
        .glass-panel {
          background: rgba(14, 19, 30, 0.95);
          backdrop-filter: blur(12px);
        }
      `}</style>

      {/* TopAppBar — shrink-0 so it never collapses */}
      <header className="shrink-0 bg-[rgba(14,19,30,0.95)] backdrop-blur-md border-b border-[#464554]/30 px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c0c1ff] text-2xl" style={{ fontVariationSettings: ms }}>hub</span>
          <div className="flex flex-col">
            <span className="font-semibold text-[15px] text-[#dee2f2] leading-tight tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Nexus RAG</span>
            <span className="text-[11px] text-[#4cd7f6] flex items-center gap-1" style={{ fontFamily: 'Geist, sans-serif' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse inline-block"></span>
              Connected to 14 Sources
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDark(!isDark)} className="text-[#c7c4d7] hover:text-[#4cd7f6] transition-colors">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button className="text-[#c7c4d7] hover:text-[#4cd7f6] transition-colors">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>more_vert</span>
          </button>
        </div>
      </header>

      {/* Chat messages — flex-1 so it fills remaining space, scrollable */}
      <main className="flex-1 overflow-y-auto chat-scroll px-4 py-4 space-y-4 bg-[#0e131e]">
        {/* AI Response */}
        <div className="flex flex-col items-start gap-1 max-w-[88%]">
          <div className="bg-[#1b202b] border-l-2 border-[#4cd7f6] p-3 rounded-xl rounded-tl-none shadow-sm">
            <p className="text-[13px] text-[#dee2f2]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Based on the current knowledge base, the Enterprise Workspace is optimized for v2.4.0. The RAG pipeline is currently processing 14 disparate data sources including your internal Wiki and API documentation.{' '}
              <button
                onClick={() => setShowCitations(true)}
                className="inline-flex items-center bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 rounded-full px-2 py-0.5 ml-1 hover:bg-[#4cd7f6]/20 active:scale-95 transition-all"
              >
                <span className="text-[10px] text-[#4cd7f6] font-bold" style={{ fontFamily: 'monospace' }}>CITATIONS [3]</span>
              </button>
            </p>
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className="bg-[#303541] border border-[#464554]/30 px-2 py-0.5 rounded text-[10px] text-[#908fa0]" style={{ fontFamily: 'monospace' }}>latency: 240ms</span>
              <span className="bg-[#303541] border border-[#464554]/30 px-2 py-0.5 rounded text-[10px] text-[#908fa0]" style={{ fontFamily: 'monospace' }}>tokens: 142</span>
            </div>
          </div>
          <span className="text-[11px] text-[#908fa0] px-1 italic" style={{ fontFamily: 'Inter, sans-serif' }}>Nexus Assistant • 10:12 AM</span>
        </div>

        {/* User Message */}
        <div className="flex flex-col items-end gap-1 ml-auto max-w-[88%]">
          <div className="bg-[#0e131e] border border-[#c0c1ff]/40 p-3 rounded-xl rounded-tr-none">
            <p className="text-[13px] text-[#dee2f2]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Can you summarize the performance impact of the new vector indexing update?
            </p>
          </div>
          <span className="text-[11px] text-[#908fa0] px-1 italic" style={{ fontFamily: 'Inter, sans-serif' }}>You • 10:14 AM</span>
        </div>

        {/* AI Streaming Response */}
        <div className="flex flex-col items-start gap-1 max-w-[88%]">
          <div className="bg-[#1b202b] border-l-2 border-[#4cd7f6] p-3 rounded-xl rounded-tl-none shadow-sm min-w-[180px]">
            <div className="flex gap-1.5 items-center py-1 mb-1">
              <div className="w-1.5 h-1.5 bg-[#4cd7f6] rounded-full animate-bounce" style={{ animationDelay: '-0.3s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#4cd7f6] rounded-full animate-bounce" style={{ animationDelay: '-0.15s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#4cd7f6] rounded-full animate-bounce"></div>
            </div>
            <p className="text-[13px] text-[#c7c4d7] italic" style={{ fontFamily: 'Inter, sans-serif' }}>Retrieving context from documentation...</p>
            <div className="mt-3 h-1 bg-[#303541] w-full rounded-full overflow-hidden">
              <div className="h-full bg-[#4cd7f6] w-2/3 shadow-[0_0_8px_rgba(76,215,246,0.5)] animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Input Area — shrink-0 so it stays at the bottom */}
      <div className="shrink-0 glass-panel border-t border-[#464554]/20 px-3 py-2 z-10">
        {/* Model selector chips */}
        <div className="flex items-center gap-2 overflow-x-auto mb-2 pb-1" style={{ scrollbarWidth: 'none' }}>
          <button className="flex items-center gap-1 bg-[#252a35] border border-[#464554]/30 px-2.5 py-1 rounded-full whitespace-nowrap text-[#c7c4d7] hover:text-[#c0c1ff] transition-all active:scale-95 text-[12px]" style={{ fontFamily: 'Geist, sans-serif' }}>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: ms }}>psychology</span>
            Nexus-v4 (Pro)
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: ms }}>expand_more</span>
          </button>
          <button className="flex items-center gap-1 bg-[#252a35] border border-[#464554]/30 px-2.5 py-1 rounded-full whitespace-nowrap text-[#c7c4d7] active:scale-95 text-[12px]" style={{ fontFamily: 'Geist, sans-serif' }}>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: ms }}>tune</span>
            Temp: 0.7
          </button>
          <button className="flex items-center gap-1 bg-[#252a35] border border-[#464554]/30 px-2.5 py-1 rounded-full whitespace-nowrap text-[#c7c4d7] active:scale-95 text-[12px]" style={{ fontFamily: 'Geist, sans-serif' }}>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: ms }}>history_edu</span>
            Summary
          </button>
        </div>

        {/* Text input row */}
        <div className="flex items-end gap-2 bg-[#303541] rounded-2xl border border-[#464554]/50 px-3 py-2">
          <button className="text-[#908fa0] hover:text-[#c0c1ff] transition-colors shrink-0 mb-1">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: ms }}>attach_file</span>
          </button>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onInput={handleInput}
            className="flex-1 bg-transparent border-none outline-none resize-none text-[14px] text-[#dee2f2] placeholder:text-[#908fa0]/60 max-h-28 overflow-y-auto py-0.5"
            placeholder="Ask anything about your data..."
            rows={1}
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <button className="w-9 h-9 bg-[#c0c1ff] text-[#1000a9] rounded-full flex items-center justify-center shadow-lg hover:bg-[#8083ff] transition-all active:scale-90 shrink-0">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: msFill }}>send</span>
          </button>
        </div>
      </div>

      {/* Bottom Nav — shrink-0 */}
      <nav className="shrink-0 bg-[#303541] border-t border-[#464554]/30 flex justify-around items-center h-14 px-4">
        <div className="flex flex-col items-center justify-center text-[#4cd7f6] bg-[rgba(76,215,246,0.1)] rounded-xl px-4 py-1">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: msFill }}>chat</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Chat</span>
        </div>
        <Link href="/mobile/kb" className="flex flex-col items-center justify-center text-[#c7c4d7]">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>storage</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Data</span>
        </Link>
        <Link href="/mobile/home" className="flex flex-col items-center justify-center text-[#c7c4d7]">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>home</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Home</span>
        </Link>
        <div className="flex flex-col items-center justify-center text-[#c7c4d7]">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>person</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Profile</span>
        </div>
      </nav>

      {/* Citations Drawer */}
      {showCitations && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(14,19,30,0.7)', backdropFilter: 'blur(4px)' }}>
          <div onClick={() => setShowCitations(false)} className="absolute inset-0" />
          <div className="relative w-full bg-[#1b202b] rounded-t-3xl border-t border-[#464554]/30 p-5 z-10">
            <div className="w-10 h-1 bg-[#464554] rounded-full mx-auto mb-4"></div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[17px] font-semibold text-[#dee2f2]" style={{ fontFamily: 'Geist, sans-serif' }}>Source Citations</h3>
              <button onClick={() => setShowCitations(false)}>
                <span className="material-symbols-outlined text-[#c7c4d7]" style={{ fontVariationSettings: ms }}>close</span>
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {[
                { title: '[1] Infrastructure_Specs_v2.pdf', sim: '0.98', text: '"...indexing latency reduced by 42% following the implementation of the HNSW algorithm..."' },
                { title: '[2] API-Docs-Endpoint-Refresh', sim: '0.84', text: '"...tokenization pipeline now supports multi-modal embeddings for PDF and Excel ingestion..."' },
              ].map((c, i) => (
                <div key={i} className="p-3 bg-[#171c27] border border-[#464554]/20 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[#4cd7f6] font-medium" style={{ fontFamily: 'Geist, sans-serif' }}>{c.title}</span>
                    <span className="text-[10px] bg-[#4cd7f6]/10 px-1.5 py-0.5 rounded text-[#4cd7f6]" style={{ fontFamily: 'monospace' }}>Sim: {c.sim}</span>
                  </div>
                  <p className="text-[12px] text-[#c7c4d7] italic" style={{ fontFamily: 'Inter, sans-serif' }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
