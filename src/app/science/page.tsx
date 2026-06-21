"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, Database, FileUp, Webhook, ListTree, FileText, Blocks, BrainCircuit, Share2, CheckCircle2 } from "lucide-react";

const FlowNode = ({ icon: Icon, title, delay, shape = "rounded-2xl w-48 py-4 px-4" }: { icon: any, title: string, delay: number, shape?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
    className="flex flex-col items-center group relative z-10"
  >
    <div className={`${shape} bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg shadow-slate-200/50 flex flex-col items-center justify-center gap-3 hover:shadow-xl hover:border-blue-300 transition-all`}>
      <div className="w-10 h-10 shrink-0 rounded-full bg-slate-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-slate-700 text-center leading-tight">{title}</span>
    </div>
  </motion.div>
);

const FlowArrow = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    whileInView={{ opacity: 1, height: "40px" }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay }}
    className="w-px bg-blue-300 flex items-end justify-center relative my-2 z-0"
  >
    <ArrowDown className="w-4 h-4 text-blue-400 absolute -bottom-3" />
  </motion.div>
);

export default function SciencePage() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans pb-32 overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-slate-200 py-4 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="font-light text-2xl uppercase tracking-tighter text-slate-900">CURA</Link>
        <Link href="/" className="text-sm font-medium uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors">Return Home &rarr;</Link>
      </nav>
      
      {/* Header */}
      <header className="max-w-4xl mx-auto pt-24 px-8 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium tracking-widest uppercase mb-6"
        >
          <BrainCircuit className="w-4 h-4" /> The Science
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-light tracking-tighter text-slate-900 mb-6"
        >
          CURA Architecture
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg text-slate-500 font-light max-w-2xl mx-auto leading-relaxed"
        >
          Explore the exact data pipeline that powers our robust document intelligence. 
          Every uploaded file undergoes an intricate transformation process before it's ready for semantic search.
        </motion.p>
      </header>

      {/* Architectural Diagram */}
      <main className="max-w-5xl mx-auto px-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,210,255,0.2)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="flex flex-col items-center py-12 relative z-10">
          
          <FlowNode icon={FileUp} title="File Upload UI" delay={0.1} shape="rounded-[40px_10px_40px_10px] w-48 py-5 px-4" />
          <FlowArrow delay={0.2} />
          
          <FlowNode icon={Database} title="Supabase Storage" delay={0.3} shape="rounded-full w-40 h-40 p-4" />
          <FlowArrow delay={0.4} />

          <FlowNode icon={Webhook} title="API Trigger / Validation" delay={0.5} shape="rounded-[10px_40px_10px_40px] w-48 py-5 px-4" />
          <FlowArrow delay={0.6} />

          <FlowNode icon={ListTree} title="Inngest Queue" delay={0.7} shape="rounded-none w-48 py-5 px-4" />
          <FlowArrow delay={0.8} />

          <FlowNode icon={FileText} title="Parsing Worker" delay={0.9} shape="rounded-[30%_70%_70%_30%/30%_30%_70%_70%] w-48 py-6 px-4" />
          <FlowArrow delay={1.0} />

          <FlowNode icon={Blocks} title="Chunking Worker" delay={1.1} shape="rounded-[50%_50%_10px_10px] w-48 py-6 px-4" />

          {/* Split Path */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex w-64 justify-between relative h-10 mt-2"
          >
            {/* Horizontal connection line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[240px] h-px bg-blue-300" />
            {/* Vertical drop lines */}
            <div className="absolute top-0 left-[20px] w-px h-10 bg-blue-300"><ArrowDown className="w-4 h-4 text-blue-400 absolute -bottom-3 -left-[7px]" /></div>
            <div className="absolute top-0 right-[20px] w-px h-10 bg-blue-300"><ArrowDown className="w-4 h-4 text-blue-400 absolute -bottom-3 -left-[7px]" /></div>
            <div className="absolute top-0 left-1/2 w-px h-full bg-blue-300 -translate-x-1/2 -mt-2" />
          </motion.div>

          {/* Parallel Nodes */}
          <div className="flex gap-12 mt-4">
            <div className="flex flex-col items-center">
              <FlowNode icon={Share2} title="Entity Extraction Worker" delay={1.3} shape="rounded-[20px] w-48 py-5 px-4 rotate-2 hover:rotate-0" />
              <FlowArrow delay={1.4} />
              <FlowNode icon={Database} title="Postgres: Entities/Edges" delay={1.5} shape="rounded-[10px_10px_40px_40px] w-48 py-6 px-4" />
            </div>
            <div className="flex flex-col items-center">
              <FlowNode icon={BrainCircuit} title="Embedding Worker" delay={1.3} shape="rounded-[20px] w-48 py-5 px-4 -rotate-2 hover:rotate-0" />
              <FlowArrow delay={1.4} />
              <FlowNode icon={Database} title="Postgres: pgvector" delay={1.5} shape="rounded-[10px_10px_40px_40px] w-48 py-6 px-4" />
            </div>
          </div>

          {/* Merge Path */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="flex w-64 justify-between relative h-10 mt-2 mb-4"
          >
            {/* Horizontal connection line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[240px] h-px bg-blue-300" />
            {/* Vertical drop lines from nodes */}
            <div className="absolute top-0 left-[20px] w-px h-10 bg-blue-300" />
            <div className="absolute top-0 right-[20px] w-px h-10 bg-blue-300" />
            {/* Vertical drop line to final node */}
            <div className="absolute bottom-[-16px] left-1/2 w-px h-4 bg-blue-300 -translate-x-1/2"><ArrowDown className="w-4 h-4 text-blue-400 absolute bottom-[-10px] -left-[7px]" /></div>
          </motion.div>

          <FlowNode icon={CheckCircle2} title="Status: Completed" delay={1.7} shape="rounded-[50px] border-emerald-300 shadow-emerald-200/50 w-48 py-5 px-4" />

        </div>
      </main>
      
      <footer className="mt-24 py-8 text-center text-sm font-medium text-slate-400">
        &copy; {new Date().getFullYear()} CURA Technologies. All rights reserved.
      </footer>
    </div>
  );
}
