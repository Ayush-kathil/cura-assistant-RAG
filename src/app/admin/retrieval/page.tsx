"use client";

import { useState } from "react";
import { Search, ChevronDown, Network, Sparkles, FileText, ArrowRight } from "lucide-react";

export default function RetrievalDebugger() {
  const [searchQuery, setSearchQuery] = useState("What are the risks in this contract?");
  
  // Static mock data
  const retrievedChunks = [
    { id: 1, text: "...The counterparty shall not be held liable for indirect or consequential damages, including loss of revenue...", score: 0.92, source: "Master_Service_Agreement.pdf" },
    { id: 2, text: "...Termination for convenience requires a 90-day written notice, during which all outstanding invoices must be paid in full...", score: 0.87, source: "Vendor_Contract_2023.pdf" },
    { id: 3, text: "...Indemnification covers all third-party claims arising from gross negligence or willful misconduct...", score: 0.81, source: "Master_Service_Agreement.pdf" }
  ];

  const graphEntities = [
    { entity: "Counterparty Liability", connections: ["Indirect Damages", "Loss of Revenue", "MSA Section 4"] },
    { entity: "Termination Clause", connections: ["90-Day Notice", "Vendor Contract", "Outstanding Invoices"] }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-slate-900 mb-2">Retrieval Debugger</h1>
        <p className="text-slate-500 font-light">Inspect vector search results, reranking scores, and knowledge graph expansions.</p>
      </header>

      {/* Query Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-8 flex items-center gap-2">
        <div className="pl-4">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 p-3"
          placeholder="Enter a query to debug..."
        />
        <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors">
          Debug Query
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Vector Search Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-slate-900">Retrieved Chunks</h2>
            <div className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-wider">
              Top 3 Results
            </div>
          </div>

          <div className="space-y-4">
            {retrievedChunks.map((chunk, idx) => (
              <div key={chunk.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {chunk.source}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Cosine Similarity</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {chunk.score.toFixed(2)}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 font-serif leading-relaxed italic border-l-2 border-slate-100 pl-4">
                  {chunk.text}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Chunk ID: {chunk.id}</span>
                  <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    View full context <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Reranking & Graph */}
        <div className="space-y-8">
          
          {/* Reranking Stats */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-medium text-slate-900">Rerank Pipeline</h2>
            </div>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="text-xs font-bold">1</span>
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-slate-100 bg-slate-50 shadow-sm text-sm">
                  Initial Top-K: 50
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="text-xs font-bold">2</span>
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-blue-50 bg-blue-50 shadow-sm text-sm font-medium text-blue-900">
                  Cross-Encoder Rerank
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="text-xs font-bold">3</span>
                </div>
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-slate-100 bg-slate-50 shadow-sm text-sm">
                  Final Top-K: 3
                </div>
              </div>
            </div>
          </div>

          {/* Graph Results */}
          <div className="bg-slate-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Network className="w-24 h-24 text-blue-400" />
            </div>
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <Network className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-medium text-white">Graph Expansion</h2>
            </div>

            <div className="space-y-6 relative z-10">
              {graphEntities.map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="text-sm font-medium text-blue-300">Entity: {item.entity}</div>
                  <div className="pl-4 border-l border-slate-700 space-y-2">
                    {item.connections.map((conn, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                        {conn}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
