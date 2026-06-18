"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    // Simple scroll interaction for the navbar
    const handleScroll = () => {
      const nav = document.getElementById('top-nav');
      if (nav) {
        if (window.scrollY > 20) {
          nav.classList.add('shadow-xl');
          nav.classList.remove('shadow-[0_20px_20px_rgba(12,103,128,0.05)]');
        } else {
          nav.classList.remove('shadow-xl');
          nav.classList.add('shadow-[0_20px_20px_rgba(12,103,128,0.05)]');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-background text-on-surface">
      {/* TopNavBar */}
      <nav 
        id="top-nav"
        className="sticky top-4 z-50 flex justify-between items-center px-8 py-3 rounded-full mt-4 mx-auto w-[90%] max-w-container-max bg-white/70 backdrop-blur-xl border border-white/10 shadow-[0_20px_20px_rgba(12,103,128,0.05)] transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="font-headline-md text-headline-md font-bold text-primary">Cura</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="font-label-md text-label-md text-primary font-bold border-b-2 border-primary transition-colors">Features</Link>
          <Link href="#science" className="font-label-md text-label-md text-gray-500 hover:text-primary transition-colors">Science</Link>
          <Link href="#pricing" className="font-label-md text-label-md text-gray-500 hover:text-primary transition-colors">Pricing</Link>
          <Link href="#support" className="font-label-md text-label-md text-gray-500 hover:text-primary transition-colors">Support</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="active:scale-95 transition-transform px-6 py-2 rounded-full bg-primary text-white font-label-md text-label-md hover:scale-105 shadow-lg shadow-primary/20">
            Get Started
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative flex items-center pt-12 md:pt-24 pb-20 overflow-hidden">
          <div className="container mx-auto px-4 md:px-10 max-w-container-max relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[18px] mr-2">sparkles</span>
                  Meet your new AI mental health companion
                </div>
                <h1 className="font-headline-lg text-headline-lg md:text-[64px] md:leading-[72px] text-primary">
                  Conversations that <br/><span className="text-primary-container drop-shadow-sm">truly understand you.</span>
                </h1>
                <p className="font-body-lg text-body-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                  Cura is an AI-driven companion designed to provide emotional support, guidance, and a safe space for your thoughts. Always here, always listening.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link href="/login" className="w-full sm:w-auto px-10 py-4 rounded-full bg-primary text-white font-headline-md text-headline-md shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 text-center">
                    Get Started
                  </Link>
                  <Link href="#features" className="w-full sm:w-auto px-10 py-4 rounded-full bg-[#d8e3fa] text-primary font-headline-md text-headline-md transition-all hover:bg-[#dee8ff] active:scale-95 text-center">
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="relative flex justify-center items-center">
                <div className="absolute w-[80%] h-[80%] bg-primary-container/30 rounded-full blur-[100px] animate-pulse"></div>
                <div className="relative w-full max-w-md" style={{animation: 'floating 3s ease-in-out infinite'}}>
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVg6OQrMsnNd4NM0FPVZ9kVrOfqYGk5nqIxx-m8X09GZBg3FpJ4x_uoJqJW5n5KBuUJLQ_E2g9pYyw9WWsiHIIdaC3XLoLlFlyTIVBxZjZXCZ0YZAMtYON8HD4E72JdMPTojnsGGo2B9eawB64g-jW1OEWBsfRdmyKsOT23w_KuCTIQOd4iyoWSHg-_qU9y6Qy-QKHLauYWDThTOi-DCJCbbz4KXDixcTOce_PaKZg_yoaMj2GHzL7FgFwZUiL0hhKPx4XeQMNLAvS" 
                    alt="Cura Mascot" 
                    className="w-full h-auto drop-shadow-2xl" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white relative">
          <div className="container mx-auto px-4 md:px-10 max-w-container-max">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-headline-lg text-headline-lg text-primary">Thoughtfully Crafted Support</h2>
              <p className="font-body-lg text-body-lg text-gray-600 max-w-2xl mx-auto">
                Technology that feels human. We've built Cura with professional empathy at its core to ensure you feel heard, never judged.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="glass-card p-8 rounded-lg border border-gray-200 transition-all hover:border-primary/50 group">
                <div className="w-16 h-16 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">favorite</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Deep Empathy</h3>
                <p className="font-body-md text-body-md text-gray-600">
                  Our LLM is fine-tuned on therapeutic principles to recognize emotional nuances and provide comforting, relevant responses.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="glass-card p-8 rounded-lg border border-gray-200 transition-all hover:border-primary/50 group">
                <div className="w-16 h-16 rounded-xl bg-secondary-container/30 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">lock</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Privacy First</h3>
                <p className="font-body-md text-body-md text-gray-600">
                  Your conversations are encrypted and private. We believe your mental health journey should be for your eyes only.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="glass-card p-8 rounded-lg border border-gray-200 transition-all hover:border-primary/50 group">
                <div className="w-16 h-16 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-tertiary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">mood</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">Daily Mood Log</h3>
                <p className="font-body-md text-body-md text-gray-600">
                  Track your emotional trends over time with visual insights that help you understand your triggers and triumphs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Bento Grid Section */}
        <section className="py-24 bg-[#f0f3ff]">
          <div className="container mx-auto px-4 md:px-10 max-w-container-max">
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
              <div className="md:col-span-2 md:row-span-2 rounded-xl bg-white p-10 flex flex-col justify-between overflow-hidden relative shadow-sm">
                <div className="relative z-10">
                  <h2 className="font-headline-lg text-headline-lg text-primary mb-6">Designed for your peace of mind.</h2>
                  <p className="font-body-lg text-body-lg text-gray-600 mb-8">
                    Whether it's a late-night thought or a mid-day stressor, Cura is just a tap away with instant, calming interactions.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 font-label-md text-label-md text-gray-800">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      Instant 24/7 Availability
                    </li>
                    <li className="flex items-center gap-3 font-label-md text-label-md text-gray-800">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      Personalized Coping Strategies
                    </li>
                    <li className="flex items-center gap-3 font-label-md text-label-md text-gray-800">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      Guided Breathing Exercises
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:col-span-2 rounded-xl bg-primary-container p-8 flex items-center justify-between shadow-sm group cursor-pointer overflow-hidden">
                <div>
                  <h3 className="font-headline-md text-headline-md text-[#005870] mb-2">Scientific Basis</h3>
                  <p className="font-body-md text-body-md text-[#005870]/80">Developed with clinical advisors for effective emotional support.</p>
                </div>
                <span className="material-symbols-outlined text-[48px] text-[#005870] opacity-50 group-hover:scale-125 transition-transform">menu_book</span>
              </div>
              <div className="rounded-xl bg-secondary-container p-8 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="text-headline-lg font-headline-lg text-[#3b6a6f]">98%</div>
                <div className="text-label-sm font-label-sm text-[#3b6a6f]/70">User Satisfaction</div>
              </div>
              <div className="rounded-xl bg-white p-8 shadow-sm flex flex-col justify-center items-center text-center border border-gray-200">
                <span className="material-symbols-outlined text-[40px] text-primary mb-2">rocket_launch</span>
                <div className="text-label-md font-label-md text-primary">Fast & Responsive</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 md:px-10">
          <div className="max-w-container-max mx-auto bg-primary rounded-xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-8">
              <h2 className="font-headline-lg text-headline-lg text-white md:text-[48px]">Ready to feel heard?</h2>
              <p className="font-body-lg text-body-lg text-white/80 max-w-xl mx-auto">
                Join thousands of people who use Cura to navigate their mental health journey with ease and compassion.
              </p>
              <Link href="/login" className="inline-block px-12 py-5 rounded-full bg-white text-primary font-headline-md text-headline-md hover:scale-105 transition-all shadow-lg">
                Start Your First Chat
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-10 mt-auto flex flex-col items-center gap-4 bg-[#d8e3fa] rounded-t-xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-headline-md text-headline-md text-primary font-bold">Cura AI</span>
        </div>
        <div className="flex gap-8 mb-6">
          <a className="font-label-sm text-label-sm text-gray-600 hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="font-label-sm text-label-sm text-gray-600 hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="font-label-sm text-label-sm text-gray-600 hover:text-primary transition-colors" href="#">Contact Us</a>
        </div>
        <p className="font-label-sm text-label-sm text-gray-600">© 2024 Cura AI. Made with empathy.</p>
      </footer>
    </div>
  );
}
