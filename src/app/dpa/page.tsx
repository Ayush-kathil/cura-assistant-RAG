"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Database, FileText, Clock, Mail } from "lucide-react";

const policies = [
  {
    id: 1,
    icon: FileText,
    title: "Policy Under Review",
    content: "This policy is currently being finalized by our legal and compliance teams. Please check back later for the complete text."
  },
  {
    id: 2,
    icon: Clock,
    title: "Last Updated",
    content: "June 2026"
  },
  {
    id: 3,
    icon: Mail,
    title: "Inquiries",
    content: "For urgent inquiries regarding Data Processing Addendum, please contact our legal team at legal@cura-ai.com."
  }
];

export default function PolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans pb-32">
      <nav className="border-b border-slate-200 py-4 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="font-light text-2xl uppercase tracking-tighter text-slate-900">CURA</Link>
        <Link href="/" className="text-sm font-medium uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors">Return Home &rarr;</Link>
      </nav>
      
      <header className="max-w-4xl mx-auto pt-24 px-8 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-full text-xs font-medium tracking-widest uppercase mb-6"
        >
          <Database className="w-4 h-4" /> Legal & Compliance
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-light tracking-tighter text-slate-900 mb-6"
        >
          Data Processing Addendum
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg text-slate-500 font-light max-w-2xl mx-auto"
        >
          Enterprise-grade agreements for data protection.
        </motion.p>
      </header>

      <main className="max-w-5xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {policies.map((policy, index) => {
            const Icon = policy.icon;
            return (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all group"
              >
                <div className="flex flex-col items-center text-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">{policy.title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-center text-sm">
                  {policy.content}
                </p>
              </motion.div>
            );
          })}
        </div>
      </main>
      
      <footer className="mt-24 py-8 text-center text-sm font-medium text-slate-400">
        &copy; {new Date().getFullYear()} CURA Technologies. All rights reserved.
      </footer>
    </div>
  );
}
