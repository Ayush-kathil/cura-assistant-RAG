"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function DashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [docCount, setDocCount] = useState(0);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      const { count } = await supabase.from("documents").select("id", { count: "exact" });
      setDocCount(count || 0);

      const { data: docs } = await supabase.from("documents").select("*").order("created_at", { ascending: false }).limit(3);
      if (docs) setRecentDocs(docs);
    };
    
    fetchStats();
  }, [supabase]);

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Guest';

  return (
    <div className="font-body-md text-body-md bg-[#f9f9ff] text-[#111c2c] min-h-screen flex overflow-x-hidden">
      {/* SideNavBar */}
      <aside className="fixed left-0 top-0 h-full z-40 flex flex-col p-4 bg-white border-r border-gray-200 w-64 shadow-lg shadow-primary/5 transition-all duration-300 ease-in-out">
        <div className="flex flex-col gap-6 h-full">
          <div className="px-2 pt-4">
            <h1 className="font-headline-md text-headline-md text-primary font-bold">Cura AI</h1>
            <p className="font-label-sm text-label-sm text-gray-500">Your friendly companion</p>
          </div>
          <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-gray-800 capitalize">{firstName}</span>
              <span className="text-[10px] uppercase tracking-wider text-primary font-bold">Free Plan</span>
            </div>
          </div>
          <nav className="flex-1 flex flex-col gap-2 mt-4">
            <Link href="/workspace" className="flex items-center gap-3 px-4 py-3 bg-[#e7eeff] text-[#005870] rounded-xl transition-all duration-300 ease-in-out font-bold">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>chat_bubble</span>
              <span className="font-label-md">Chat</span>
            </Link>
            <Link href="/upload-pro" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-all duration-300 ease-in-out">
              <span className="material-symbols-outlined">upload_file</span>
              <span className="font-label-md">Upload Data</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-all duration-300 ease-in-out">
              <span className="material-symbols-outlined">mood</span>
              <span className="font-label-md">Mood Log</span>
            </Link>
          </nav>
          <Link href="/workspace" className="mt-auto flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-transform">
            <span className="material-symbols-outlined">add</span>
            <span className="font-label-md">New Conversation</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="flex justify-between items-center px-10 py-8">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary capitalize">Good morning, {firstName}.</h2>
            <p className="font-body-lg text-body-lg text-gray-500">Ready to check in on your well-being today?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#b8e8ee] text-[#3b6a6f] px-4 py-2 rounded-full font-bold">
              <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
              <span className="font-label-md">12 Day Streak</span>
            </div>
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-500">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        {/* Bento Grid Dashboard */}
        <section className="px-10 pb-10 grid grid-cols-12 gap-6">
          {/* Main Stats */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-8 flex flex-col justify-between shadow-[0_20px_25px_-5px_rgba(12,103,128,0.05)] hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-1">Knowledge Base Stats</h3>
                <p className="font-label-sm text-gray-500">Your documents are securely stored and isolated.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-50 rounded-full font-label-sm text-primary">All Time</button>
              </div>
            </div>
            
            <div className="relative h-64 w-full bg-gray-50 rounded-lg overflow-hidden flex items-end px-4 gap-4">
               {/* Abstract decorative bar chart */}
              <div className="flex-1 bg-[#baeaff]/40 rounded-t-lg h-[40%]"></div>
              <div className="flex-1 bg-[#baeaff]/50 rounded-t-lg h-[60%]"></div>
              <div className="flex-1 bg-[#baeaff]/40 rounded-t-lg h-[50%]"></div>
              <div className="flex-1 bg-[#baeaff]/60 rounded-t-lg h-[80%]"></div>
              <div className="flex-1 bg-primary text-white rounded-t-lg h-[95%] shadow-[0_0_15px_rgba(135,206,235,0.4)]"></div>
              <div className="flex-1 bg-[#baeaff]/50 rounded-t-lg h-[70%]"></div>
              <div className="flex-1 bg-[#baeaff]/30 rounded-t-lg h-[45%]"></div>
            </div>

            <div className="grid grid-cols-3 mt-8 gap-4">
              <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-label-sm text-gray-500 mb-1">PDFs Uploaded</span>
                <span className="font-headline-md text-primary font-bold">{docCount}</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-label-sm text-gray-500 mb-1">Total Chats</span>
                <span className="font-headline-md text-primary font-bold">128</span>
              </div>
              <div className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-label-sm text-gray-500 mb-1">Mood Score</span>
                <span className="font-headline-md text-primary font-bold">8.4</span>
              </div>
            </div>
          </div>

          {/* Quick Action Card */}
          <div className="col-span-12 lg:col-span-4 bg-primary text-white rounded-2xl p-8 flex flex-col shadow-xl shadow-primary/20 relative overflow-hidden hover:-translate-y-1 transition-all">
            <div className="relative z-10">
              <h3 className="font-headline-md text-headline-md mb-4 font-bold">Feeling overwhelmed?</h3>
              <p className="font-body-md opacity-90 mb-8">Take a 2-minute guided breathing session with Cura to recalibrate.</p>
              <button className="bg-white text-primary font-bold px-8 py-4 rounded-full flex items-center gap-2 hover:scale-105 transition-all shadow-md">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>spa</span>
                Start Session
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute right-4 top-4 opacity-30">
              <span className="material-symbols-outlined text-[120px]">psychology</span>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="col-span-12 glass-card rounded-2xl p-8 bg-white shadow-[0_20px_25px_-5px_rgba(12,103,128,0.05)] border border-gray-100 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-label-md text-primary uppercase tracking-widest font-bold">Recent Uploads</h4>
              <Link href="/upload-pro" className="text-primary font-label-sm flex items-center gap-1 hover:underline font-bold">
                View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
            
            <div className="overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 font-label-sm border-b border-gray-100">
                    <th className="pb-4 font-semibold uppercase">Document Name</th>
                    <th className="pb-4 font-semibold uppercase">Date Uploaded</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-gray-800">
                  {recentDocs.length > 0 ? recentDocs.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0">
                      <td className="py-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#b8e8ee] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#37656b] text-[18px]">article</span>
                          </div>
                          <span>{doc.name || `Document ${doc.id}`}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                      <td className="py-4 text-right">
                        <button className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200">
                          <span className="material-symbols-outlined text-primary">download</span>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500 italic">No documents uploaded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
