"use client";

import Link from "next/link";
import { useEffect, useState, useRef, Suspense } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { RotatingWheel } from "@/components/animations/RotatingWheel";
import { Menu, X } from "lucide-react";
import dynamic from "next/dynamic";

import { ErrorBoundary } from '@/components/ErrorBoundary';

const Scene3D = dynamic(() => import("@/components/animations/Scene3D").then(mod => mod.Scene3D), { ssr: false });
const SmoothScroll = dynamic(() => import("@/components/animations/SmoothScroll").then(mod => mod.SmoothScroll), { ssr: false });

function AnimatedWord({ word, progress, start, end }: { word: string, progress: any, start: number, end: number }) {
  // Start with 70% opacity so it's always readable on mobile
  const filter = useTransform(progress, [start, end], ["contrast(80%) brightness(80%) opacity(70%)", "contrast(100%) brightness(100%) opacity(100%)"]);
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

  // Use a fixed rem border radius to prevent the squished 50% arch on mobile phones
  const borderRadius = useTransform(scrollYProgress, [0, 0.6, 1], ["0%", "0%", "4rem"]);
  const scale = useTransform(scrollYProgress, [0, 0.6, 1], [0.9, 0.9, 1]);

  return (
    <motion.section 
      ref={ref}
      style={{ borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
      className="py-32 md:py-40 px-6 md:px-16 bg-blue-600 text-white text-center relative overflow-hidden flex flex-col items-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      <motion.div style={{ scale }} className="max-w-4xl mx-auto relative z-10 w-full flex flex-col items-center">
        <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter mb-10 flex justify-center gap-x-3 gap-y-2 flex-wrap text-white">
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
        <Link href="/login" className="inline-flex items-center px-8 md:px-10 py-4 md:py-5 bg-white text-blue-600 text-base md:text-lg font-medium uppercase tracking-widest hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-2xl rounded-full">
          Get Started for Free
          <span className="ml-4">&rarr;</span>
        </Link>
      </motion.div>
    </motion.section>
  );
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-white/90 backdrop-blur-2xl flex flex-col pt-24 px-8 pb-8"
        >
          <button onClick={onClose} className="absolute top-6 right-8 p-2 text-slate-800">
            <X className="w-8 h-8" />
          </button>
          <div className="flex flex-col gap-6 text-3xl font-light tracking-tight mt-10">
            {['History of RAG', 'Science', 'Pricing'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
              >
                <Link 
                  href={item === 'History of RAG' ? '/history' : `/${item.toLowerCase()}`}
                  onClick={onClose}
                  className="block hover:text-blue-600 transition-colors"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="mt-8 pt-8 border-t border-slate-200"
            >
              <Link 
                href="/login" 
                onClick={onClose}
                className="flex items-center justify-center w-full px-8 py-4 bg-blue-600 text-white text-lg font-medium uppercase tracking-wider rounded-full active:scale-95 transition-transform shadow-lg shadow-blue-500/30"
              >
                Sign In &rarr;
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ThinkingCloudContent() {
  const searchParams = useSearchParams();
  const isLogout = searchParams.get('logout') === 'true';
  const userName = searchParams.get('user');

  const messages = isLogout && userName 
    ? [
        `Welcome back, ${userName}! Ready to brainstorm?`,
        "I've been analyzing your recent data.",
        "Let's dive into some deep problem solving.",
      ]
    : [
        "Thinking about how to optimize your workflow...",
        "Analyzing patterns in your documents...",
        "Ready to assist with your next big idea.",
      ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
      className="absolute -top-[60%] md:-top-[30%] left-1/2 -translate-x-1/2 md:left-[90%] md:translate-x-0 z-50 flex items-center justify-center min-w-[200px]"
    >
      {/* Fluffy CSS Cloud using overlapping divs */}
      <div className="relative bg-white text-slate-800 px-8 py-6 rounded-[3rem] shadow-2xl z-10 w-full min-h-[80px] flex items-center justify-center">
        {/* Cloud bumps */}
        <div className="absolute -top-4 left-6 w-12 h-12 bg-white rounded-full"></div>
        <div className="absolute -top-6 right-8 w-16 h-16 bg-white rounded-full"></div>
        <div className="absolute -bottom-3 left-10 w-10 h-10 bg-white rounded-full"></div>
        
        {/* Thinking tail circles */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-left-2 w-6 h-6 bg-white rounded-full shadow-lg"></div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-left-6 w-3 h-3 bg-white rounded-full shadow-sm"></div>

        <div className="relative z-20">
          <AnimatePresence mode="wait">
            <motion.p 
              key={messageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium leading-snug whitespace-nowrap"
            >
              {messages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function ThinkingCloud({ opacity }: { opacity: any }) {
  return (
    <motion.div style={{ opacity }}>
      <Suspense fallback={null}>
        <ThinkingCloudContent />
      </Suspense>
    </motion.div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    setIsMounted(true);
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (!hasSeenSplash) {
      setShowSplash(true);
      sessionStorage.setItem('hasSeenSplash', 'true');
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Cinematic Robot Scroll Animation Logic
  // Scale: Normal (1) -> Large (1.3) -> Small Logo Size (0.12)
  const robotScale = useTransform(scrollYProgress, [0, 0.1, 0.25, 1], [1, 1.2, 0.12, 0.12]);
  
  // X/Y Position: Center (0) -> Slightly Down (0.1) -> Bottom Right (0.25)
  // Bottom Right is approx 50vw - 80px and 50vh - 80px
  const robotX = useTransform(scrollYProgress, [0, 0.1, 0.25, 1], ["0vw", "0vw", "calc(50vw - 80px)", "calc(50vw - 80px)"]);
  const robotY = useTransform(scrollYProgress, [0, 0.1, 0.25, 1], ["-5vh", "0vh", "calc(50vh - 80px)", "calc(50vh - 80px)"]);
  
  // Fade out thinking cloud on scroll
  const cloudOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  
  // Fade out static logo as robot arrives
  const staticLogoOpacity = useTransform(scrollYProgress, [0.15, 0.25], [1, 0]);

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
    <>
      <AnimatePresence>
        {isMounted && showSplash && (
          <motion.div 
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[100] bg-white flex items-center justify-center overflow-hidden"
          >
            <div className="w-full h-full relative flex flex-col items-center justify-center">
              <div className="w-[150px] h-[150px]">
                <ErrorBoundary>
                  <Scene3D isSplashActive={true} />
                </ErrorBoundary>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
                className="mt-12 flex items-center justify-center min-w-[200px]"
              >
                {/* Fluffy CSS Cloud using overlapping divs */}
                <div className="relative bg-white text-slate-800 px-8 py-4 rounded-[3rem] shadow-2xl z-10 w-full min-h-[60px] flex items-center justify-center">
                  {/* Cloud bumps */}
                  <div className="absolute -top-4 left-6 w-12 h-12 bg-white rounded-full"></div>
                  <div className="absolute -top-6 right-8 w-16 h-16 bg-white rounded-full"></div>
                  <div className="absolute -bottom-3 left-10 w-10 h-10 bg-white rounded-full"></div>
                  
                  {/* Thinking tail circles (pointing UP towards the bot since it's below) */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg"></div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 ml-4 w-3 h-3 bg-white rounded-full shadow-sm"></div>

                  <div className="relative z-20">
                    <p className="text-xl font-bold leading-snug whitespace-nowrap text-blue-600">
                      hiiiii
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SmoothScroll>
        <div className="bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 min-h-[100dvh]">
        
        {/* Top Navigation */}
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          id="top-nav"
          className="fixed top-0 w-full z-50 flex justify-between items-center px-8 transition-all duration-500 bg-transparent py-6 border border-transparent text-slate-800"
        >
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group relative w-[120px]">
              <motion.img 
                style={{ opacity: staticLogoOpacity }}
                src="/bot.jpg" 
                alt="Cura Logo Base" 
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shadow-sm" 
              />
              <span className="font-light text-2xl tracking-tighter text-slate-900 uppercase absolute left-14">
                Cura
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <Link href="/history" className="text-sm font-medium tracking-wide uppercase hover:text-blue-600 transition-colors">History of RAG</Link>
            <Link href="/science" className="text-sm font-medium tracking-wide uppercase hover:text-blue-600 transition-colors">Science</Link>
            <Link href="/pricing" className="text-sm font-medium tracking-wide uppercase hover:text-blue-600 transition-colors">Pricing</Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="px-6 py-3 bg-blue-600 text-white text-sm font-medium uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:scale-95 transition-all rounded-full duration-300">
              Sign In &rarr;
            </Link>
          </div>
          {/* Mobile Hamburger */}
          <button 
            className="md:hidden p-2 text-slate-800 active:scale-95 transition-transform"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-7 h-7" />
          </button>
        </motion.nav>

        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <main>
          
          {/* Fixed 3D Robot Wrapper */}
          <motion.div 
            style={{ 
              x: robotX, 
              y: robotY, 
              scale: robotScale 
            }}
            className="fixed inset-0 w-full h-full flex items-center justify-center pointer-events-none z-40"
          >
            <Link href="/login" className="relative w-[350px] h-[350px] md:w-[400px] md:h-[400px] pointer-events-auto cursor-pointer block hover:scale-110 transition-transform">
              <ThinkingCloud opacity={cloudOpacity} />
              <ErrorBoundary>
                <Scene3D />
              </ErrorBoundary>
            </Link>
          </motion.div>

          {/* Hero Section with React Three Fiber 3D Scene */}
          <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-white pt-32 pb-16">
            
            {/* Invisible spacer to maintain layout balance where the robot used to be */}
            <div className="relative w-full h-[40vh] md:h-[30vh] mb-4 mt-8 pointer-events-none" />
            
            {/* Subheading and CTAs below */}
            <div className="relative z-10 w-full px-6 md:px-8 flex flex-col items-center text-center max-w-2xl pointer-events-none">
              
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg md:text-2xl text-slate-700 w-full mb-10 font-light leading-relaxed drop-shadow-sm"
              >
                Meet CURA, an intelligent companion engineered to listen, understand, and evolve with your professional workspace.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pointer-events-auto"
              >
                <Link 
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white text-sm font-medium uppercase tracking-wider hover:bg-slate-800 shadow-2xl shadow-slate-900/20 transition-all hover:-translate-y-1 active:scale-95 group rounded-full w-full sm:w-auto whitespace-nowrap"
                >
                  Start Your Journey
                  <span className="ml-4 transform group-hover:translate-x-2 transition-transform">&rarr;</span>
                </Link>
                <Link href="/science" className="inline-flex items-center justify-center px-8 py-4 bg-white/80 backdrop-blur-md text-slate-800 border border-slate-200 text-sm font-medium uppercase tracking-wider hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all rounded-full w-full sm:w-auto whitespace-nowrap">
                  Read the Science
                </Link>
              </motion.div>
            </div>

          </section>

          <RotatingWheel />
          
          <div className="bg-transparent pb-0 pt-0">
            <CtaSection />
          </div>
        </main>

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
    </SmoothScroll>
    </>
  );
}
