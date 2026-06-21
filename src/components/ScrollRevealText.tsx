"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollRevealTextProps {
  text: string;
}

export function ScrollRevealText({ text }: ScrollRevealTextProps) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.8", "start 0.2"]
  });

  const words = text.split(" ");

  return (
    <div 
      ref={container} 
      className="max-w-4xl mx-auto py-20 flex flex-wrap gap-x-3 gap-y-2 justify-center"
    >
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + (1 / words.length);
        const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
        const filter = useTransform(scrollYProgress, [start, end], ["blur(4px)", "blur(0px)"]);
        const color = useTransform(scrollYProgress, [start, end], ["#cbd5e1", "#0f172a"]);

        return (
          <motion.span
            key={i}
            style={{ opacity, filter, color }}
            className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight transition-colors duration-100"
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}
