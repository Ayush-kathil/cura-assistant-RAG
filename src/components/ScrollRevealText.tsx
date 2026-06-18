"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

interface ScrollRevealTextProps {
  text: string;
  className?: string;
}

export const ScrollRevealText: React.FC<ScrollRevealTextProps> = ({ text, className }) => {
  const container = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 80%", "end 50%"]
  });

  const words = text.split(" ");

  return (
    <p ref={container} className={`flex flex-wrap justify-center md:justify-start ${className}`}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
};

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: React.FC<WordProps> = ({ children, progress, range }) => {
  // Use a softer gray for the initial state and dark black for the active state
  const color = useTransform(progress, range, ["#d1d5db", "#111c2c"]); // Tailwind gray-300 to very dark blue/black
  
  return (
    <span className="relative mr-[1.2vw] mt-[1.2vw] md:mr-2 md:mt-2">
      <motion.span style={{ color }} className="transition-colors duration-100">
        {children}
      </motion.span>
    </span>
  );
};
