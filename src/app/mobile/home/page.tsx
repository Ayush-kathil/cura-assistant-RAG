"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MobileHome() {
  const [isDark, setIsDark] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-4');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => {
      el.classList.add('transition-all', 'duration-500', 'opacity-0', 'translate-y-4');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`${isDark ? 'dark' : ''} h-full overflow-y-auto overflow-x-hidden`} ref={scrollRef}>
      <style>{`
        .glass-card {
            background: rgba(27, 32, 43, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(144, 143, 160, 0.2);
        }
        .ai-border {
            border-left: 3px solid #4cd7f6;
        }
        .user-border {
            border: 1px solid #c0c1ff;
        }
        .active-nav-pill {
            background: rgba(76, 215, 246, 0.1);
        }
      `}</style>
      
      <div className="bg-background text-on-surface font-body-md selection:bg-primary/30 min-h-full pb-20 transition-colors duration-200">
        {/* TopAppBar */}
        <header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md font-headline-md text-headline-md docked full-width top-0 sticky z-50 border-b border-outline-variant/30">
          <div className="flex justify-between items-center w-full px-lg py-md max-w-container-max mx-auto">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>hub</span>
              <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface dark:text-on-surface">Nexus RAG</span>
            </div>
            <div className="flex items-center gap-md">
              <button 
                onClick={() => setIsDark(!isDark)}
                className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors duration-200 cursor-pointer p-2"
                style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}
              >
                {isDark ? 'light_mode' : 'dark_mode'}
              </button>
              <button className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-xl scale-95 active:scale-90 transition-transform">Launch App</button>
            </div>
          </div>
        </header>

        <main className="max-w-container-max mx-auto px-md pt-lg">
          {/* Hero Section */}
          <section className="relative mb-xl rounded-[40px] overflow-hidden min-h-[320px] flex flex-col justify-center items-center text-center p-lg">
            <div className="absolute inset-0 z-0 opacity-40">
              <img alt="Technical AI visual" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtruSoqWekJhz8Lw6OPILJOzqfU2eqyzrtVY8m5YxW4dqWIngCLhLEAR7fbyjhBcyJyqOhkkKg0DwbcRSSkHbLcFFRgjXI0Oyv4pIFTaAcHbrMOh3fCMlTk9TpeaNRNt4cRu9SBbw3hiNh7UWF3zeziPsPwa6zHd7E5ooQ1Tkyh3ceCwp_V4Le0Vk28pRL3MBtJsYprWCSxOiIw6N767gQh_KLfhNN543YfDefeAft8Aw73UkzOu1vzAKshGVXyte7p5La4FQc6HU" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-10"></div>
            <div className="relative z-20 max-w-2xl">
              <h1 className="font-display-lg text-[32px] md:text-display-lg leading-tight mb-md text-on-surface">Your Data. Your AI. <span className="text-secondary">Instant Answers.</span></h1>
              <p className="font-body-lg text-on-surface-variant mb-lg max-w-md mx-auto">Enterprise-grade retrieval augmented generation for your private knowledge base.</p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <button className="bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-sm">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>bolt</span>
                  Get Started
                </button>
                <button className="border border-outline-variant text-on-surface font-label-md text-label-md px-xl py-md rounded-xl hover:bg-surface-container-high transition-all flex items-center justify-center gap-sm">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>menu_book</span>
                  Documentation
                </button>
              </div>
            </div>
          </section>

          {/* Bento Grid: Stats & Activity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
            {/* Quick Stats Card */}
            <div className="glass-card p-md rounded-xl flex flex-col justify-between min-h-[140px] animate-on-scroll">
              <div className="flex justify-between items-start">
                <span className="text-on-surface-variant font-label-md text-label-md">Indexed Docs</span>
                <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>description</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary">12,842</h3>
                <div className="flex items-center gap-xs mt-xs">
                  <span className="text-body-sm font-body-sm text-secondary">+12% from last week</span>
                </div>
              </div>
              <div className="w-full bg-surface-container-highest h-1 mt-md rounded-full overflow-hidden">
                <div className="bg-secondary h-full shadow-[0_0_8px_rgba(76,215,246,0.6)]" style={{ width: '74%' }}></div>
              </div>
            </div>

            {/* Latency Card */}
            <div className="glass-card p-md rounded-xl flex flex-col justify-between min-h-[140px] animate-on-scroll">
              <div className="flex justify-between items-start">
                <span className="text-on-surface-variant font-label-md text-label-md">Avg. Latency</span>
                <span className="material-symbols-outlined text-tertiary" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>speed</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">142ms</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Optimized vector search</p>
              </div>
              <div className="flex items-end gap-1 h-8 mt-md">
                <div className="bg-primary/40 w-full h-1/2 rounded-t-sm"></div>
                <div className="bg-primary/40 w-full h-3/4 rounded-t-sm"></div>
                <div className="bg-primary w-full h-full rounded-t-sm"></div>
                <div className="bg-primary/40 w-full h-1/3 rounded-t-sm"></div>
                <div className="bg-primary/40 w-full h-2/3 rounded-t-sm"></div>
                <div className="bg-primary/40 w-full h-1/2 rounded-t-sm"></div>
              </div>
            </div>

            {/* Knowledge Health */}
            <div className="glass-card p-md rounded-xl flex flex-col justify-between min-h-[140px] animate-on-scroll">
              <div className="flex justify-between items-start">
                <span className="text-on-surface-variant font-label-md text-label-md">Knowledge Sync</span>
                <span className="material-symbols-outlined text-on-secondary-container" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>sync</span>
              </div>
              <div className="flex items-center gap-md">
                <div className="relative h-12 w-12 flex items-center justify-center">
                  <svg className="h-full w-full rotate-[-90deg]">
                    <circle className="text-surface-container-highest" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                    <circle className="text-secondary" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125" strokeDashoffset="25" strokeWidth="4"></circle>
                  </svg>
                  <span className="absolute text-[10px] font-bold">80%</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">Healthy</h4>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">Last sync: 12m ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <section className="mb-xl">
            <div className="flex items-center justify-between mb-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-sm">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>history</span>
                Recent Activity
              </h2>
              <button className="text-secondary font-label-md text-label-md hover:underline">View All</button>
            </div>
            <div className="space-y-md">
              {/* Activity Item 1 */}
              <div className="bg-surface-container-low ai-border p-md rounded-xl flex flex-col gap-sm animate-on-scroll">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-sm">
                    <div className="bg-secondary/10 p-xs rounded-lg">
                      <span className="material-symbols-outlined text-secondary text-[18px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>smart_toy</span>
                    </div>
                    <span className="font-label-md text-label-md text-secondary">Nexus Assistant</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-mono-code">2m ago</span>
                </div>
                <p className="text-body-md font-body-md text-on-surface">The Q3 revenue projections indicate a 14% growth in the APAC region, primarily driven by SaaS adoption...</p>
                <div className="flex gap-sm">
                  <span className="bg-secondary/10 border border-secondary/20 px-xs py-[2px] rounded text-[10px] font-mono-code text-secondary flex items-center gap-xs">
                    DOC_REF_241 <span className="material-symbols-outlined text-[10px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>open_in_new</span>
                  </span>
                </div>
              </div>
              
              {/* Activity Item 2 */}
              <div className="bg-surface-container-lowest user-border border-primary/20 p-md rounded-xl flex flex-col gap-sm animate-on-scroll">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-sm">
                    <div className="bg-primary/10 p-xs rounded-lg">
                      <span className="material-symbols-outlined text-primary text-[18px]" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>person</span>
                    </div>
                    <span className="font-label-md text-label-md text-primary">You</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-mono-code">15m ago</span>
                </div>
                <p className="text-body-md font-body-md text-on-surface-variant italic">"Summarize the recent financial disclosures for Q3 2024 from the global folder."</p>
              </div>
              
              {/* Activity Item 3 */}
              <div className="bg-surface-container-low p-md rounded-xl flex items-center justify-between border border-outline-variant/10 animate-on-scroll">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>data_object</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">New Data Source Connected</p>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">SharePoint: Engineering Docs</p>
                  </div>
                </div>
                <span className="text-[10px] text-on-surface-variant font-mono-code">1h ago</span>
              </div>
            </div>
          </section>
        </main>

        {/* BottomNavBar */}
        <nav className="bg-surface-container-highest dark:bg-surface-container-highest absolute bottom-0 w-full z-50 border-t border-outline-variant/30 shadow-lg">
          <div className="flex justify-around items-center h-16 px-md">
            <Link href="/mobile/chatbot" className="flex flex-col items-center justify-center text-secondary active-nav-pill rounded-xl px-4 py-1">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>chat</span>
              <span className="font-label-md text-label-md">Chat</span>
            </Link>
            <Link href="/mobile/kb" className="flex flex-col items-center justify-center text-on-surface-variant active:bg-surface-bright">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>storage</span>
              <span className="font-label-md text-label-md">Data</span>
            </Link>
            <div className="flex flex-col items-center justify-center text-on-surface-variant active:bg-surface-bright">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>bar_chart</span>
              <span className="font-label-md text-label-md">Stats</span>
            </div>
            <div className="flex flex-col items-center justify-center text-on-surface-variant active:bg-surface-bright">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>person</span>
              <span className="font-label-md text-label-md">Profile</span>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
