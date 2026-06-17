"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Activity, Database, Zap, AlertTriangle, CheckCircle, BarChart3, Clock, Scale } from 'lucide-react';

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [evals, setEvals] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: mData } = await supabase.from('observability_metrics').select('*').order('created_at', { ascending: false }).limit(50);
      const { data: eData } = await supabase.from('rag_evaluations').select('*').order('created_at', { ascending: false }).limit(50);
      if (mData) setMetrics(mData);
      if (eData) setEvals(eData);
    }
    loadData();
  }, []);

  const avgTTFT = metrics.length ? (metrics.reduce((acc, m) => acc + (m.ttft_ms || 0), 0) / metrics.length).toFixed(0) : 0;
  const avgVectorSearch = metrics.length ? (metrics.reduce((acc, m) => acc + (m.vector_search_ms || 0), 0) / metrics.length).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-500" /> Enterprise RAG Telemetry
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Real-time observability, latency tracing, and LLM-as-a-Judge evaluations.</p>
          </div>
          <div className="flex gap-4">
             <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold flex items-center gap-2 border border-emerald-200">
               <CheckCircle className="w-4 h-4" /> System Healthy
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500"/> Avg TTFT</div>
            <div className="text-4xl font-black text-slate-900">{avgTTFT}<span className="text-lg text-slate-400 ml-1">ms</span></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Database className="w-4 h-4 text-blue-500"/> Vector Search</div>
            <div className="text-4xl font-black text-slate-900">{avgVectorSearch}<span className="text-lg text-slate-400 ml-1">ms</span></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Scale className="w-4 h-4 text-indigo-500"/> Avg Faithfulness</div>
            <div className="text-4xl font-black text-slate-900">{evals.length ? (evals.reduce((a,e) => a + (e.faithfulness_score || 0), 0) / evals.length).toFixed(2) : 'N/A'}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <div className="text-slate-500 font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500"/> Total Queries</div>
            <div className="text-4xl font-black text-slate-900">{metrics.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
               <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Clock className="w-5 h-5 text-slate-400"/> Latency Traces</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-0">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 sticky top-0 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                   <tr>
                     <th className="px-6 py-3">Trace ID</th>
                     <th className="px-6 py-3">Vector MS</th>
                     <th className="px-6 py-3">Rerank MS</th>
                     <th className="px-6 py-3">Tokens</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 font-mono text-xs">
                   {metrics.map(m => (
                     <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 text-slate-900 font-bold truncate max-w-[150px]">{m.id.split('-')[0]}</td>
                       <td className="px-6 py-4 text-blue-600">{m.vector_search_ms || 0}ms</td>
                       <td className="px-6 py-4 text-purple-600">{m.reranker_ms || 0}ms</td>
                       <td className="px-6 py-4 text-slate-500">{m.total_tokens || 0}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
               <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-slate-400"/> Strict Evaluations</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-0">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 sticky top-0 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                   <tr>
                     <th className="px-6 py-3">Score</th>
                     <th className="px-6 py-3">Precision</th>
                     <th className="px-6 py-3">Relevance</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 font-mono text-xs">
                   {evals.map(e => (
                     <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 text-slate-900 font-bold">{e.faithfulness_score?.toFixed(2) || 'N/A'}</td>
                       <td className="px-6 py-4 text-blue-600">{e.context_precision_score?.toFixed(2) || 'N/A'}</td>
                       <td className="px-6 py-4 text-emerald-600">{e.answer_relevance_score?.toFixed(2) || 'N/A'}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
