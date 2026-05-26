"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="bg-[#FAFCFF] min-h-screen text-slate-900 font-sans selection:bg-blue-200">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <img src="/mobile-assets/curio.png" alt="Curio AI" className="w-8 h-8 object-contain" />
             <span className="font-bold text-xl tracking-tight text-slate-900">Curio AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
            <Link href="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 min-w-0 w-full text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Meet your new intelligent assistant
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              Say hello to <span className="text-blue-500">Curio.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-slate-600 mb-10 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium"
            >
              Curio is a friendly, intelligent assistant designed to help you organize your life, study smarter, and generate creative ideas in an instant.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-base font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                Start Chatting <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 w-full relative flex justify-center items-center"
          >
             <div className="absolute w-[80%] max-w-[300px] aspect-square bg-blue-400/20 blur-[100px] rounded-full"></div>
             <img src="/mobile-assets/curio.png" alt="Curio Robot 3D" className="w-full max-w-[400px] h-auto object-contain animate-bounce drop-shadow-2xl relative z-10" style={{ animationDuration: '4s' }} />
          </motion.div>

        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 tracking-tight">Everything you need.</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">Curio combines powerful AI with a beautiful, friendly interface that works perfectly across all your devices.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#FAFCFF] border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-blue-600 text-[24px]">chat_bubble</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Natural Conversations</h3>
              <p className="text-slate-600 leading-relaxed text-sm">Talk to Curio like a human. It understands context, remembers your history, and provides insightful answers.</p>
            </div>

            <div className="bg-[#FAFCFF] border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-green-600 text-[24px]">palette</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Image Generation</h3>
              <p className="text-slate-600 leading-relaxed text-sm">Describe what you want to see, and Curio will generate stunning images instantly using advanced generative models.</p>
            </div>

            <div className="bg-[#FAFCFF] border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-purple-600 text-[24px]">devices</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Works Everywhere</h3>
              <p className="text-slate-600 leading-relaxed text-sm">Whether you are on your laptop or mobile phone, Curio adapts seamlessly to provide the best possible experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200 text-center text-slate-500 text-sm font-medium">
        <p>© 2024 Curio AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
