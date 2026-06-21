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

  // Generate spokes for the cycle wheel
  const spokes = Array.from({ length: 16 });

  return (
    <div ref={containerRef} className="h-[300vh] w-full bg-slate-900 relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center perspective-[1200px]">
        
        {/* The 3D Cycle Wheel Structure */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <motion.div 
            style={{ 
              rotateX: 65, 
              rotateZ,
              transformStyle: "preserve-3d"
            }}
            className="w-[800px] h-[800px] rounded-full border-8 border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.5)_inset] flex items-center justify-center relative"
          >
            {/* Inner Rim */}
            <div className="absolute w-[760px] h-[760px] rounded-full border-4 border-slate-600/50"></div>
            
            {/* Center Hub */}
            <div className="absolute w-16 h-16 rounded-full bg-slate-800 border-[6px] border-slate-600 shadow-2xl z-10 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]"></div>
            </div>

            {/* Spokes */}
            {spokes.map((_, i) => (
              <div 
                key={i}
                className="absolute w-[1px] h-[800px] bg-gradient-to-b from-slate-500/40 via-transparent to-slate-500/40"
                style={{ transform: `rotate(${i * (180 / 16)}deg)` }}
              ></div>
            ))}
          </motion.div>
        </div>

        {/* Center glowing orb to anchor the wheel */}
        <div className="absolute w-40 h-40 rounded-full bg-blue-600/10 blur-3xl shadow-[0_0_120px_rgba(37,99,235,0.4)] pointer-events-none"></div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl px-8 flex justify-between items-center">
          
          {/* Left Side: Dynamic Clouds */}
          <div className="w-full md:w-1/2 h-[500px] relative">
            
            {/* Cloud 1 */}
            <motion.div 
              style={{ opacity: opacity1, y: y1, scale: scale1 }}
              className="absolute inset-0 flex items-center"
            >
              {/* Cloud Frame Shape using organic border-radius */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 shadow-2xl w-full relative rounded-[3rem] rounded-tl-[6rem] rounded-br-[5rem]">
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
              {/* Cloud Frame Shape using organic border-radius */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 shadow-2xl w-full relative rounded-[4rem] rounded-tr-[6rem] rounded-bl-[5rem]">
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
              {/* Cloud Frame Shape using organic border-radius */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 shadow-2xl w-full relative rounded-[3.5rem] rounded-tl-[5rem] rounded-br-[6rem]">
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

          {/* Right Side: Empty Space to show the wheel */}
          <div className="hidden md:flex w-1/2 h-full items-center justify-center">
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
