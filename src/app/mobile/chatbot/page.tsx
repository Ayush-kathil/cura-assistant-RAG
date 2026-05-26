"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';

const ms = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
const msFill = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";

type MessageRole = 'assistant' | 'user';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isVoice?: boolean;
}

const ConversationBubble = memo(function ConversationBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === 'assistant';

  if (isAssistant) {
    return (
      <div className="flex items-end gap-2 max-w-[88%] mb-6">
        <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-slate-100 overflow-hidden shadow-sm mb-1">
          <img src="/mobile-assets/curio.png" alt="Curio" className="w-full h-full object-contain p-0.5" />
        </div>
        <div className="flex flex-col items-start gap-1">
          <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-bl-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <p className="text-[14px] leading-relaxed text-slate-800 font-medium">
              {message.content}
            </p>
          </div>
          <span className="text-[10px] text-slate-400 font-medium ml-2 uppercase tracking-wide">
            {message.timestamp}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 ml-auto max-w-[88%] mb-6 justify-end">
      <div className="flex flex-col items-end gap-1">
        <div className="bg-[#EBF3FF] p-4 rounded-3xl rounded-br-xl">
          {message.isVoice ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: msFill }}>play_arrow</span>
              </div>
              <div className="flex items-center gap-[2px] h-6 opacity-60">
                {/* Fake waveform */}
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-[3px] bg-blue-500 rounded-full" style={{ height: `${Math.random() * 100}%`, minHeight: '20%' }}></div>
                ))}
              </div>
              <span className="text-[11px] text-blue-500 font-bold ml-1">1:25</span>
            </div>
          ) : (
            <p className="text-[14px] leading-relaxed text-slate-800 font-medium">
              {message.content}
            </p>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-medium mr-2 uppercase tracking-wide">
          {message.timestamp}
        </span>
      </div>
      <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-slate-200 overflow-hidden shadow-sm mb-1">
         <img src="https://ui-avatars.com/api/?name=Alice&background=random" alt="Alice" className="w-full h-full object-cover" />
      </div>
    </div>
  );
});

const DEMO_HISTORY: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'preparing for my biology exam tomorrow. There\'s just too much to remember!',
    timestamp: '8:36 PM',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'Of course! Don\'t worry, I can help you organize everything. Tell me which topics you find hardest.',
    timestamp: '8:36 PM',
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'Voice message',
    isVoice: true,
    timestamp: '8:38 PM',
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: 'Thanks for sharing that! The cell has several key organelles: the nucleus stores the cell\'s DNA and controls its activities, mitochondria produce energy, ribosomes make proteins, and the cell membrane protects the cell while letting substances in and out.',
    timestamp: '8:38 PM',
  }
];

export default function MobileChatbot() {
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listEl = messageListRef.current;
    if (listEl) listEl.scrollTop = listEl.scrollHeight;
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#FAFCFF] text-slate-900 font-sans relative overflow-hidden">
      
      {/* Header */}
      <header className="shrink-0 px-4 py-4 flex justify-between items-center z-10 bg-white/80 backdrop-blur-md">
        <Link href="/mobile/home" className="flex items-center gap-1 text-slate-800 active:opacity-50 transition-opacity">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: ms }}>arrow_back_ios_new</span>
          <span className="font-bold text-[16px] tracking-tight">Curio AI</span>
        </Link>
        <button className="text-slate-500 p-1 active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: ms }}>more_horiz</span>
        </button>
      </header>

      {/* Chat Area */}
      <div ref={messageListRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-6 scroll-smooth">
        {DEMO_HISTORY.map(msg => (
          <ConversationBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Voice Input Dock */}
      <div className="shrink-0 px-6 pt-4 pb-[max(env(safe-area-inset-bottom),24px)] flex justify-between items-center bg-gradient-to-t from-white via-white to-transparent z-20">
        
        <button className="w-10 h-10 flex items-center justify-center text-slate-500 bg-white border border-slate-100 rounded-full shadow-sm active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: ms }}>keyboard</span>
        </button>

        <div className="relative flex items-center justify-center">
          {/* Glowing rings */}
          <div className="absolute w-[80px] h-[80px] rounded-full border-2 border-blue-400/40 animate-ping" style={{ animationDuration: '2s' }}></div>
          <div className="absolute w-[66px] h-[66px] rounded-full bg-blue-100/50 blur-md"></div>
          
          <button className="relative w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(59,130,246,0.4)] active:scale-95 transition-transform z-10">
             <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: msFill }}>mic</span>
          </button>
        </div>

        <button className="w-10 h-10 flex items-center justify-center text-slate-500 bg-white border border-slate-100 rounded-full shadow-sm active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: ms }}>close</span>
        </button>
        
      </div>
      
    </div>
  );
}
