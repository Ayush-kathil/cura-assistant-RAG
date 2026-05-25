"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function DashboardPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      const { count } = await supabase.from("documents").select("id", { count: "exact" });
      setDocCount(count || 0);
    };
    
    fetchStats();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#0A0A15] text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          Nexus Dashboard
        </h1>
        <Link href="/workspace" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          Back to Workspace
        </Link>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">
            {user?.email?.[0].toUpperCase() || "U"}
          </div>
          <h2 className="text-xl font-bold mb-2">Profile Details</h2>
          <p className="text-gray-400 mb-1">Email: <span className="text-white">{user?.email}</span></p>
          <p className="text-gray-400">Plan: <span className="text-cyan-400 font-bold">Free Tier</span></p>
          
          <div className="mt-8">
            <Link href="/upload-pro" className="inline-block px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all">
              Upgrade to Pro
            </Link>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all">
          <h2 className="text-xl font-bold mb-4">Knowledge Base Stats</h2>
          <div className="flex items-end gap-4 mb-4">
            <span className="text-5xl font-black text-blue-400">{docCount}</span>
            <span className="text-gray-400 pb-1">PDFs Uploaded</span>
          </div>
          <p className="text-sm text-gray-500">Your documents are securely stored and isolated.</p>
        </div>
      </div>
    </div>
  );
}
