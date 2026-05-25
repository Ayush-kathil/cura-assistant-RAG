"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="selection:bg-primary selection:text-on-primary-container overflow-x-hidden bg-background text-on-surface font-body-md min-h-screen">
      <header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md docked full-width top-0 sticky z-50 border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-lg py-md max-w-container-max mx-auto">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-[32px]">hub</span>
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface dark:text-on-surface font-sans">Cura</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-lg">
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200">Features</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200">Pricing</a>
            <a href="#docs" onClick={(e) => { e.preventDefault(); document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' }); }} className="font-label-md text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200">Docs</a>
          </nav>
          
          <div className="flex items-center gap-md">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">dark_mode</button>
            <button 
              onClick={() => router.push('/workspace')}
              className="bg-primary text-on-primary-container px-lg py-sm rounded-lg font-label-md text-label-md font-bold scale-95 active:scale-90 transition-transform"
            >
              Launch App
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-xl pb-32 overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]"></div>
            <div className="absolute top-1/2 -left-1/4 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px]"></div>
          </div>
          
          <div className="relative z-10 max-w-container-max mx-auto px-lg text-center">
            <div className="inline-flex items-center gap-xs px-sm py-xs bg-surface-container rounded-full border border-outline-variant/30 mb-lg">
              <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label-md text-label-md text-secondary uppercase tracking-widest">Now in Enterprise Beta</span>
            </div>
            <h1 className="font-display-lg text-display-lg max-w-4xl mx-auto mb-md bg-gradient-to-b from-on-surface to-on-surface-variant bg-clip-text text-transparent font-sans">
              Your Data. Your AI. Instant Answers.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-xl font-sans">
              Connect your entire knowledge base in minutes. Cura transforms fragmented documents into a high-performance, private intelligence engine.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-md mb-24">
              <button onClick={() => router.push('/login')} className="w-full sm:w-auto bg-primary text-on-primary-container px-xl py-md rounded-xl font-headline-sm text-headline-sm shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                Start Free
              </button>
              <button className="w-full sm:w-auto border border-outline-variant bg-surface-container/50 px-xl py-md rounded-xl font-headline-sm text-headline-sm hover:bg-surface-container transition-all">
                Book Demo
              </button>
            </div>
            
            <div className="relative max-w-5xl mx-auto">
              <div className="glass-card bg-surface-container-low/70 backdrop-blur-xl border border-outline-variant/20 rounded-2xl p-sm shadow-2xl">
                <div className="bg-surface-container-lowest rounded-xl overflow-hidden aspect-video relative group">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbU4rGuir8bk8CpZSz4mZWZ71L7z7sHR038VeNDd_gdHLZjjkdDD3E006V27ynVkQsHeUfGiq7A7HKCS594zYVJjbcvQSrBLu-MYgetoDixZvO1zbqdKZ0_v9YBuR0US-cYkGF293AEmldwqXs9ZO3GnsdMV-o2XLv0FYTMOI9inbSr6TJmOzy1-CtxGYV1dRTTN30Mfr120e_j9-JWB30Anf4riALZAnkhSmwv_h7uGHN0iBqScM9LXGLujqaTyVtIYQiInIMdPA" alt="Dashboard UI Mockup" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent flex items-end p-xl">
                    <div className="bg-surface-container border border-primary/30 p-md rounded-xl w-full max-w-md text-left shadow-2xl animate-bounce">
                      <div className="flex items-center gap-sm mb-xs whitespace-nowrap">
                        <span className="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
                        <span className="font-mono-code text-mono-code text-secondary">RETRIEVING FROM DOCS...</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface">"According to the Q3 compliance PDF, our retention policy is 7 years for structured data..."</p>
                      <div className="mt-sm flex gap-xs">
                        <span className="px-xs py-1 bg-secondary/10 border border-secondary/20 rounded text-[10px] text-secondary font-bold">compliance_v2.pdf:42</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-xl max-w-container-max mx-auto px-lg">
          <div className="text-center mb-xl">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-sm">Engineered for Technical Precision</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">The architecture of a sovereign RAG platform.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-md auto-rows-[240px]">
            <div className="md:col-span-8 glass-card bg-surface-container-low/70 border border-outline-variant/20 rounded-2xl p-lg flex flex-col justify-between group overflow-hidden relative">
              <div className="relative z-10">
                <span className="material-symbols-outlined text-primary mb-md text-[40px]">search_spark</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Hybrid Vector Search</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">Combines keyword BM25 with dense vector embeddings for 99.9% retrieval accuracy across multi-modal data sets.</p>
              </div>
              <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEFCpI9IOTRoHi2BiTwvTv1TDjTebDcuMNtBs1zQ2HFwlyW4MaylMzOQPJ37YnqGeoXwBgMAng5Z5k1msFGGZxQ7WdKDFYT1N3DFMlkcufka7OADE8Q23j8tYWg0US4xKy0fBykCBY5lOlaQquZCJK5kP3k-T9aTQYt0XDUjNy9Wi4jxu3qx-z68yhi4vtuWNsRttiMYOx91qBg4pYHPG26vW9QZWJrZ5HBMeHWVTeyMOnG6l73XFjahBw96WcwQQft-5uZbBLf5A" alt="Data cluster" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <div className="md:col-span-4 bg-surface-container rounded-2xl p-lg border border-outline-variant/30 flex flex-col items-center text-center justify-center">
              <div className="grid grid-cols-3 gap-sm mb-md">
                <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
                </div>
                <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center border border-outline-variant/30">
                  <span className="material-symbols-outlined text-secondary">description</span>
                </div>
                <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center border border-outline-variant/30">
                  <span className="material-symbols-outlined text-tertiary">database</span>
                </div>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Universal Ingestion</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">PDF, Notion, Docs, or SQL. We parse it all.</p>
            </div>
            
            <div className="md:col-span-4 bg-surface-container rounded-2xl p-lg border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-xs mb-md">
                  <span className="px-xs py-1 bg-secondary/10 border border-secondary/20 rounded text-[10px] text-secondary font-bold">SOURCE:DOC_7</span>
                  <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Citation Tracking</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Never trust an LLM blindly. Every word is anchored to your specific ground-truth documents.</p>
              </div>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-3/4 shadow-[0_0_8px_rgba(76,215,246,0.5)]"></div>
              </div>
            </div>
            
            <div className="md:col-span-8 glass-card bg-surface-container-low/70 border border-outline-variant/20 rounded-2xl p-lg flex items-center gap-lg">
              <div className="hidden sm:block w-32 h-32 flex-shrink-0 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <div className="relative bg-surface-container rounded-full w-full h-full flex items-center justify-center border border-primary/50">
                  <span className="material-symbols-outlined text-primary text-[48px]">admin_panel_settings</span>
                </div>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Enterprise-Grade RBAC</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Granular access controls integrated with your existing SSO. Ensure data is only retrieved by users with proper clearance levels.</p>
                <div className="mt-md flex gap-sm">
                  <span className="font-mono-code text-[10px] bg-outline-variant/20 px-xs py-1 rounded">SAMLv2</span>
                  <span className="font-mono-code text-[10px] bg-outline-variant/20 px-xs py-1 rounded">OAuth</span>
                  <span className="font-mono-code text-[10px] bg-outline-variant/20 px-xs py-1 rounded">SCIM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="docs" className="py-xl bg-surface-container-low">
          <div className="max-w-container-max mx-auto px-lg grid grid-cols-2 md:grid-cols-4 gap-lg text-center">
            <div>
              <div className="font-display-lg text-display-lg text-primary mb-xs">200ms</div>
              <div className="font-label-md text-label-md text-on-surface-variant uppercase">P99 Latency</div>
            </div>
            <div>
              <div className="font-display-lg text-display-lg text-secondary mb-xs">50M+</div>
              <div className="font-label-md text-label-md text-on-surface-variant uppercase">Chunks Indexed</div>
            </div>
            <div>
              <div className="font-display-lg text-display-lg text-on-surface mb-xs">SOC2</div>
              <div className="font-label-md text-label-md text-on-surface-variant uppercase">Compliance Ready</div>
            </div>
            <div>
              <div className="font-display-lg text-display-lg text-tertiary mb-xs">100%</div>
              <div className="font-label-md text-label-md text-on-surface-variant uppercase">Private Cloud</div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-32 px-lg">
          <div className="max-w-4xl mx-auto glass-card bg-surface-container-low/70 rounded-[2rem] p-12 text-center border border-primary/20 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="font-display-lg text-display-lg text-on-surface mb-md font-sans">Ready to unlock your organization's hive mind?</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-xl mx-auto font-sans">Join 500+ enterprises optimizing their workflows with the Cura engine.</p>
              <button onClick={() => router.push('/login')} className="bg-primary text-on-primary-container px-xl py-md rounded-xl font-headline-sm text-headline-sm hover:scale-105 transition-transform font-sans">
                Create Your Workspace
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-outline-variant/10 bg-surface-container-lowest dark:bg-surface-container-lowest">
        <div className="flex flex-col md:flex-row justify-between items-center px-lg py-xl max-w-container-max mx-auto gap-md">
          <div className="flex flex-col items-center md:items-start gap-xs">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">hub</span>
              <span className="font-headline-sm text-headline-sm text-on-surface-variant font-sans">Cura</span>
            </div>
            <p className="font-body-sm text-body-sm text-outline font-sans">© 2024 Cura Platforms Inc.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-lg">
            <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary underline transition-all">Documentation</a>
            <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary underline transition-all">API Reference</a>
            <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary underline transition-all">Status</a>
            <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary underline transition-all">Terms of Service</a>
          </div>
          
          <div className="flex gap-md">
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
            </a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
