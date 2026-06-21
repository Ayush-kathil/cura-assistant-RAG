"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center text-center px-8"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
          className="w-24 h-24 bg-white shadow-xl shadow-blue-900/10 rounded-3xl flex items-center justify-center mb-8 border border-slate-100"
        >
          <Compass className="w-12 h-12 text-blue-500 animate-[spin_4s_linear_infinite]" />
        </motion.div>
        
        <h1 className="text-8xl md:text-9xl font-light tracking-tighter text-slate-900 mb-4">404</h1>
        
        <h2 className="text-2xl md:text-3xl font-medium text-slate-700 mb-6">Page Not Found</h2>
        
        <p className="text-lg text-slate-500 max-w-md mb-12 font-light leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 group rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-3 transform group-hover:-translate-x-1 transition-transform" />
          Return Home
        </Link>
      </motion.div>
    </div>
  );
}
