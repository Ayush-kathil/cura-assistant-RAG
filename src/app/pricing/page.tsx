"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col font-body-md overflow-x-hidden">
      {/* TopNavBar */}
      <nav className="sticky top-4 z-50 flex justify-between items-center px-8 py-3 rounded-full mt-4 mx-auto w-[90%] max-w-[1200px] bg-white/70 backdrop-blur-xl border border-white/10 shadow-[0_20px_20px_rgba(12,103,128,0.05)] transition-transform">
        <div className="flex items-center gap-2">
          <span className="font-headline-md text-headline-md font-bold text-primary">Cura</span>
        </div>
        <div className="hidden md:flex gap-8">
          <Link href="/" className="font-label-md text-on-surface-variant hover:text-primary-container transition-colors">Features</Link>
          <Link href="/science" className="font-label-md text-on-surface-variant hover:text-primary-container transition-colors">Science</Link>
          <Link href="/pricing" className="font-label-md text-primary font-bold border-b-2 border-primary">Pricing</Link>
          <Link href="#" className="font-label-md text-on-surface-variant hover:text-primary-container transition-colors">Support</Link>
        </div>
        <Link href="/login" className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md hover:bg-primary/90 active:scale-95 transition-all shadow-md">
          Get Started
        </Link>
      </nav>

      <main className="relative pt-16 pb-24 px-6 md:px-10 max-w-[1200px] w-full mx-auto flex-grow overflow-visible">
        {/* Background Decoration */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-secondary-container/30 rounded-full blur-[100px] -z-10"></div>
        
        {/* Header Section */}
        <header className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-headline-lg text-[40px] md:text-[56px] leading-tight text-on-surface mb-4 font-bold"
          >
            Choose your journey to calm
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto"
          >
            Flexible plans designed to support your mental well-being, whether you're just starting out or seeking a lifetime companion.
          </motion.p>
          
          {/* Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <span className={`font-label-md ${!isYearly ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-8 rounded-full p-1 transition-colors ${isYearly ? 'bg-primary/20' : 'bg-surface-container-high'}`}
            >
              <div 
                className={`w-6 h-6 bg-primary rounded-full transition-transform duration-300 ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}
              ></div>
            </button>
            <span className={`font-label-md flex items-center gap-2 ${isYearly ? 'text-primary font-bold' : 'text-on-surface'}`}>
              Yearly 
              <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Save 20%</span>
            </span>
          </motion.div>
        </header>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-24">
          
          {/* Free Plan */}
          <section className="glass-panel p-10 rounded-[2rem] flex flex-col items-center text-center transition-all hover:-translate-y-2 border border-white/40 shadow-[0_20px_40px_-10px_rgba(12,103,128,0.05)]">
            <div className="mb-6">
              <span className="material-symbols-outlined text-secondary text-[48px]">spa</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">Free</h3>
            <div className="mb-6">
              <span className="font-headline-lg text-[48px] font-bold">$0</span>
              <span className="font-body-md text-body-md text-on-surface-variant">/forever</span>
            </div>
            <p className="font-body-md text-on-surface-variant mb-8 h-12">Essential tools for mindful reflection and basic support.</p>
            <ul className="w-full space-y-4 mb-10 flex-grow text-left">
              <li className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="font-label-md font-bold">Daily Mood Check-ins</span>
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="font-label-md font-bold">3 Guided Sessions / Week</span>
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="font-label-md font-bold">Community Access</span>
              </li>
            </ul>
            <Link href="/login" className="w-full py-4 border-2 border-outline-variant/30 text-on-surface-variant rounded-full font-label-md font-bold hover:bg-surface-container transition-all active:scale-95 block">
              Start for Free
            </Link>
          </section>

          {/* Pro Plan (Recommended) */}
          <section className="relative bg-white shadow-[0_0_40px_rgba(135,206,235,0.3)] p-10 rounded-[2rem] flex flex-col items-center text-center border-2 border-primary-container z-10 md:scale-105 transition-all hover:scale-[1.07] md:hover:scale-[1.07]">
            <div className="absolute -top-4 bg-primary text-on-primary px-4 py-1 rounded-full text-[12px] font-bold tracking-wide shadow-lg uppercase">
              Recommended
            </div>
            <div className="mb-6">
              <span className="material-symbols-outlined text-primary text-[48px]" style={{fontVariationSettings: "'FILL' 1"}}>stars</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">Pro</h3>
            <div className="mb-6">
              <span className="font-headline-lg text-[48px] font-bold">{isYearly ? '$9.60' : '$12'}</span>
              <span className="font-body-md text-body-md text-on-surface-variant">/month</span>
            </div>
            <p className="font-body-md text-on-surface-variant mb-8 h-12">Advanced AI features and personalized therapeutic paths.</p>
            <ul className="w-full space-y-4 mb-10 flex-grow text-left">
              <li className="flex items-center gap-3 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                <span className="font-label-md font-bold">Everything in Free</span>
              </li>
              <li className="flex items-center gap-3 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                <span className="font-label-md font-bold">Unlimited AI Chat Support</span>
              </li>
              <li className="flex items-center gap-3 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                <span className="font-label-md font-bold">Personalized Wellness Data</span>
              </li>
              <li className="flex items-center gap-3 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                <span className="font-label-md font-bold">Sleep & Focus Audio Library</span>
              </li>
            </ul>
            <Link href="/login" className="w-full py-4 bg-primary text-white rounded-full font-label-md font-bold hover:shadow-xl active:scale-95 transition-all block">
              Get Pro Access
            </Link>
          </section>

          {/* Enterprise Plan */}
          <section className="glass-panel p-10 rounded-[2rem] flex flex-col items-center text-center transition-all hover:-translate-y-2 border border-white/40 shadow-[0_20px_40px_-10px_rgba(12,103,128,0.05)]">
            <div className="mb-6">
              <span className="material-symbols-outlined text-secondary text-[48px]">corporate_fare</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">Enterprise</h3>
            <div className="mb-6">
              <span className="font-headline-lg text-[48px] font-bold">$49</span>
              <span className="font-body-md text-body-md text-on-surface-variant">/month</span>
            </div>
            <p className="font-body-md text-on-surface-variant mb-8 h-12">Scalable wellness solutions for teams and organizations.</p>
            <ul className="w-full space-y-4 mb-10 flex-grow text-left">
              <li className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="font-label-md font-bold">Everything in Pro</span>
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="font-label-md font-bold">Admin Dashboard & Reports</span>
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="font-label-md font-bold">HIPAA & GDPR Compliance</span>
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                <span className="font-label-md font-bold">Dedicated Success Manager</span>
              </li>
            </ul>
            <Link href="#" className="w-full py-4 border-2 border-outline-variant/30 text-on-surface-variant rounded-full font-label-md font-bold hover:bg-surface-container transition-all active:scale-95 block">
              Contact Sales
            </Link>
          </section>
        </div>

        {/* Detailed Comparison */}
        <div className="max-w-4xl mx-auto overflow-hidden mb-32">
          <h2 className="font-headline-md text-[32px] font-bold text-center mb-12">Compare every feature</h2>
          <div className="glass-panel rounded-[2rem] overflow-hidden p-2 border border-white/50 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="p-6 font-label-md text-on-surface-variant font-bold uppercase tracking-wider">Features</th>
                  <th className="p-6 font-label-md text-on-surface text-center font-bold uppercase tracking-wider">Free</th>
                  <th className="p-6 font-label-md text-primary text-center font-bold uppercase tracking-wider">Pro</th>
                  <th className="p-6 font-label-md text-on-surface text-center font-bold uppercase tracking-wider">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="p-6 font-body-md font-bold">Daily Check-ins</td>
                  <td className="p-6 text-center"><span className="material-symbols-outlined text-primary font-bold">done</span></td>
                  <td className="p-6 text-center"><span className="material-symbols-outlined text-primary font-bold">done</span></td>
                  <td className="p-6 text-center"><span className="material-symbols-outlined text-primary font-bold">done</span></td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="p-6 font-body-md font-bold">AI Mood Analysis</td>
                  <td className="p-6 text-center text-on-surface-variant">—</td>
                  <td className="p-6 text-center"><span className="material-symbols-outlined text-primary font-bold">done</span></td>
                  <td className="p-6 text-center"><span className="material-symbols-outlined text-primary font-bold">done</span></td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="p-6 font-body-md font-bold">Offline Access</td>
                  <td className="p-6 text-center text-on-surface-variant">—</td>
                  <td className="p-6 text-center"><span className="material-symbols-outlined text-primary font-bold">done</span></td>
                  <td className="p-6 text-center"><span className="material-symbols-outlined text-primary font-bold">done</span></td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="p-6 font-body-md font-bold">Team Collaboration</td>
                  <td className="p-6 text-center text-on-surface-variant">—</td>
                  <td className="p-6 text-center text-on-surface-variant">—</td>
                  <td className="p-6 text-center"><span className="material-symbols-outlined text-primary font-bold">done</span></td>
                </tr>
                <tr className="hover:bg-white/50 transition-colors">
                  <td className="p-6 font-body-md font-bold">Custom Branding</td>
                  <td className="p-6 text-center text-on-surface-variant">—</td>
                  <td className="p-6 text-center text-on-surface-variant">—</td>
                  <td className="p-6 text-center"><span className="material-symbols-outlined text-primary font-bold">done</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust Section */}
        <section className="text-center">
          <h2 className="font-headline-md text-[28px] font-bold text-on-surface mb-12">Trusted by clinicians and seekers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center justify-center p-4">
              <span className="font-headline-md font-bold text-xl text-on-surface-variant/70 tracking-widest">WellnessCo</span>
            </div>
            <div className="flex items-center justify-center p-4">
              <span className="font-headline-md font-bold text-xl text-on-surface-variant/70 tracking-widest">MindPath</span>
            </div>
            <div className="flex items-center justify-center p-4">
              <span className="font-headline-md font-bold text-xl text-on-surface-variant/70 tracking-widest">HealthGrid</span>
            </div>
            <div className="flex items-center justify-center p-4">
              <span className="font-headline-md font-bold text-xl text-on-surface-variant/70 tracking-widest">UnityCare</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 md:px-10 mt-auto flex flex-col items-center gap-6 bg-surface-container-highest rounded-t-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-headline-md text-headline-md font-bold text-primary">Cura</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mb-4">
          <Link href="#" className="font-label-md text-on-tertiary-fixed-variant hover:text-primary transition-colors font-bold">Privacy Policy</Link>
          <Link href="#" className="font-label-md text-on-tertiary-fixed-variant hover:text-primary transition-colors font-bold">Terms of Service</Link>
          <Link href="#" className="font-label-md text-on-tertiary-fixed-variant hover:text-primary transition-colors font-bold">Contact Us</Link>
        </div>
        <p className="font-label-sm text-on-tertiary-fixed-variant font-medium">© {new Date().getFullYear()} Cura AI. Made with empathy.</p>
      </footer>
    </div>
  );
}
