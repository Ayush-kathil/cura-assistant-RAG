"use client";

import { BrainCircuit, CheckCircle2, AlertTriangle, TrendingDown, Target, Zap } from "lucide-react";

export default function AIAnalytics() {
  // Using static mock data for AI metrics as per the plan
  const metrics = {
    recallAt5: 88,
    recallAt10: 91,
    citationAccuracy: 94,
    hallucinationRate: 3.1,
    avgResponseTime: 1.8,
    failedGenerations: 0.4
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-light tracking-tight text-slate-900 mb-2">AI Analytics Dashboard</h1>
        <p className="text-slate-500 font-light">Deep evaluation metrics for Retrieval-Augmented Generation.</p>
      </header>

      {/* RAG Quality Metrics */}
      <h2 className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-6">Retrieval & Quality</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <h3 className="text-slate-500 font-medium text-sm mb-1">Recall@10</h3>
          <div className="text-3xl font-light text-slate-900 tracking-tight">{metrics.recallAt10}%</div>
          <p className="text-xs text-slate-400 mt-2">Target: &gt;90%</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-slate-500 font-medium text-sm mb-1">Citation Accuracy</h3>
          <div className="text-3xl font-light text-slate-900 tracking-tight">{metrics.citationAccuracy}%</div>
          <p className="text-xs text-slate-400 mt-2">Target: &gt;95%</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <h3 className="text-slate-500 font-medium text-sm mb-1">Hallucination Rate</h3>
          <div className="text-3xl font-light text-slate-900 tracking-tight">{metrics.hallucinationRate}%</div>
          <p className="text-xs text-slate-400 mt-2">Target: &lt;5%</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <h3 className="text-slate-500 font-medium text-sm mb-1">Failed Generations</h3>
          <div className="text-3xl font-light text-slate-900 tracking-tight">{metrics.failedGenerations}%</div>
          <p className="text-xs text-slate-400 mt-2">Target: &lt;1%</p>
        </div>
      </div>

      {/* LLM Performance */}
      <h2 className="text-sm font-bold tracking-widest uppercase text-slate-500 mb-6">LLM Performance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900">Tokens per Day</h3>
              <p className="text-sm text-slate-500">7-day rolling average</p>
            </div>
            <div className="text-2xl font-light text-blue-600">4.2M</div>
          </div>
          {/* Mock Bar Chart */}
          <div className="flex items-end gap-2 h-32 w-full mt-8">
            <div className="bg-blue-100 w-full rounded-t-sm h-[40%] hover:bg-blue-200 transition-colors"></div>
            <div className="bg-blue-100 w-full rounded-t-sm h-[55%] hover:bg-blue-200 transition-colors"></div>
            <div className="bg-blue-100 w-full rounded-t-sm h-[45%] hover:bg-blue-200 transition-colors"></div>
            <div className="bg-blue-100 w-full rounded-t-sm h-[70%] hover:bg-blue-200 transition-colors"></div>
            <div className="bg-blue-100 w-full rounded-t-sm h-[60%] hover:bg-blue-200 transition-colors"></div>
            <div className="bg-blue-500 w-full rounded-t-sm h-[85%] shadow-lg"></div>
            <div className="bg-blue-100 w-full rounded-t-sm h-[50%] hover:bg-blue-200 transition-colors"></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>Mon</span>
            <span>Sun</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900">Average Response Time</h3>
              <p className="text-sm text-slate-500">End-to-end latency</p>
            </div>
            <div className="text-2xl font-light text-emerald-600">{metrics.avgResponseTime}s</div>
          </div>
          {/* Mock Line Chart (Simulated with div) */}
          <div className="relative h-32 w-full mt-8 flex items-center">
            <div className="absolute inset-0 flex items-center justify-between px-2">
               <div className="w-2 h-2 rounded-full bg-emerald-400 z-10" style={{ transform: 'translateY(10px)' }}></div>
               <div className="w-2 h-2 rounded-full bg-emerald-400 z-10" style={{ transform: 'translateY(-5px)' }}></div>
               <div className="w-2 h-2 rounded-full bg-emerald-400 z-10" style={{ transform: 'translateY(15px)' }}></div>
               <div className="w-2 h-2 rounded-full bg-emerald-400 z-10" style={{ transform: 'translateY(-20px)' }}></div>
               <div className="w-2 h-2 rounded-full bg-emerald-400 z-10" style={{ transform: 'translateY(5px)' }}></div>
               <div className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100 z-10" style={{ transform: 'translateY(0px)' }}></div>
            </div>
            {/* SVG line overlay mockup */}
            <svg className="w-full h-full absolute inset-0 text-emerald-200" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,60 L20,45 L40,65 L60,30 L80,55 L100,50" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>00:00</span>
            <span>24:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
