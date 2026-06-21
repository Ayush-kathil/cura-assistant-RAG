"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    // Simple scroll interaction for the navbar
    const handleScroll = () => {
      const nav = document.getElementById('top-nav');
      if (nav) {
        if (window.scrollY > 20) {
          nav.classList.add('bg-white', 'shadow-md');
          nav.classList.remove('bg-transparent', 'py-6');
          nav.classList.add('py-4');
        } else {
          nav.classList.add('bg-transparent', 'py-6');
          nav.classList.remove('bg-white', 'shadow-md', 'py-4');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white text-black font-sans selection:bg-black selection:text-white min-h-screen">
      {/* Top Navigation */}
      <nav 
        id="top-nav"
        className="fixed top-0 w-full z-50 flex justify-between items-center px-8 md:px-16 transition-all duration-300 bg-transparent py-6"
      >
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-2xl tracking-tighter text-black uppercase">
            Cura
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <Link href="#features" className="text-sm font-semibold tracking-wide uppercase hover:underline underline-offset-4">Platform</Link>
          <Link href="/science" className="text-sm font-semibold tracking-wide uppercase hover:underline underline-offset-4">Science</Link>
          <Link href="/pricing" className="text-sm font-semibold tracking-wide uppercase hover:underline underline-offset-4">Pricing</Link>
          <Link href="/dashboard" className="text-sm font-semibold tracking-wide uppercase hover:underline underline-offset-4">Dashboard</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors">
            Sign In &rarr;
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex flex-col justify-end overflow-hidden pt-32 pb-16 px-8 md:px-16">
          <motion.div 
            style={{ y, opacity }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-black/20 z-10" />
            <img 
              src="/bot.jpg" 
              alt="Cura Bot Companion" 
              className="w-full h-full object-cover object-center grayscale brightness-75 contrast-125"
            />
          </motion.div>

          <div className="relative z-10 flex flex-col justify-end h-full max-w-5xl">
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-[12vw] md:text-[8vw] leading-[0.9] font-bold tracking-tighter text-white mb-6 uppercase"
            >
              Rethink<br/>Companionship.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-2xl text-white/90 max-w-2xl mb-10 font-medium"
            >
              Meet Cura, an intelligent companion engineered to listen, understand, and evolve with you. Deep clinical insight meets raw technological power.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/login" className="inline-flex items-center px-8 py-4 bg-white text-black text-lg font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors group">
                Start Your Journey
                <span className="ml-4 transform group-hover:translate-x-2 transition-transform">&rarr;</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Massive Text Reveal Section */}
        <section className="py-32 md:py-48 px-8 md:px-16 bg-black text-white">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight mb-12">
                TECHNOLOGY THAT FEELS HUMAN.<br/>
                BUILT WITH CLINICAL RIGOR.<br/>
                ENGINEERED FOR EMPATHY.
              </h2>
              <div className="h-px w-full bg-white/20 mb-12"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wider mb-4">Deep Empathy Engine</h3>
                  <p className="text-white/70 text-lg leading-relaxed">
                    Fine-tuned on therapeutic principles, our architecture recognizes emotional nuances to provide precisely targeted, comforting responses.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wider mb-4">Zero-Knowledge Privacy</h3>
                  <p className="text-white/70 text-lg leading-relaxed">
                    Your mental health data is strictly yours. End-to-end encrypted infrastructure ensures absolute confidentiality.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wider mb-4">Adaptive Intelligence</h3>
                  <p className="text-white/70 text-lg leading-relaxed">
                    Cura learns from your interaction patterns, tailoring cognitive exercises and breathing techniques specifically for your physiological state.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="py-32 px-8 md:px-16 bg-gray-100 text-black">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6">Designed to adapt.</h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl">Whether you need immediate crisis intervention or long-term cognitive tracking, Cura provides an unparalleled support ecosystem.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white p-12 flex flex-col justify-between aspect-square"
              >
                <div>
                  <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-widest mb-6">Always On</span>
                  <h3 className="text-4xl font-bold tracking-tight mb-4">Instant 24/7 Availability.</h3>
                  <p className="text-gray-600 text-lg">No waiting rooms. No appointments. Expert-level guidance available at the exact moment you need it.</p>
                </div>
                <div className="mt-8 flex justify-end">
                  <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[32px]">schedule</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-black text-white p-12 flex flex-col justify-between aspect-square"
              >
                <div>
                  <span className="inline-block px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-widest mb-6">Science Backed</span>
                  <h3 className="text-4xl font-bold tracking-tight mb-4">Clinical Foundations.</h3>
                  <p className="text-gray-400 text-lg">Built alongside leading psychologists. Grounded in CBT, DBT, and mindfulness practices.</p>
                </div>
                <div className="mt-8 flex justify-end">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black">
                    <span className="material-symbols-outlined text-[32px]">science</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-32 px-8 md:px-16 bg-white text-black text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase mb-12">Take Control.</h2>
            <Link href="/login" className="inline-flex items-center px-12 py-6 bg-black text-white text-xl font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors group">
              Join Cura Today
              <span className="ml-4 transform group-hover:translate-x-2 transition-transform">&rarr;</span>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-8 md:px-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold tracking-tighter uppercase">CURA</div>
          <div className="flex gap-8 text-sm font-medium uppercase tracking-wider text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Cura Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
