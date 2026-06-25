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

  // 3D Wheel Rotation - now with flip and full 360 degrees
  const rotateZ = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [65, 25, 65]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  
  // Cloud 1: Memory Without Context
  const opacity1 = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.35], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.1], [80, 0]);
  const scale1 = useTransform(scrollYProgress, [0, 0.1, 0.25, 0.35], [0.5, 1, 1, 0.5]);

  // Cloud 2: The Library Card
  const opacity2 = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.3, 0.4], [80, 0]);
  const scale2 = useTransform(scrollYProgress, [0.3, 0.4, 0.6, 0.7], [0.5, 1, 1, 0.5]);

  // Cloud 3: The Future of Work
  const opacity3 = useTransform(scrollYProgress, [0.65, 0.75, 0.95, 1], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.65, 0.75], [80, 0]);
  const scale3 = useTransform(scrollYProgress, [0.65, 0.75, 0.95, 1], [0.5, 1, 1, 0.5]);

  // Generate spokes for the cycle wheel
  const spokes = Array.from({ length: 16 });

  return (
    <div ref={containerRef} className="h-[300vh] w-full relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center perspective-[1200px]">
        
        {/* The 3D Cycle Wheel Structure */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <motion.div 
            style={{ 
              rotateX, 
              rotateY,
              rotateZ,
              transformStyle: "preserve-3d"
            }}
            className="w-[90vw] max-w-[800px] h-[90vw] max-h-[800px] rounded-full border-8 border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.5)_inset] flex items-center justify-center relative"
          >
            {/* Inner Rim */}
            <div className="absolute w-[85vw] max-w-[760px] h-[85vw] max-h-[760px] rounded-full border-4 border-slate-600/50"></div>
            
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
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-full max-w-lg flex flex-col items-center text-center">
                
                {/* Cloud Shape Graphic */}
                <div className="relative w-48 h-32 mb-8 flex items-center justify-center filter drop-shadow-xl">
                  {/* SVG Cloud Path */}
                  <svg className="absolute inset-0 w-full h-full text-white fill-current opacity-90 drop-shadow-lg" viewBox="0 0 24 24" preserveAspectRatio="none">
                    <path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5 0-2.434-1.92-4.412-4.333-4.495A5.5 5.5 0 0 0 7 8a5.502 5.502 0 0 0-4.996 7.643A4 4 0 0 0 6 23h11.5a4.5 4.5 0 0 0 0-4z" />
                  </svg>
                  {/* Inner Icon */}
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-white mt-2">
                    <Database className="text-white w-8 h-8" />
                  </div>
                </div>

                {/* Text underneath the cloud */}
                <div className="w-full">
                  <h3 className="text-3xl font-light text-slate-900 tracking-tight mb-4 drop-shadow-sm">Memory Without Context</h3>
                  <p className="text-slate-700 leading-relaxed text-lg px-4 md:px-0">
                    When AI first began generating text, it was like a brilliant student trapped in a closed room. It had read millions of books during its training, but couldn't look anything up.
                  </p>
                </div>

              </div>
            </motion.div>

            {/* Cloud 2 */}
            <motion.div 
              style={{ opacity: opacity2, y: y2, scale: scale2 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-full max-w-lg flex flex-col items-center text-center">
                
                {/* Cloud Shape Graphic */}
                <div className="relative w-48 h-32 mb-8 flex items-center justify-center filter drop-shadow-xl">
                  {/* SVG Cloud Path */}
                  <svg className="absolute inset-0 w-full h-full text-white fill-current opacity-90 drop-shadow-lg" viewBox="0 0 24 24" preserveAspectRatio="none">
                    <path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5 0-2.434-1.92-4.412-4.333-4.495A5.5 5.5 0 0 0 7 8a5.502 5.502 0 0 0-4.996 7.643A4 4 0 0 0 6 23h11.5a4.5 4.5 0 0 0 0-4z" />
                  </svg>
                  {/* Inner Icon */}
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border-2 border-white mt-2">
                    <Network className="text-white w-8 h-8" />
                  </div>
                </div>

                {/* Text underneath the cloud */}
                <div className="w-full">
                  <h3 className="text-3xl font-light text-slate-900 tracking-tight mb-4 drop-shadow-sm">The Library Card</h3>
                  <p className="text-slate-700 leading-relaxed text-lg px-4 md:px-0">
                    Then came the breakthrough: <strong>Retrieval-Augmented Generation (RAG)</strong>. We gave the AI an open-book test in the world's largest library.
                  </p>
                </div>

              </div>
            </motion.div>

            {/* Cloud 3 */}
            <motion.div 
              style={{ opacity: opacity3, y: y3, scale: scale3 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-full max-w-lg flex flex-col items-center text-center">
                
                {/* Cloud Shape Graphic */}
                <div className="relative w-48 h-32 mb-8 flex items-center justify-center filter drop-shadow-xl">
                  {/* SVG Cloud Path */}
                  <svg className="absolute inset-0 w-full h-full text-white fill-current opacity-90 drop-shadow-lg" viewBox="0 0 24 24" preserveAspectRatio="none">
                    <path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5 0-2.434-1.92-4.412-4.333-4.495A5.5 5.5 0 0 0 7 8a5.502 5.502 0 0 0-4.996 7.643A4 4 0 0 0 6 23h11.5a4.5 4.5 0 0 0 0-4z" />
                  </svg>
                  {/* Inner Icon */}
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 border-2 border-white mt-2">
                    <Cpu className="text-white w-8 h-8" />
                  </div>
                </div>

                {/* Text underneath the cloud */}
                <div className="w-full">
                  <h3 className="text-3xl font-light text-slate-900 tracking-tight mb-4 drop-shadow-sm">The Future of Work</h3>
                  <p className="text-slate-700 leading-relaxed text-lg px-4 md:px-0">
                    At CURA, we've built a system that deeply understands the <em>meaning</em> of your documents. It builds a map of concepts and relationships.
                  </p>
                </div>

              </div>
            </motion.div>

          </div>

          {/* Right Side: Empty Space to show the wheel */}
          <div className="hidden md:flex w-1/2 h-full items-center justify-center">
          </div>

        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50">
          <p className="text-slate-400 text-xs uppercase tracking-[0.3em] mb-2">Scroll to explore</p>
          <div className="w-[1px] h-12 bg-gradient-to-b from-slate-400 to-transparent"></div>
        </div>

      </div>
    </div>
  );
}
