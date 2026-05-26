"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const ms = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
const msFill = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";

export default function MobileHome() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={`${isDark ? 'dark' : ''} flex flex-col h-full bg-[#0e131e] text-[#dee2f2]`}>

      {/* Header */}
      <header className="shrink-0 bg-[rgba(14,19,30,0.95)] backdrop-blur-md border-b border-[#464554]/30 px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c0c1ff] text-[24px]" style={{ fontVariationSettings: ms }}>hub</span>
          <span className="font-bold text-[17px] text-[#dee2f2] tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Nexus RAG</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDark(!isDark)} className="text-[#c7c4d7] hover:text-[#4cd7f6] transition-colors">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button className="bg-[#c0c1ff] text-[#1000a9] text-[12px] font-semibold px-3 py-1.5 rounded-xl active:scale-95 transition-transform" style={{ fontFamily: 'Geist, sans-serif' }}>
            Launch App
          </button>
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-2">

        {/* Hero Section */}
        <section className="relative rounded-2xl overflow-hidden min-h-[200px] flex flex-col justify-center items-center text-center p-5">
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              alt="AI visual"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtruSoqWekJhz8Lw6OPILJOzqfU2eqyzrtVY8m5YxW4dqWIngCLhLEAR7fbyjhBcyJyqOhkkKg0DwbcRSSkHbLcFFRgjXI0Oyv4pIFTaAcHbrMOh3fCMlTk9TpeaNRNt4cRu9SBbw3hiNh7UWF3zeziPsPwa6zHd7E5ooQ1Tkyh3ceCwp_V4Le0Vk28pRL3MBtJsYprWCSxOiIw6N767gQh_KLfhNN543YfDefeAft8Aw73UkzOu1vzAKshGVXyte7p5La4FQc6HU"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e131e]/40 via-[#0e131e]/70 to-[#0e131e] z-10"></div>
          <div className="relative z-20">
            <h1 className="text-[24px] font-bold text-[#dee2f2] leading-tight mb-2" style={{ fontFamily: 'Geist, sans-serif' }}>
              Your Data. Your AI.<br /><span className="text-[#4cd7f6]">Instant Answers.</span>
            </h1>
            <p className="text-[13px] text-[#c7c4d7] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Enterprise-grade RAG for your private knowledge base.
            </p>
            <div className="flex gap-3 justify-center">
              <button className="bg-[#c0c1ff] text-[#1000a9] text-[13px] font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform" style={{ fontFamily: 'Geist, sans-serif' }}>
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: ms }}>bolt</span>
                Get Started
              </button>
              <button className="border border-[#464554] text-[#dee2f2] text-[13px] px-5 py-2.5 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform" style={{ fontFamily: 'Geist, sans-serif' }}>
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: ms }}>menu_book</span>
                Docs
              </button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Indexed Docs */}
          <div className="bg-[rgba(27,32,43,0.8)] border border-[#908fa0]/20 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-[#908fa0] leading-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Indexed Docs</span>
              <span className="material-symbols-outlined text-[#4cd7f6] text-[14px]" style={{ fontVariationSettings: ms }}>description</span>
            </div>
            <div>
              <span className="text-[17px] font-bold text-[#c0c1ff]" style={{ fontFamily: 'Geist, sans-serif' }}>12.8k</span>
            </div>
            <div className="w-full bg-[#303541] h-1 rounded-full overflow-hidden">
              <div className="bg-[#4cd7f6] h-full shadow-[0_0_6px_rgba(76,215,246,0.6)]" style={{ width: '74%' }}></div>
            </div>
          </div>

          {/* Latency */}
          <div className="bg-[rgba(27,32,43,0.8)] border border-[#908fa0]/20 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-[#908fa0] leading-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Latency</span>
              <span className="material-symbols-outlined text-[#ffb783] text-[14px]" style={{ fontVariationSettings: ms }}>speed</span>
            </div>
            <span className="text-[17px] font-bold text-[#dee2f2]" style={{ fontFamily: 'Geist, sans-serif' }}>142ms</span>
            <div className="flex items-end gap-0.5 h-5">
              {[40, 60, 100, 35, 70, 50].map((h, i) => (
                <div key={i} className="flex-1 bg-[#c0c1ff]/40 rounded-t-[2px]" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          {/* Sync */}
          <div className="bg-[rgba(27,32,43,0.8)] border border-[#908fa0]/20 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-[#908fa0] leading-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Sync</span>
              <span className="material-symbols-outlined text-[#03b5d3] text-[14px]" style={{ fontVariationSettings: ms }}>sync</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]"></span>
              <span className="text-[13px] font-semibold text-[#dee2f2]" style={{ fontFamily: 'Geist, sans-serif' }}>80%</span>
            </div>
            <p className="text-[10px] text-[#908fa0]" style={{ fontFamily: 'Inter, sans-serif' }}>12m ago</p>
          </div>
        </div>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-[#dee2f2] flex items-center gap-1.5" style={{ fontFamily: 'Geist, sans-serif' }}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: ms }}>history</span>
              Recent Activity
            </h2>
            <button className="text-[12px] text-[#4cd7f6] hover:underline" style={{ fontFamily: 'Geist, sans-serif' }}>View All</button>
          </div>

          <div className="space-y-3">
            {/* AI Response */}
            <div className="bg-[#171c27] border-l-[3px] border-[#4cd7f6] px-3 py-3 rounded-xl rounded-tl-none flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-[#4cd7f6]/10 p-1 rounded-lg">
                    <span className="material-symbols-outlined text-[#4cd7f6] text-[15px]" style={{ fontVariationSettings: ms }}>smart_toy</span>
                  </div>
                  <span className="text-[12px] font-medium text-[#4cd7f6]" style={{ fontFamily: 'Geist, sans-serif' }}>Nexus Assistant</span>
                </div>
                <span className="text-[10px] text-[#c7c4d7] uppercase tracking-wider" style={{ fontFamily: 'monospace' }}>2m ago</span>
              </div>
              <p className="text-[13px] text-[#dee2f2]" style={{ fontFamily: 'Inter, sans-serif' }}>The Q3 revenue projections indicate a 14% growth in the APAC region, primarily driven by SaaS adoption...</p>
              <span className="inline-flex items-center bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 px-2 py-0.5 rounded text-[10px] text-[#4cd7f6] self-start" style={{ fontFamily: 'monospace' }}>
                DOC_REF_241
              </span>
            </div>

            {/* User Query */}
            <div className="bg-[#090e19] border border-[#c0c1ff]/20 px-3 py-3 rounded-xl flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-[#c0c1ff]/10 p-1 rounded-lg">
                    <span className="material-symbols-outlined text-[#c0c1ff] text-[15px]" style={{ fontVariationSettings: ms }}>person</span>
                  </div>
                  <span className="text-[12px] font-medium text-[#c0c1ff]" style={{ fontFamily: 'Geist, sans-serif' }}>You</span>
                </div>
                <span className="text-[10px] text-[#c7c4d7] uppercase tracking-wider" style={{ fontFamily: 'monospace' }}>15m ago</span>
              </div>
              <p className="text-[13px] text-[#c7c4d7] italic" style={{ fontFamily: 'Inter, sans-serif' }}>"Summarize the recent financial disclosures for Q3 2024 from the global folder."</p>
            </div>

            {/* System Event */}
            <div className="bg-[#171c27] border border-[#464554]/10 px-3 py-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#c7c4d7] text-[20px]" style={{ fontVariationSettings: ms }}>data_object</span>
                <div>
                  <p className="text-[13px] font-medium text-[#dee2f2]" style={{ fontFamily: 'Geist, sans-serif' }}>New Data Source Connected</p>
                  <p className="text-[11px] text-[#908fa0]" style={{ fontFamily: 'Inter, sans-serif' }}>SharePoint: Engineering Docs</p>
                </div>
              </div>
              <span className="text-[10px] text-[#908fa0]" style={{ fontFamily: 'monospace' }}>1h ago</span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="shrink-0 bg-[#303541] border-t border-[#464554]/30 flex justify-around items-center h-14 px-4">
        <Link href="/mobile/chatbot" className="flex flex-col items-center justify-center text-secondary bg-[rgba(76,215,246,0.1)] rounded-xl px-3 py-1">
          <span className="material-symbols-outlined text-[22px] text-[#4cd7f6]" style={{ fontVariationSettings: msFill }}>chat</span>
          <span className="text-[11px] text-[#4cd7f6]" style={{ fontFamily: 'Geist, sans-serif' }}>Chat</span>
        </Link>
        <Link href="/mobile/kb" className="flex flex-col items-center justify-center text-[#c7c4d7]">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>storage</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Data</span>
        </Link>
        <div className="flex flex-col items-center justify-center text-[#c7c4d7]">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>bar_chart</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Stats</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#c7c4d7]">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>person</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Profile</span>
        </div>
      </nav>
    </div>
  );
}
