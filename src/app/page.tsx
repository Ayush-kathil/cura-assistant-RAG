"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { RotatingWheel } from "@/components/animations/RotatingWheel";
function FadeInWhenVisible({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedWord({ word, progress, start, end }: { word: string, progress: any, start: number, end: number }) {
  const filter = useTransform(progress, [start, end], ["contrast(20%) brightness(60%) opacity(30%)", "contrast(100%) brightness(100%) opacity(100%)"]);
  return (
    <motion.span style={{ filter }} className="drop-shadow-2xl inline-block">
      {word}
    </motion.span>
  );
}

function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"]
  });

  const borderRadius = useTransform(scrollYProgress, [0, 0.6, 1], ["0%", "0%", "50%"]);
  const scale = useTransform(scrollYProgress, [0, 0.6, 1], [0.9, 0.9, 1]);

  return (
    <motion.section 
      ref={ref}
      style={{ borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
      className="py-40 px-8 md:px-16 bg-blue-600 text-white text-center relative overflow-hidden flex flex-col items-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      <motion.div style={{ scale }} className="max-w-4xl mx-auto relative z-10 w-full flex flex-col items-center">
        <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter mb-10 flex justify-center gap-x-3 gap-y-2 flex-wrap text-white">
          {"Experience the difference.".split(" ").map((word, i) => (
            <AnimatedWord 
              key={i} 
              word={word} 
              progress={scrollYProgress} 
              start={0.6 + (i * 0.12)} 
              end={0.6 + (i * 0.12) + 0.12} 
            />
          ))}
        </h2>
        <Link href="/login" className="inline-flex items-center px-10 py-5 bg-white text-blue-600 text-lg font-medium uppercase tracking-widest hover:bg-blue-50 transition-all hover:scale-105 shadow-2xl rounded-full">
          Get Started for Free
          <span className="ml-4">&rarr;</span>
        </Link>
      </motion.div>
    </motion.section>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById('top-nav');
      if (nav) {
        if (window.scrollY > 20) {
          nav.classList.add('bg-white/80', 'backdrop-blur-xl', 'shadow-sm', 'border-slate-200');
          nav.classList.remove('bg-transparent', 'border-transparent', 'py-6', 'mx-0', 'w-full', 'top-0', 'rounded-none');
          nav.classList.add('py-4', 'mx-4', 'w-[calc(100%-2rem)]', 'top-4', 'rounded-full');
        } else {
          nav.classList.add('bg-transparent', 'border-transparent', 'py-6', 'mx-0', 'w-full', 'top-0', 'rounded-none');
          nav.classList.remove('bg-white/80', 'backdrop-blur-xl', 'shadow-sm', 'border-slate-200', 'py-4', 'mx-4', 'w-[calc(100%-2rem)]', 'top-4', 'rounded-full');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 min-h-[100dvh]">
      {/* Top Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        id="top-nav"
        className="fixed top-0 w-full z-50 flex justify-between items-center px-8 md:px-16 transition-all duration-500 bg-transparent py-6 border border-transparent text-slate-800"
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/bot.jpg" alt="Cura Logo" className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-sm group-hover:scale-105 transition-transform" />
            <span className="font-light text-2xl tracking-tighter text-slate-900 uppercase">
              Cura
            </span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <Link href="#history" className="text-sm font-medium tracking-wide uppercase hover:text-blue-600 transition-colors">History of RAG</Link>
          <Link href="/science" className="text-sm font-medium tracking-wide uppercase hover:text-blue-600 transition-colors">Science</Link>
          <Link href="/pricing" className="text-sm font-medium tracking-wide uppercase hover:text-blue-600 transition-colors">Pricing</Link>
          <Link href="/dashboard" className="text-sm font-medium tracking-wide uppercase hover:text-blue-600 transition-colors">Dashboard</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-6 py-3 bg-blue-600 text-white text-sm font-medium uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all rounded-full duration-300">
            Sign In &rarr;
          </Link>
        </div>
      </motion.nav>

      <main>
        {/* Hero Section with Centered Text and Video Background */}
        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
          
          {/* Background Video (Lottie iframe mimicking video) */}
          <motion.div 
            style={{ y, opacity }}
            className="absolute inset-0 z-0 w-full h-full pointer-events-none flex items-center justify-center scale-150 md:scale-125 lg:scale-110"
          >
            <iframe 
              src="https://lottie.host/embed/84120371-29eb-4a16-bd0e-117565bc93cd/Zc9h6Jg11t.json" 
              className="w-full h-full min-w-[100vw] min-h-[100vh] border-none"
              title="Background Robot"
            />
          </motion.div>

          {/* Frosted Glass Overlay to ensure text readability */}
          <div className="absolute inset-0 z-0 bg-white/70 backdrop-blur-[2px]" />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/90 via-transparent to-white" />

          {/* Centered Content */}
          <div className="relative z-10 w-full px-8 flex flex-col items-center text-center max-w-4xl pt-20">
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl leading-[1.1] md:leading-[0.95] font-bold tracking-tighter text-slate-900 mb-8 break-words"
            >
              Rethink <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Companionship
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-2xl text-slate-600 max-w-2xl mb-12 font-light leading-relaxed"
            >
              Meet CURA, an intelligent companion engineered to listen, understand, and evolve with your professional workspace.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto"
            >
              <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 md:px-10 md:py-5 bg-slate-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-slate-800 shadow-2xl shadow-slate-900/20 transition-all hover:-translate-y-1 group rounded-full w-full sm:w-auto whitespace-nowrap">
                Start Your Journey
                <span className="ml-4 transform group-hover:translate-x-2 transition-transform">&rarr;</span>
              </Link>
              <Link href="/science" className="inline-flex items-center justify-center px-8 py-4 md:px-10 md:py-5 bg-white/50 backdrop-blur-md text-slate-800 border border-slate-200 text-sm font-medium uppercase tracking-wider hover:border-slate-300 hover:bg-white transition-all rounded-full w-full sm:w-auto whitespace-nowrap">
                Read the Science
              </Link>
            </motion.div>
          </div>
        </section>

        <RotatingWheel />
        
        {/* Call to Action Wrapper to merge background color seamlessly */}
        <div className="bg-slate-900 pb-0">
          <CtaSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white text-slate-600 py-16 px-8 md:px-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="text-3xl font-light tracking-tighter uppercase mb-6 text-slate-900">CURA</div>
            <p className="text-slate-500 max-w-md leading-relaxed font-light">The professional AI knowledge engine and document intelligence platform designed for the modern enterprise. Built with empathy, engineered with rigor.</p>
          </div>
          <div>
            <h4 className="font-medium uppercase tracking-wider mb-4 text-slate-900 text-xs">Legal & Compliance</h4>
            <div className="flex flex-col gap-3 text-sm font-normal text-slate-500">
              <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link href="/cookie-policy" className="hover:text-blue-600 transition-colors">Cookie Policy</Link>
              <Link href="/aup" className="hover:text-blue-600 transition-colors">Acceptable Use Policy</Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium uppercase tracking-wider mb-4 text-slate-900 text-xs">Trust & Support</h4>
            <div className="flex flex-col gap-3 text-sm font-normal text-slate-500">
              <Link href="/security" className="hover:text-blue-600 transition-colors">Security & Trust Center</Link>
              <Link href="/ai-transparency" className="hover:text-blue-600 transition-colors">AI Transparency Policy</Link>
              <Link href="/dmca" className="hover:text-blue-600 transition-colors">Copyright / DMCA</Link>
              <Link href="/dpa" className="hover:text-blue-600 transition-colors">Enterprise DPA</Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact & Support</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-200">
          <div className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} CURA Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
