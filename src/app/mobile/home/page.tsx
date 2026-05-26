"use client";

import React from 'react';
import Link from 'next/link';

const ms = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
const msFill = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";

export default function MobileHome() {
  return (
    <div className="flex flex-col h-full bg-white text-slate-900 font-sans relative">
      
      {/* Header */}
      <header className="shrink-0 px-6 py-5 flex justify-between items-center z-10">
        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shadow-sm">
          <img src="https://ui-avatars.com/api/?name=Alice&background=random" alt="Alice" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-700 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: ms }}>notifications</span>
          </button>
          <button className="text-slate-700 active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: ms }}>menu</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 scroll-smooth">
        
        {/* Greeting & Robot */}
        <div className="relative mt-2 mb-8 flex justify-between items-start">
          <h1 className="text-[34px] leading-[1.15] font-bold text-slate-900 tracking-tight max-w-[65%]" style={{ fontFamily: 'Geist, sans-serif' }}>
            <span className="text-blue-500 font-medium">Hi Alice!</span> How can I help you today?
          </h1>
          
          <div className="absolute right-[-20px] top-[-10px] w-36 h-36 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
            <img src="/mobile-assets/curio.png" alt="Curio Robot" className="w-full h-full object-contain drop-shadow-xl" />
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 mb-4 -mx-6 px-6 hide-scrollbar">
          {['Study planner', 'Daily inspiration', 'API Explorer', 'Code Helper', 'Quick facts', 'Fun Quizzes'].map((chip, i) => (
            <button key={i} className="shrink-0 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-medium text-slate-700 shadow-sm hover:bg-slate-100 active:scale-95 transition-all">
              {chip}
            </button>
          ))}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Talk with bot */}
          <Link href="/mobile/chatbot" className="bg-[#EBF3FF] rounded-3xl p-5 flex flex-col gap-4 active:scale-95 transition-transform shadow-sm">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-blue-500" style={{ fontVariationSettings: ms }}>mic</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-[15px] mb-1">Talk with bot</h3>
              <p className="text-slate-500 text-[11px] leading-tight font-medium">Chat naturally and get instant answers.</p>
            </div>
          </Link>
          
          {/* Chat with bot */}
          <Link href="/mobile/chatbot" className="bg-[#EBF3FF] rounded-3xl p-5 flex flex-col gap-4 active:scale-95 transition-transform shadow-sm">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-blue-500" style={{ fontVariationSettings: ms }}>chat</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-[15px] mb-1">Chat with Bot</h3>
              <p className="text-slate-500 text-[11px] leading-tight font-medium">Get responses and advice in real time.</p>
            </div>
          </Link>
        </div>

        {/* Generate Image Card */}
        <div className="bg-[#EBF3FF] rounded-3xl p-4 flex gap-4 active:scale-[0.98] transition-transform shadow-sm">
          <div className="w-24 h-24 rounded-2xl bg-[#1a1a2e] overflow-hidden shrink-0">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtruSoqWekJhz8Lw6OPILJOzqfU2eqyzrtVY8m5YxW4dqWIngCLhLEAR7fbyjhBcyJyqOhkkKg0DwbcRSSkHbLcFFRgjXI0Oyv4pIFTaAcHbrMOh3fCMlTk9TpeaNRNt4cRu9SBbw3hiNh7UWF3zeziPsPwa6zHd7E5ooQ1Tkyh3ceCwp_V4Le0Vk28pRL3MBtJsYprWCSxOiIw6N767gQh_KLfhNN543YfDefeAft8Aw73UkzOu1vzAKshGVXyte7p5La4FQc6HU" className="w-full h-full object-cover" alt="Generative AI" />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-bold text-slate-900 text-[16px] mb-1">Generate Image</h3>
            <p className="text-slate-500 text-[12px] leading-tight mb-3 font-medium">Create unique images from your prompts.</p>
            <button className="bg-white text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full w-fit flex items-center gap-1 shadow-sm">
              Try it now <span className="material-symbols-outlined text-[14px]">call_made</span>
            </button>
          </div>
        </div>

      </main>

      {/* Bottom Nav */}
      <nav className="shrink-0 bg-white flex justify-around items-center min-h-[70px] pb-[env(safe-area-inset-bottom)] px-6 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-20">
        <Link href="/mobile/home" className="flex flex-col items-center justify-center p-2 text-slate-900 active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: msFill }}>home</span>
        </Link>
        <Link href="/mobile/kb" className="flex flex-col items-center justify-center p-2 text-slate-400 active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: ms }}>segment</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center p-2 text-slate-400 active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: ms }}>person</span>
        </Link>
      </nav>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
