"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Database, Lock, EyeOff, Globe, Clock, UserCheck, HardDrive, Trash2, ShieldAlert } from "lucide-react";

const policies = [
  {
    id: 1,
    icon: Database,
    title: "Information We Collect",
    content: "We collect account information (name, email), user content (documents, chat history, vectors), and technical metadata (IP address, usage logs) to provide and improve the service."
  },
  {
    id: 2,
    icon: EyeOff,
    title: "How We Use Information",
    content: "We use data exclusively to provide AI-powered search, generate summaries, maintain workspace isolation, and secure accounts against fraud."
  },
  {
    id: 3,
    icon: Shield,
    title: "AI Processing",
    content: "Documents are processed into vector embeddings. We do not use customer documents to train proprietary foundation models unless explicitly disclosed and consented to."
  },
  {
    id: 4,
    icon: HardDrive,
    title: "Data Storage",
    content: "Information is stored in secure application databases, vector indexes, and encrypted backups with commercially reasonable safeguards."
  },
  {
    id: 5,
    icon: Lock,
    title: "Data Sharing",
    content: "We do not sell personal information. We only share data with strict infrastructure and AI model sub-processors, or when legally required by authorities."
  },
  {
    id: 6,
    icon: Clock,
    title: "Data Retention",
    content: "We retain data only as long as necessary. Upon account deletion, all documents, embeddings, and chat history are permanently removed according to our retention schedule."
  },
  {
    id: 7,
    icon: UserCheck,
    title: "User Rights",
    content: "Depending on your jurisdiction, you have the right to access, export, correct, delete, or restrict processing of your personal information."
  },
  {
    id: 8,
    icon: ShieldAlert,
    title: "Security Measures",
    content: "We implement TLS encryption, encrypted storage, rigorous authentication controls, Workspace isolation, and database Row-Level Security (RLS)."
  },
  {
    id: 9,
    icon: Globe,
    title: "International Transfers",
    content: "Information may be processed outside your jurisdiction where our service providers operate. Appropriate safeguards are applied where legally required."
  },
  {
    id: 10,
    icon: Trash2,
    title: "Children's Privacy",
    content: "CURA is not intended for children under 13. We do not knowingly collect or maintain personal information from anyone under the age of 13."
  }
];

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans pb-32">
      {/* Navigation */}
      <nav className="border-b border-slate-200 py-4 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="font-black text-2xl uppercase tracking-tighter text-slate-900">CURA</Link>
        <Link href="/" className="text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors">Return Home &rarr;</Link>
      </nav>
      
      {/* Header */}
      <header className="max-w-4xl mx-auto pt-24 px-8 text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
        >
          <Lock className="w-4 h-4" /> Data Protection
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-6"
        >
          Privacy Policy
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg text-slate-500 font-medium"
        >
          Last Updated: June 2026
        </motion.p>
      </header>

      {/* Structured Verified UI */}
      <main className="max-w-5xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{policy.title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
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
