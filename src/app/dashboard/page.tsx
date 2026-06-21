"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { MessageSquare, LayoutDashboard, Database, PlusCircle, User, Zap, Bell, FileText, Download, Activity, FileCheck2, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [docCount, setDocCount] = useState(0);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const { activeWorkspace } = useWorkspace();

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      if (activeWorkspace) {
        const { count } = await supabase.from("documents").select("id", { count: "exact" }).eq("workspace_id", activeWorkspace.id);
        setDocCount(count || 0);

        const { data: docs } = await supabase.from("documents").select("*").eq("workspace_id", activeWorkspace.id).order("created_at", { ascending: false }).limit(3);
        if (docs) setRecentDocs(docs);
      }
    };
    
    fetchStats();
  }, [supabase, activeWorkspace]);

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Guest';

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full z-40 flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 transition-all duration-300">
        <div className="flex items-center gap-3 p-6 mb-4">
          <img src="/bot.jpg" alt="Cura Logo" className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
          <div>
            <h1 className="font-light text-xl tracking-tighter text-slate-900 uppercase">Cura</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Your AI Companion</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/workspace" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-all rounded-xl text-sm font-medium">
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link href="/upload-pro" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 transition-all rounded-xl text-sm font-medium">
            <Database className="w-4 h-4" />
            <span>Resources</span>
          </Link>
        </nav>
        
        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700 capitalize">{firstName}</span>
              <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">Free Plan</span>
            </div>
          </div>
          <Link href="/workspace" className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
            <PlusCircle className="w-4 h-4" />
            New Session
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative overflow-y-auto custom-scrollbar">
        <header className="sticky top-0 z-30 flex justify-between items-center px-8 py-6 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-light text-slate-900 tracking-tight capitalize">Good morning, {firstName}.</h2>
            <p className="text-sm text-slate-500 font-light mt-1">Ready to explore your workspace today?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-full font-medium text-sm">
              <Zap className="w-4 h-4" />
              <span>12 Day Streak</span>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center font-medium text-slate-600 shadow-sm sm:hidden">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <section className="px-8 py-10 grid grid-cols-12 gap-6 max-w-6xl mx-auto w-full">
          {/* Main Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-900/5 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-medium text-slate-900 mb-1 tracking-tight">Workspace Intelligence</h3>
                <p className="text-sm text-slate-500 font-light">Your documents are processed securely and locally.</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-full text-xs font-bold text-blue-700 uppercase tracking-widest transition-colors">All Time</button>
              </div>
            </div>
            
            <div className="relative h-64 w-full bg-slate-50 rounded-2xl overflow-hidden flex items-end px-6 gap-6 border border-slate-100">
               {/* Abstract decorative bar chart */}
              <div className="flex-1 bg-blue-100/50 rounded-t-xl h-[40%] group-hover:bg-blue-100 transition-colors duration-500 delay-75" />
              <div className="flex-1 bg-indigo-100/50 rounded-t-xl h-[60%] group-hover:bg-indigo-100 transition-colors duration-500 delay-100" />
              <div className="flex-1 bg-blue-100/50 rounded-t-xl h-[50%] group-hover:bg-blue-100 transition-colors duration-500 delay-150" />
              <div className="flex-1 bg-purple-100/50 rounded-t-xl h-[80%] group-hover:bg-purple-100 transition-colors duration-500 delay-200" />
              <div className="flex-1 bg-blue-600 text-white rounded-t-xl h-[95%] shadow-[0_0_20px_rgba(37,99,235,0.3)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-700 to-transparent opacity-50" />
              </div>
              <div className="flex-1 bg-indigo-100/50 rounded-t-xl h-[70%] group-hover:bg-indigo-100 transition-colors duration-500 delay-300" />
              <div className="flex-1 bg-blue-100/50 rounded-t-xl h-[45%] group-hover:bg-blue-100 transition-colors duration-500 delay-300" />
            </div>

            <div className="grid grid-cols-3 mt-8 gap-4">
              <div className="flex flex-col p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">Documents</span>
                <span className="text-3xl text-slate-900 font-light">{docCount}</span>
              </div>
              <div className="flex flex-col p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">Total Chats</span>
                <span className="text-3xl text-slate-900 font-light">128</span>
              </div>
              <div className="flex flex-col p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">Health Score</span>
                <span className="text-3xl text-slate-900 font-light">9.4</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Action Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-12 lg:col-span-4 bg-slate-900 text-white rounded-3xl p-8 flex flex-col shadow-xl shadow-slate-900/20 relative overflow-hidden group hover:shadow-2xl transition-all"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/20">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-light tracking-tight mb-4">Deep Focus Mode</h3>
              <p className="text-slate-300 font-light text-sm mb-8 leading-relaxed">Engage Cura in deep reasoning mode to analyze complex document architectures.</p>
              
              <Link href="/workspace" className="mt-auto bg-white text-slate-900 font-medium text-sm px-6 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-lg">
                <HeartPulse className="w-4 h-4 text-blue-600" />
                Initialize Session
              </Link>
            </div>
            <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-blue-600/30 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-colors duration-500" />
            <div className="absolute right-4 top-4 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
              <Zap className="w-32 h-32" />
            </div>
          </motion.div>

          {/* Recent Documents */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-12 bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-200"
          >
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-medium text-slate-900">Recent Uploads</h4>
              <Link href="/upload-pro" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                View All &rarr;
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs font-medium uppercase tracking-widest border-b border-slate-100">
                    <th className="pb-4 pl-2">Document Name</th>
                    <th className="pb-4">Date Uploaded</th>
                    <th className="pb-4 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                  {recentDocs.length > 0 ? recentDocs.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
                      <td className="py-4 pl-2 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <FileCheck2 className="text-blue-600 w-5 h-5" />
                          </div>
                          <span>{doc.file_name || `Document ${doc.id}`}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-500 font-light">{new Date(doc.created_at).toLocaleDateString()}</td>
                      <td className="py-4 text-right pr-2">
                        <button className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-colors inline-flex">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-slate-400 font-light bg-slate-50 rounded-xl">
                        No documents uploaded yet. Head over to Resources to upload your first file.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>
      </main>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around px-4 z-50">
        <Link href="/workspace" className="flex flex-col items-center gap-1 text-slate-500">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold">Chat</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-blue-600">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Dash</span>
        </Link>
        <Link href="/upload-pro" className="flex flex-col items-center gap-1 text-slate-500">
          <Database className="w-5 h-5" />
          <span className="text-[10px] font-bold">Docs</span>
        </Link>
      </nav>
    </div>
  );
}
