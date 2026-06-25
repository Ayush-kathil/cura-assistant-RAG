"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, FileUp, Webhook, ListTree, FileText, Blocks, BrainCircuit, Share2, CheckCircle2, X } from "lucide-react";

// Node Data Structure
const nodes = [
  { id: 'upload', title: 'Upload UI', x: 150, y: 150, icon: FileUp, desc: 'The journey begins when a user uploads a document. The UI instantly hands off the raw binary data to our secure edge network, ensuring encrypted transit.' },
  { id: 'storage', title: 'Supabase Storage', x: 400, y: 150, icon: Database, desc: 'Raw files are deposited into a secure Supabase storage bucket. A database trigger immediately registers the file metadata in Postgres, queueing it for processing.' },
  { id: 'trigger', title: 'API Trigger', x: 650, y: 150, icon: Webhook, desc: 'A secure webhook is fired to the Next.js backend. We validate the mime-type, user quota, and file integrity before dispatching the heavy lifting.' },
  { id: 'queue', title: 'Inngest Queue', x: 900, y: 150, icon: ListTree, desc: 'The job is enqueued in Inngest, our robust serverless queueing system. This ensures that no matter how many users upload files simultaneously, the system scales smoothly.' },
  { id: 'parsing', title: 'Parsing Worker', x: 900, y: 350, icon: FileText, desc: 'A dedicated serverless worker downloads the file and parses it. Whether it is a PDF, DOCX, or CSV, the parser extracts raw text, preserving formatting.' },
  { id: 'chunking', title: 'Chunking Worker', x: 650, y: 350, icon: Blocks, desc: 'The raw text is sliced into semantically meaningful chunks. We use recursive character splitting with overlap to ensure context isnt lost.' },
  { id: 'ai_extract', title: 'Entity Extraction', x: 400, y: 260, icon: Share2, desc: 'One stream extracts structured entities (people, organizations, concepts) using LLMs to build a knowledge graph.' },
  { id: 'ai_embed', title: 'Embedding Worker', x: 400, y: 440, icon: BrainCircuit, desc: 'The other stream generates dense vector embeddings for semantic similarity search.' },
  { id: 'db_pg', title: 'Postgres DB', x: 150, y: 350, icon: Database, desc: 'The results converge back into Postgres. Embeddings in pgvector, entities in relational tables forming a powerful knowledge graph.' },
  { id: 'ready', title: 'Status: Ready', x: 150, y: 550, icon: CheckCircle2, desc: 'The document is fully ingested. The user can now query the document using our hybrid RAG system.' },
];

// SVG Connection Paths (Orthogonal routing)
const connections = [
  "M 150 150 L 400 150",
  "M 400 150 L 650 150",
  "M 650 150 L 900 150",
  "M 900 150 L 900 350",
  "M 900 350 L 650 350",
  "M 650 350 L 650 260 L 400 260", 
  "M 650 350 L 650 440 L 400 440", 
  "M 400 260 L 150 260 L 150 350", 
  "M 400 440 L 150 440 L 150 350", 
  "M 150 350 L 150 550", 
];

export default function SciencePage() {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const activeNode = nodes.find(n => n.id === activeNodeId);

  return (
    <div className="bg-slate-50 min-h-[100dvh] text-slate-800 font-sans selection:bg-blue-200 selection:text-blue-900 overflow-hidden flex flex-col">
      
      {/* Navigation */}
      <nav className="w-full z-50 border-b border-slate-200 py-4 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md shadow-sm">
        <Link href="/" className="font-light text-2xl uppercase tracking-tighter text-slate-900">CURA</Link>
        <span className="text-sm font-medium tracking-widest text-slate-400 uppercase">Architecture Map</span>
        <Link href="/" className="text-sm font-medium uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors">Return Home &rarr;</Link>
      </nav>
      
      {/* Main Interactive Canvas Area */}
      <main className="flex-grow relative w-full flex flex-col items-center justify-center overflow-x-auto overflow-y-hidden custom-scrollbar py-12">
        
        <div className="text-center mb-8">
            <h1 className="text-2xl md:text-5xl font-light tracking-tighter text-slate-900 mb-4">
              Interactive Architecture
            </h1>
            <p className="text-slate-500 max-w-lg mx-auto">
                Explore the flow of data across our intelligent infrastructure. Click on any module to inspect its underlying function.
            </p>
        </div>

        {/* The 1200x800 Canvas Blueprint */}
        <div 
          className="relative w-[1100px] h-[700px] shrink-0 border border-slate-200 rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-slate-200/50"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1.5px, transparent 1.5px)',
            backgroundSize: '30px 30px'
          }}
        >
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Base faded lines */}
            {connections.map((d, i) => (
              <path key={`base-${i}`} d={d} fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinejoin="round" />
            ))}
            {/* Animated flowing data lines */}
            {connections.map((d, i) => (
              <path 
                key={`anim-${i}`} 
                d={d} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3" 
                strokeLinejoin="round"
                strokeDasharray="12 12"
                className="animate-[flow_20s_linear_infinite]"
                style={{ opacity: 0.8 }}
              />
            ))}
          </svg>

          <style jsx>{`
            @keyframes flow {
              from { stroke-dashoffset: 1000; }
              to { stroke-dashoffset: 0; }
            }
            .custom-scrollbar::-webkit-scrollbar {
              height: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9; 
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1; 
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8; 
            }
          `}</style>

          {/* Render Nodes */}
          {nodes.map(node => {
            const isActive = activeNodeId === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setActiveNodeId(node.id)}
                className={`absolute w-[180px] h-[80px] -ml-[90px] -mt-[40px] rounded-2xl flex items-center gap-3 px-4 transition-all duration-300 z-10 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                  isActive 
                    ? 'bg-blue-600 border-2 border-blue-500 shadow-[0_10px_30px_rgba(37,99,235,0.3)] scale-105' 
                    : 'bg-white border border-slate-200 shadow-md hover:shadow-xl hover:border-blue-300 hover:-translate-y-1'
                }`}
                style={{ left: `${(node.x / 1100) * 100}%`, top: `${(node.y / 700) * 100}%` }}
              >
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-slate-50 text-blue-600'}`}>
                  <node.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>Node</p>
                  <p className={`text-sm font-medium leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>{node.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Details Slide-out Panel */}
      <AnimatePresence>
        {activeNode && (
          <motion.div 
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 max-w-[100vw] w-[400px] h-[100dvh] bg-white/95 backdrop-blur-3xl border-l border-slate-200 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-50 flex flex-col"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                  <activeNode.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-light text-slate-900 tracking-tight">{activeNode.title}</h3>
              </div>
              <button 
                onClick={() => setActiveNodeId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-8">
              <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold tracking-widest uppercase rounded-full border border-blue-100 mb-6">
                Architecture Detail
              </div>
              <p className="text-slate-600 leading-relaxed text-lg font-light">
                {activeNode.desc}
              </p>
              
              <div className="mt-10 p-6 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">Status</p>
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></span>
                  System Operational
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Backdrop overlay when panel is open */}
      <AnimatePresence>
        {activeNode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveNodeId(null)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

    </div>
  );
}
