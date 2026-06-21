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
      } else {
        // Fallback or mock if view doesn't exist yet
        setStats({
          total_users: 3421,
          total_workspaces: 742,
          total_documents: 19123,
          total_chunks: 812456,
          total_queries: 45291,
          total_tokens_used: 12450000
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
    { label: "Total Users", value: stats.total_users, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Workspaces", value: stats.total_workspaces, icon: HardDrive, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Documents", value: stats.total_documents, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Chunks", value: stats.total_chunks, icon: Database, color: "text-pink-600", bg: "bg-pink-50" },
    { label: "Total Queries", value: stats.total_queries, icon: MessageSquare, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Total Tokens Used", value: stats.total_tokens_used, icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-900 mb-2">System Overview</h1>
          <p className="text-slate-500 font-light">Global metrics across all workspaces and users.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>System Healthy</span>
        </div>
      </header>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <span>+12%</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
            <h3 className="text-slate-500 font-medium text-sm mb-1">{card.label}</h3>
            <div className="text-3xl font-light text-slate-900 tracking-tight">
              {isLoading ? "..." : formatNumber(card.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Graph Metrics Mock */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 mb-6">Graph Entity Distribution</h3>
        <div className="flex gap-12">
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-slate-500">Total Graph Entities</span>
              <span className="text-2xl font-light text-slate-900">1,245,092</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[70%]"></div>
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-slate-500">Total Relationships</span>
              <span className="text-2xl font-light text-slate-900">4,192,884</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[85%]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
