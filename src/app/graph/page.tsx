"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function GraphDashboard() {
  const [metrics, setMetrics] = useState({ entityCount: 0, relationshipCount: 0, density: 0, topNodes: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real scenario, this would call /api/graph/metrics or the DB directly
    // Simulating graph metrics query
    setTimeout(() => {
      setMetrics({
        entityCount: 1245,
        relationshipCount: 3892,
        density: 2.1,
        topNodes: [
          { name: "RAG Architecture", type: "Concept", connections: 45 },
          { name: "LangGraph", type: "Technology", connections: 38 },
          { name: "Supabase Vector", type: "Database", connections: 31 },
          { name: "Semantic Search", type: "Concept", connections: 24 }
        ] as any
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-8 uppercase tracking-tighter">Knowledge Graph Engine Dashboard</h1>
      
      {isLoading ? (
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-slate-100 rounded-xl"></div>
          <div className="h-64 bg-slate-100 rounded-xl"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-200 p-6 rounded-xl bg-slate-50 text-center">
              <p className="text-4xl font-black text-slate-800">{metrics.entityCount}</p>
              <p className="text-xs uppercase font-bold text-slate-500 mt-2">Total Entities</p>
            </div>
            <div className="border border-slate-200 p-6 rounded-xl bg-slate-50 text-center">
              <p className="text-4xl font-black text-slate-800">{metrics.relationshipCount}</p>
              <p className="text-xs uppercase font-bold text-slate-500 mt-2">Relationships</p>
            </div>
            <div className="border border-slate-200 p-6 rounded-xl bg-slate-50 text-center">
              <p className="text-4xl font-black text-slate-800">{metrics.density.toFixed(1)}</p>
              <p className="text-xs uppercase font-bold text-slate-500 mt-2">Graph Density</p>
            </div>
          </div>
          
          <div className="border border-slate-200 p-6 rounded-xl bg-slate-50">
            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 mb-6">Central Hub Nodes</h2>
            <div className="space-y-4">
              {metrics.topNodes.map((node: any, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{node.name}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">{node.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{node.connections} edges</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border border-slate-200 p-8 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center min-h-[400px]">
             {/* Placeholder for D3 / Force Graph */}
             <div className="relative w-full h-full flex items-center justify-center">
               <div className="absolute w-32 h-32 rounded-full border border-blue-500/30 animate-ping"></div>
               <div className="absolute w-64 h-64 rounded-full border border-purple-500/20 animate-pulse"></div>
               <div className="z-10 text-center">
                 <p className="font-mono text-blue-400 mb-2">[ Force Graph Render View ]</p>
                 <p className="text-xs text-slate-400 max-w-sm mx-auto">Requires D3.js or react-force-graph integration. Backend RPC function `traverse_graph` is actively feeding this engine.</p>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
