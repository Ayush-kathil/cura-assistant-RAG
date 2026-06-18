"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ScienceKnowledgePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col overflow-x-hidden">
      {/* TopNavBar */}
      <nav className={`sticky top-4 z-50 flex justify-between items-center px-8 py-3 bg-white/70 backdrop-blur-xl rounded-full mt-4 mx-auto w-[90%] max-w-[1200px] border border-white/10 transition-shadow duration-300 ${scrolled ? 'shadow-xl' : 'shadow-[0_20px_20px_rgba(12,103,128,0.05)]'}`}>
        <div className="font-headline-md text-headline-md font-bold text-primary">Cura</div>
        <div className="hidden md:flex gap-8 items-center">
          <Link href="/" className="text-on-surface-variant font-label-md hover:text-primary-container transition-colors">Features</Link>
          <Link href="/science" className="text-primary font-bold border-b-2 border-primary font-label-md transition-colors">Science</Link>
          <Link href="/pricing" className="text-on-surface-variant font-label-md hover:text-primary-container transition-colors">Pricing</Link>
          <Link href="#" className="text-on-surface-variant font-label-md hover:text-primary-container transition-colors">Support</Link>
        </div>
        <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-full font-label-md active:scale-95 transition-transform">Get Started</Link>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-24 pb-16 px-6 md:px-10 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-[900px] mx-auto text-center space-y-6"
        >
          <span className="inline-block py-1 px-4 rounded-full bg-secondary-container text-on-secondary-container font-label-sm uppercase tracking-widest">Knowledge Base</span>
          <h1 className="font-headline-lg text-headline-lg md:text-[64px] md:leading-[72px] text-primary font-bold">The Science Behind <br/> Empathic Logic</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Exploring the intersection of Natural Language Processing and Emotional Intelligence. Discover how Cura understands not just your words, but your context.
          </p>
        </motion.div>
      </header>

      {/* Main Content: Bento Grid Research Highlights */}
      <main className="flex-grow px-6 md:px-10 py-12 max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24">
          
          {/* Featured Article */}
          <article className="md:col-span-8 group relative overflow-hidden rounded-[2rem] glass-panel shadow-[0_20px_40px_-10px_rgba(12,103,128,0.1)] p-8 flex flex-col justify-end min-h-[400px] hover:shadow-2xl transition-all duration-500 border border-white/40">
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <img 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                alt="Neural pathways" 
                src="https://images.unsplash.com/photo-1559757175-9b29e06cdbc2?q=80&w=2070&auto=format&fit=crop"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
            </div>
            <div className="relative">
              <span className="text-primary font-bold font-label-sm mb-2 block tracking-widest uppercase">WHITE PAPER • 2024</span>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4 font-bold">Neural Sentiment Resonance: Beyond Keywords</h2>
              <p className="text-on-surface-variant mb-6 max-w-xl font-medium">Our proprietary NSR model detects sub-textual emotional shifts by analyzing rhythmic patterns and cognitive load in human conversation.</p>
              <button className="flex items-center gap-2 text-primary font-bold font-label-md group/btn bg-white/50 w-fit px-4 py-2 rounded-full">
                Read the Paper 
                <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1 text-[20px]">arrow_forward</span>
              </button>
            </div>
          </article>

          {/* Sidebar Stats/Small Card */}
          <aside className="md:col-span-4 flex flex-col gap-8">
            <div className="glass-panel rounded-[2rem] p-8 shadow-[0_20px_40px_-10px_rgba(12,103,128,0.1)] flex-1 flex flex-col justify-center text-center bg-primary-container/20 border border-primary/10">
              <span className="material-symbols-outlined text-primary text-5xl mb-4">neurology</span>
              <div className="text-primary font-headline-lg text-[48px] font-bold">94.2%</div>
              <div className="text-on-surface-variant font-label-md font-bold uppercase tracking-wider mt-2">Contextual Accuracy</div>
              <p className="text-label-sm mt-4 text-on-surface-variant/70">Verified through multi-modal peer reviews.</p>
            </div>
            <div className="glass-panel rounded-[2rem] p-8 shadow-[0_20px_40px_-10px_rgba(12,103,128,0.1)] flex-1 bg-secondary-container/10 border border-white/40">
              <h3 className="font-headline-md text-[24px] text-primary mb-2 font-bold">Ethics First</h3>
              <p className="text-body-md text-on-surface-variant">We prioritize user privacy with locally-processed emotional vectors that never leave your device.</p>
            </div>
          </aside>
        </div>

        {/* Article Categories Section */}
        <section className="space-y-12">
          <div className="flex justify-between items-end border-b border-outline-variant/30 pb-6">
            <div>
              <h2 className="font-headline-lg text-[36px] text-primary font-bold">Core Research Areas</h2>
              <p className="text-on-surface-variant mt-2">Deep dives into our methodology and architectural pillars.</p>
            </div>
            <button className="text-primary font-label-md flex items-center gap-2 font-bold hover:bg-primary/5 px-4 py-2 rounded-full transition-colors">
              View Archive <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                category: 'Logics',
                title: 'The Equilibrium Principle',
                desc: 'How we balance radical empathy with objective problem-solving frameworks to avoid AI bias.',
                img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2000&auto=format&fit=crop'
              },
              {
                category: 'NLP',
                title: 'Semantic Nuance Detection',
                desc: "Understanding the subtle difference between 'fine', 'okay', and 'doing well' in a psychological context.",
                img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop'
              },
              {
                category: 'Ethics',
                title: 'Empathetic Safety Rails',
                desc: 'Our multi-layered safety protocol that prevents emotional manipulation and ensures therapeutic boundaries.',
                img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop'
              }
            ].map((card, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="rounded-[2rem] overflow-hidden h-48 mb-6 relative">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    alt={card.category} 
                    src={card.img}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[12px] font-bold text-primary shadow-sm tracking-wider uppercase">
                    {card.category}
                  </div>
                </div>
                <h3 className="font-headline-md text-[22px] text-on-surface mb-2 font-bold group-hover:text-primary transition-colors">{card.title}</h3>
                <p className="text-on-surface-variant text-body-md leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Quote Section */}
        <section className="mt-24 bg-surface-container rounded-[3rem] p-12 relative overflow-hidden text-center shadow-[0_20px_40px_-10px_rgba(12,103,128,0.1)] border border-white/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <span className="material-symbols-outlined text-primary/20 text-7xl block mb-6">format_quote</span>
          <blockquote className="font-headline-lg text-[32px] leading-tight text-primary max-w-4xl mx-auto italic mb-8 font-medium">
            "True empathy isn't just about mirroring emotions; it's about providing the structural logic required to navigate them safely."
          </blockquote>
          <cite className="not-italic flex flex-col items-center">
            <span className="font-label-md text-on-surface font-bold text-lg">Dr. Elena Vos</span>
            <span className="text-[12px] text-on-surface-variant uppercase tracking-widest font-bold mt-1">Chief Science Officer, Cura AI</span>
          </cite>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 md:px-10 mt-auto flex flex-col items-center gap-6 bg-surface-container-highest">
        <div className="font-headline-md text-headline-md text-primary font-bold">Cura AI</div>
        <div className="flex gap-8 flex-wrap justify-center">
          <Link href="#" className="text-on-tertiary-fixed-variant font-label-md hover:text-primary transition-colors font-bold">Privacy Policy</Link>
          <Link href="#" className="text-on-tertiary-fixed-variant font-label-md hover:text-primary transition-colors font-bold">Terms of Service</Link>
          <Link href="#" className="text-on-tertiary-fixed-variant font-label-md hover:text-primary transition-colors font-bold">Contact Us</Link>
        </div>
        <div className="text-on-tertiary-fixed-variant font-label-sm font-medium">
          © {new Date().getFullYear()} Cura AI. Made with empathy.
        </div>
      </footer>
    </div>
  );
}
