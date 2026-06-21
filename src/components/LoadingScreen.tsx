"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"] });

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show the loading screen for 5 seconds on initial visit, then hide it.
    const hasVisited = sessionStorage.getItem('cura-has-visited');
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem('cura-has-visited', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, []);

  const text = "hellooooo curaaa";

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center"
        >
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl mix-blend-multiply animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Live Star Making Animation */}
            <div className="w-48 h-48 mb-8 flex items-center justify-center relative">
              <motion.svg
                viewBox="0 0 100 100"
                className="w-full h-full text-blue-500 drop-shadow-2xl"
                initial="hidden"
                animate="visible"
              >
                <motion.path
                  d="M50 5 L61 35 L95 35 L67 55 L78 85 L50 65 L22 85 L33 55 L5 35 L39 35 Z"
                  fill="transparent"
                  strokeWidth="2"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={{
                    hidden: { pathLength: 0, opacity: 0 },
                    visible: {
                      pathLength: 1,
                      opacity: 1,
                      transition: {
                        pathLength: { delay: 0.2, type: "spring", duration: 3, bounce: 0 },
                        opacity: { delay: 0.2, duration: 0.1 }
                      }
                    }
                  }}
                />
                <motion.path
                  d="M50 5 L61 35 L95 35 L67 55 L78 85 L50 65 L22 85 L33 55 L5 35 L39 35 Z"
                  fill="currentColor"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.2, scale: 1 }}
                  transition={{ delay: 2.5, duration: 1 }}
                />
              </motion.svg>
            </div>
            
            {/* Cursive Typewriter Animation */}
            <div className={`${caveat.className} text-6xl md:text-7xl text-blue-600 mb-8 flex`}>
              {text.split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: 1.5 + index * 0.1, // starts after star begins drawing
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4">
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
