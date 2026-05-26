"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const ms = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
const msFill = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";

export default function MobileKnowledgeBase() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={`${isDark ? 'dark' : ''} h-full overflow-y-auto overflow-x-hidden`}>
      <style>{`
        .glass-card {
            background: rgba(27, 32, 43, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(144, 143, 160, 0.2);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="bg-background text-on-surface font-body-md min-h-full flex flex-col pb-20 relative transition-colors duration-200">
        {/* TopAppBar */}
        <header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md text-primary dark:text-primary-fixed-dim sticky top-0 z-50 border-b border-outline-variant/30 flex justify-between items-center w-full px-lg py-md max-w-container-max mx-auto shrink-0">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: ms, fontSize: '24px' }}>hub</span>
            <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface dark:text-on-surface">Nexus RAG</h1>
          </div>
          <div className="flex items-center gap-md">
            <button
              onClick={() => setIsDark(!isDark)}
              className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors duration-200 cursor-pointer active:scale-90"
              style={{ fontVariationSettings: ms }}
            >
              {isDark ? 'light_mode' : 'dark_mode'}
            </button>
            <button className="bg-primary text-on-primary font-label-md px-md py-sm rounded-xl active:scale-95 transition-transform">
              Launch App
            </button>
          </div>
        </header>

        <main className="flex-1 p-md space-y-lg max-w-md mx-auto w-full">
          {/* System Health Metrics (Bento Style) */}
          <section className="grid grid-cols-2 gap-md">
            {/* Token Usage */}
            <div className="glass-card p-md rounded-xl flex flex-col gap-xs">
              <div className="flex items-center justify-between text-outline">
                <span className="font-label-md text-label-md">Token Usage</span>
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: ms }}>data_usage</span>
              </div>
              <div className="mt-sm">
                <span className="font-headline-sm text-headline-sm text-primary">84.2k</span>
                <span className="text-body-sm text-outline ml-xs">/ 1M</span>
              </div>
              <div className="h-1 w-full bg-surface-container-highest rounded-full mt-sm overflow-hidden">
                <div className="h-full bg-primary shadow-[0_0_8px_rgba(192,193,255,0.5)]" style={{ width: '8.4%' }}></div>
              </div>
            </div>

            {/* Vector DB */}
            <div className="glass-card p-md rounded-xl flex flex-col gap-xs">
              <div className="flex items-center justify-between text-outline">
                <span className="font-label-md text-label-md">Vector DB</span>
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: ms }}>database</span>
              </div>
              <div className="mt-sm">
                <span className="font-headline-sm text-headline-sm text-secondary">1.2ms</span>
                <span className="text-body-sm text-outline ml-xs">latency</span>
              </div>
              <div className="flex items-end h-8 gap-[2px] mt-sm">
                <div className="flex-1 bg-secondary/20 h-2 rounded-t-sm"></div>
                <div className="flex-1 bg-secondary/40 h-4 rounded-t-sm"></div>
                <div className="flex-1 bg-secondary/30 h-3 rounded-t-sm"></div>
                <div className="flex-1 bg-secondary/60 h-6 rounded-t-sm"></div>
                <div className="flex-1 bg-secondary h-8 rounded-t-sm"></div>
              </div>
            </div>
          </section>

          {/* Knowledge Base Header */}
          <header className="flex flex-col gap-xs">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Knowledge Base</h2>
            <p className="text-body-sm text-outline">Manage and sync your connected data sources.</p>
          </header>

          {/* Data Sources List */}
          <section className="space-y-md">
            {/* Source Item 1 — Synced */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-md flex items-center justify-between group active:bg-surface-container-high transition-all active:scale-[0.98]">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: ms }}>description</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface">Internal_Q3_Report.pdf</h3>
                  <div className="flex items-center gap-sm mt-[2px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span className="text-body-sm text-outline">Synced 2m ago</span>
                  </div>
                </div>
              </div>
              <button className="material-symbols-outlined text-outline hover:text-on-surface" style={{ fontVariationSettings: ms }}>more_vert</button>
            </div>

            {/* Source Item 2 — Indexing */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-md flex items-center justify-between group active:bg-surface-container-high transition-all active:scale-[0.98]">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center border border-tertiary/20">
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: ms }}>inventory_2</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface">Product Documentation</h3>
                  <div className="flex items-center gap-sm mt-[2px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    <span className="text-body-sm text-outline">Indexing (45%)</span>
                  </div>
                </div>
              </div>
              <div className="w-16 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-tertiary" style={{ width: '45%' }}></div>
              </div>
            </div>

            {/* Source Item 3 — Failed */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-md flex items-center justify-between group active:bg-surface-container-high transition-all active:scale-[0.98]">
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant/30">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: ms }}>link</span>
                </div>
                <div>
                  <h3 className="font-label-md text-label-md text-on-surface">Engineering Wiki (Notion)</h3>
                  <div className="flex items-center gap-sm mt-[2px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                    <span className="text-body-sm text-outline">Sync failed</span>
                  </div>
                </div>
              </div>
              <button className="bg-error-container/20 text-error font-label-md px-sm py-[2px] rounded-full text-xs">Retry</button>
            </div>

            {/* Empty State Suggestion */}
            <div className="border-2 border-dashed border-outline-variant/20 rounded-xl p-xl flex flex-col items-center justify-center text-center gap-sm opacity-60">
              <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: ms, fontSize: '32px' }}>post_add</span>
              <div>
                <p className="font-label-md text-label-md text-on-surface">Add more sources</p>
                <p className="text-body-sm text-outline">Connect GitHub, Slack or Google Drive</p>
              </div>
            </div>
          </section>
        </main>

        {/* Floating Action Button */}
        <button className="fixed bottom-24 right-md w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-40">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: msFill }}>add</span>
        </button>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full z-50 bg-surface-container-highest dark:bg-surface-container-highest border-t border-outline-variant/30 shadow-lg flex justify-around items-center h-16 px-md" style={{maxWidth: '28rem', left: '50%', transform: 'translateX(-50%)'}}>
          <Link href="/mobile/chatbot" className="flex flex-col items-center justify-center text-on-surface-variant active:bg-surface-bright">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: ms }}>chat</span>
            <span className="font-label-md text-label-md">Chat</span>
          </Link>
          <div className="flex flex-col items-center justify-center text-on-surface-variant active:bg-surface-bright">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: ms }}>storage</span>
            <span className="font-label-md text-label-md">Data</span>
          </div>
          <div className="flex flex-col items-center justify-center text-secondary bg-secondary/10 rounded-xl px-4 py-1">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: msFill }}>book</span>
            <span className="font-label-md text-label-md">Knowledge</span>
          </div>
          <Link href="/mobile/home" className="flex flex-col items-center justify-center text-on-surface-variant active:bg-surface-bright">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: ms }}>person</span>
            <span className="font-label-md text-label-md">Profile</span>
          </Link>
        </nav>

        {/* Footer */}
        <footer className="w-full border-t border-outline-variant/10 bg-surface-container-lowest dark:bg-surface-container-lowest mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center px-lg py-xl max-w-container-max mx-auto gap-md text-outline font-body-sm text-body-sm">
            <p>© 2024 Nexus RAG Platforms Inc.</p>
            <div className="flex gap-md">
              <a className="hover:text-secondary underline transition-all" href="#">Documentation</a>
              <a className="hover:text-secondary underline transition-all" href="#">Status</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
