"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const ms = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
const msFill = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";

export default function MobileKnowledgeBase() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={`${isDark ? 'dark' : ''} flex flex-col h-full bg-[#0e131e] text-[#dee2f2]`}>

      {/* Header */}
      <header className="shrink-0 bg-[rgba(14,19,30,0.95)] backdrop-blur-md border-b border-[#464554]/30 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c0c1ff] text-[24px]" style={{ fontVariationSettings: ms }}>hub</span>
          <h1 className="font-bold text-[17px] text-[#dee2f2] tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Nexus RAG</h1>
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

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Bento Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Token Usage */}
          <div className="bg-[rgba(27,32,43,0.8)] border border-[#908fa0]/20 rounded-xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[#908fa0]">
              <span className="text-[11px] font-medium" style={{ fontFamily: 'Geist, sans-serif' }}>Token Usage</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: ms }}>data_usage</span>
            </div>
            <div>
              <span className="text-[20px] font-semibold text-[#c0c1ff]" style={{ fontFamily: 'Geist, sans-serif' }}>84.2k</span>
              <span className="text-[11px] text-[#908fa0] ml-1" style={{ fontFamily: 'Inter, sans-serif' }}>/ 1M</span>
            </div>
            <div className="h-1 w-full bg-[#303541] rounded-full overflow-hidden">
              <div className="h-full bg-[#c0c1ff] shadow-[0_0_8px_rgba(192,193,255,0.5)]" style={{ width: '8.4%' }}></div>
            </div>
          </div>

          {/* Vector DB */}
          <div className="bg-[rgba(27,32,43,0.8)] border border-[#908fa0]/20 rounded-xl p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[#908fa0]">
              <span className="text-[11px] font-medium" style={{ fontFamily: 'Geist, sans-serif' }}>Vector DB</span>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: ms }}>database</span>
            </div>
            <div>
              <span className="text-[20px] font-semibold text-[#4cd7f6]" style={{ fontFamily: 'Geist, sans-serif' }}>1.2ms</span>
              <span className="text-[11px] text-[#908fa0] ml-1" style={{ fontFamily: 'Inter, sans-serif' }}>latency</span>
            </div>
            <div className="flex items-end h-7 gap-[2px]">
              <div className="flex-1 bg-[#4cd7f6]/20 h-2 rounded-t-sm"></div>
              <div className="flex-1 bg-[#4cd7f6]/40 h-3 rounded-t-sm"></div>
              <div className="flex-1 bg-[#4cd7f6]/30 h-2.5 rounded-t-sm"></div>
              <div className="flex-1 bg-[#4cd7f6]/60 h-5 rounded-t-sm"></div>
              <div className="flex-1 bg-[#4cd7f6] h-7 rounded-t-sm"></div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div>
          <h2 className="text-[17px] font-semibold text-[#dee2f2]" style={{ fontFamily: 'Geist, sans-serif' }}>Knowledge Base</h2>
          <p className="text-[12px] text-[#908fa0] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Manage and sync your connected data sources.</p>
        </div>

        {/* Sources List */}
        <div className="space-y-3">
          {/* Synced */}
          <div className="bg-[#171c27] border border-[#464554]/20 rounded-xl px-4 py-3 flex items-center justify-between active:bg-[#252a35] active:scale-[0.98] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c0c1ff]/10 border border-[#c0c1ff]/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#c0c1ff] text-[20px]" style={{ fontVariationSettings: ms }}>description</span>
              </div>
              <div>
                <h3 className="text-[13px] font-medium text-[#dee2f2]" style={{ fontFamily: 'Geist, sans-serif' }}>Internal_Q3_Report.pdf</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]"></span>
                  <span className="text-[11px] text-[#908fa0]" style={{ fontFamily: 'Inter, sans-serif' }}>Synced 2m ago</span>
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#908fa0] text-[20px]" style={{ fontVariationSettings: ms }}>more_vert</span>
          </div>

          {/* Indexing */}
          <div className="bg-[#171c27] border border-[#464554]/20 rounded-xl px-4 py-3 flex items-center justify-between active:bg-[#252a35] active:scale-[0.98] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffb783]/10 border border-[#ffb783]/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#ffb783] text-[20px]" style={{ fontVariationSettings: ms }}>inventory_2</span>
              </div>
              <div>
                <h3 className="text-[13px] font-medium text-[#dee2f2]" style={{ fontFamily: 'Geist, sans-serif' }}>Product Documentation</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse"></span>
                  <span className="text-[11px] text-[#908fa0]" style={{ fontFamily: 'Inter, sans-serif' }}>Indexing (45%)</span>
                </div>
              </div>
            </div>
            <div className="w-14 h-1 bg-[#303541] rounded-full overflow-hidden">
              <div className="h-full bg-[#ffb783]" style={{ width: '45%' }}></div>
            </div>
          </div>

          {/* Failed */}
          <div className="bg-[#171c27] border border-[#464554]/20 rounded-xl px-4 py-3 flex items-center justify-between active:bg-[#252a35] active:scale-[0.98] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#303541] border border-[#464554]/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#c7c4d7] text-[20px]" style={{ fontVariationSettings: ms }}>link</span>
              </div>
              <div>
                <h3 className="text-[13px] font-medium text-[#dee2f2]" style={{ fontFamily: 'Geist, sans-serif' }}>Engineering Wiki (Notion)</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
                  <span className="text-[11px] text-[#908fa0]" style={{ fontFamily: 'Inter, sans-serif' }}>Sync failed</span>
                </div>
              </div>
            </div>
            <button className="bg-[#93000a]/20 text-[#ffb4ab] text-[11px] font-semibold px-2.5 py-1 rounded-full active:scale-95 transition-transform" style={{ fontFamily: 'Geist, sans-serif' }}>Retry</button>
          </div>

          {/* Add More */}
          <div className="border-2 border-dashed border-[#464554]/30 rounded-xl px-4 py-8 flex flex-col items-center justify-center text-center gap-2 opacity-60">
            <span className="material-symbols-outlined text-[#908fa0] text-[32px]" style={{ fontVariationSettings: ms }}>post_add</span>
            <div>
              <p className="text-[13px] font-medium text-[#dee2f2]" style={{ fontFamily: 'Geist, sans-serif' }}>Add more sources</p>
              <p className="text-[11px] text-[#908fa0] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Connect GitHub, Slack or Google Drive</p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button — inside flex, positioned with absolute relative to outer div */}
      <div className="relative">
        <button className="absolute bottom-20 right-4 w-14 h-14 bg-[#c0c1ff] text-[#1000a9] rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform z-10">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: msFill }}>add</span>
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="shrink-0 bg-[#303541] border-t border-[#464554]/30 flex justify-around items-center h-14 px-4">
        <Link href="/mobile/chatbot" className="flex flex-col items-center justify-center text-[#c7c4d7]">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>chat</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Chat</span>
        </Link>
        <div className="flex flex-col items-center justify-center text-[#4cd7f6] bg-[rgba(76,215,246,0.1)] rounded-xl px-4 py-1">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: msFill }}>storage</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Data</span>
        </div>
        <Link href="/mobile/home" className="flex flex-col items-center justify-center text-[#c7c4d7]">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>home</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Home</span>
        </Link>
        <div className="flex flex-col items-center justify-center text-[#c7c4d7]">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>person</span>
          <span className="text-[11px]" style={{ fontFamily: 'Geist, sans-serif' }}>Profile</span>
        </div>
      </nav>
    </div>
  );
}
