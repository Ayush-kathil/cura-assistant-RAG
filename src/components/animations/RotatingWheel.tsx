"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Database, Network, Cpu } from "lucide-react";

export function RotatingWheel() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 3D Wheel Rotation
  const rotateZ = useTransform(scrollYProgress, [0, 1], [0, 360]);
  
  // Cloud 1: Memory Without Context
  const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.35], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.1], [50, 0]);
  const scale1 = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.35], [0.8, 1, 1, 0.8]);

  // Cloud 2: The Library Card
  const opacity2 = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.3, 0.4], [50, 0]);
  const scale2 = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0.8, 1, 1, 0.8]);

  // Cloud 3: The Future of Work
  const opacity3 = useTransform(scrollYProgress, [0.65, 0.75, 0.95, 1], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.65, 0.75], [50, 0]);
  const scale3 = useTransform(scrollYProgress, [0.65, 0.75, 0.95, 1], [0.8, 1, 1, 0.8]);

  return (
    <div ref={containerRef} className="h-[300vh] w-full bg-slate-900 relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center perspective-[1000px]">
        
        {/* The 3D Wheel Background Structure */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <motion.div 
            style={{ 
              rotateX: 60, 
              rotateZ,
              transformStyle: "preserve-3d"
            }}
            className="w-[800px] h-[800px] rounded-full border-[1px] border-dashed border-blue-400/50 flex items-center justify-center"
          >
            <div className="w-[600px] h-[600px] rounded-full border border-indigo-500/30"></div>
            <div className="absolute w-[400px] h-[400px] rounded-full border border-purple-500/20 flex items-center justify-center">
               <div className="w-1 h-[800px] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent absolute"></div>
               <div className="w-[800px] h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent absolute"></div>
            </div>
          </motion.div>
        </div>

        {/* Center glowing orb to anchor the wheel */}
        <div className="absolute w-32 h-32 rounded-full bg-blue-600/20 blur-3xl shadow-[0_0_100px_rgba(37,99,235,0.5)]"></div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl px-8 flex justify-between items-center">
          
          {/* Left Side: Dynamic Clouds */}
          <div className="w-full md:w-1/2 h-[500px] relative">
            
            {/* Cloud 1 */}
            <motion.div 
              style={{ opacity: opacity1, y: y1, scale: scale1 }}
              className="absolute inset-0 flex items-center"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-400/30">
                  <Database className="text-blue-400 w-6 h-6" />
                </div>
                <h3 className="text-3xl font-light text-white tracking-tight mb-4">Memory Without Context</h3>
                <p className="text-slate-300 leading-relaxed">
                  When AI first began generating text, it was like a brilliant student trapped in a closed room. It had read millions of books during its training, but couldn't look anything up. If asked a specific query, it would confidently guess—often wrongly, hallucinating facts without realizing it.
                </p>
              </div>
            </motion.div>

            {/* Cloud 2 */}
            <motion.div 
              style={{ opacity: opacity2, y: y2, scale: scale2 }}
              className="absolute inset-0 flex items-center pointer-events-none"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-400/30">
                  <Network className="text-indigo-400 w-6 h-6" />
                </div>
                <h3 className="text-3xl font-light text-white tracking-tight mb-4">The Library Card</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Then came the breakthrough: <strong>Retrieval-Augmented Generation (RAG)</strong>. We gave the AI an open-book test in the world's largest library.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Before answering, it acts as a lightning-fast researcher, scanning private documents to find exact paragraphs. Only then does it read to construct an accurate response.
                </p>
              </div>
            </motion.div>

            {/* Cloud 3 */}
            <motion.div 
              style={{ opacity: opacity3, y: y3, scale: scale3 }}
              className="absolute inset-0 flex items-center pointer-events-none"
            >
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-400/30">
                  <Cpu className="text-purple-400 w-6 h-6" />
                </div>
                <h3 className="text-3xl font-light text-white tracking-tight mb-4">The Future of Work</h3>
                <p className="text-slate-300 leading-relaxed">
                  Today, RAG isn't just searching for keywords. At CURA, we've built a system that deeply understands the <em>meaning</em> of your documents. It builds a map of concepts, relationships, and ideas. That's the power of humanized, enterprise-grade RAG.
                </p>
              </div>
            </motion.div>

          </div>

          {/* Right Side: Visual Context or Empty Space */}
          <div className="hidden md:flex w-1/2 h-full items-center justify-center">
             {/* This space is intentionally left empty so the 3D wheel is visible on the right side of the screen */}
          </div>

        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50">
          <p className="text-white text-xs uppercase tracking-[0.3em] mb-2">Scroll to explore</p>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>

      </div>
    </div>
  );
}
