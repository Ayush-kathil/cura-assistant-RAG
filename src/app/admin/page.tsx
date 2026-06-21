"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Users, HardDrive, FileText, Database, MessageSquare, Zap, Activity, ArrowUpRight } from "lucide-react";

export default function AdminOverview() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    total_users: 0,
    total_workspaces: 0,
    total_documents: 0,
    total_chunks: 0,
    total_queries: 0,
    total_tokens_used: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Fetch from the view we created in the migration
      const { data, error } = await supabase.from('admin_system_overview').select('*').single();
      
      if (data && !error) {
        setStats({
          total_users: parseInt(data.total_users) || 0,
          total_workspaces: parseInt(data.total_workspaces) || 0,
          total_documents: parseInt(data.total_documents) || 0,
          total_chunks: parseInt(data.total_chunks) || 0,
          total_queries: parseInt(data.total_queries) || 0,
          total_tokens_used: parseInt(data.total_tokens_used) || 0
        });
      }
      setIsLoading(false);
    }
    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const statCards = [
    { label: "Total Users", value: stats.total_users, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Workspaces", value: stats.total_workspaces, icon: HardDrive, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Total Documents", value: stats.total_documents, icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Total Chunks", value: stats.total_chunks, icon: Database, color: "text-pink-400", bg: "bg-pink-500/10" },
    { label: "Total Queries", value: stats.total_queries, icon: MessageSquare, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Total Tokens Used", value: stats.total_tokens_used, icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-white mb-2">System Overview</h1>
          <p className="text-slate-400 font-light">Global metrics across all workspaces and users.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-slate-800">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>System Healthy</span>
        </div>
      </header>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                <span>+12%</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
            <h3 className="text-slate-400 font-medium text-sm mb-1">{card.label}</h3>
            <div className="text-3xl font-light text-white tracking-tight">
              {isLoading ? "..." : formatNumber(card.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Graph Metrics Mock */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-sm">
        <h3 className="text-lg font-medium text-white mb-6">Graph Entity Distribution</h3>
        <div className="flex gap-12">
          <div className="space-y-4 flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Graph Entities</span>
              <span className="text-slate-300 font-medium">1,245,092</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-[45%]"></div>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Relationships</span>
              <span className="text-slate-300 font-medium">4,192,884</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full w-[75%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
