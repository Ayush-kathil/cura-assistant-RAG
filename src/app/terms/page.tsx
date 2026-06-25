"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Book, UserCircle, Database, Server, AlertTriangle, FileText, Ban, Sparkles, Scale, RefreshCcw, Mail } from "lucide-react";

const policies = [
  {
    id: 1,
    icon: Book,
    title: "Acceptance of Terms",
    content: "By accessing or using CURA, you agree to be bound by these Terms of Service. If you do not agree, you may not access the Platform."
  },
  {
    id: 2,
    icon: Sparkles,
    title: "Description of Service",
    content: "CURA is an AI-powered knowledge management and document intelligence platform. It enables uploading documents, searching, generating summaries, and collaborating within workspaces."
  },
  {
    id: 3,
    icon: UserCircle,
    title: "User Accounts",
    content: "You must be at least 13 years old. You are responsible for maintaining account confidentiality and all activities occurring under your account. Provide accurate information."
  },
  {
    id: 4,
    icon: FileText,
    title: "User Content",
    content: "You retain ownership of all uploaded content (documents, PDFs, chat history). You represent that you own the content or have permission, and it does not violate laws or IP rights."
  },
  {
    id: 5,
    icon: Shield,
    title: "AI-Generated Outputs",
    content: "AI outputs may contain inaccuracies. Generated outputs should be independently verified before making professional decisions. CURA does not guarantee output accuracy."
  },
  {
    id: 6,
    icon: Ban,
    title: "Prohibited Uses",
    content: "You agree not to upload malicious software, conduct denial-of-service attacks, reverse engineer the platform, abuse APIs, or generate spam and deceptive content."
  },
  {
    id: 7,
    icon: Database,
    title: "Data Security",
    content: "We implement encryption in transit, workspace isolation, and Row-Level Security (RLS). However, no security system can guarantee absolute protection."
  },
  {
    id: 8,
    icon: Scale,
    title: "Intellectual Property",
    content: "CURA and its underlying architecture are owned by CURA. Users retain ownership of uploaded content and generated work products."
  },
  {
    id: 9,
    icon: Server,
    title: "Service Availability",
    content: "We strive for reliable service but do not guarantee uninterrupted availability. We may modify or suspend portions of the Service at any time."
  },
  {
    id: 10,
    icon: AlertTriangle,
    title: "Limitation of Liability",
    content: "CURA shall not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits or reliance on AI-generated outputs."
  },
  {
    id: 11,
    icon: RefreshCcw,
    title: "Changes & Termination",
    content: "We may update these Terms periodically. We may suspend accounts that violate these terms or present security risks. Continued use constitutes acceptance."
  },
  {
    id: 12,
    icon: Mail,
    title: "Contact",
    content: "Questions regarding these Terms may be directed to support@cura-ai.com."
  }
];

export default function TermsPage() {
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
          <Shield className="w-4 h-4" /> Legal & Compliance
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 mb-6"
        >
          Terms of Service
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
