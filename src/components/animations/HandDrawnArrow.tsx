"use client";

import { motion } from "framer-motion";

interface HandDrawnArrowProps {
  className?: string;
  delay?: number;
}

export function HandDrawnArrow({ className = "", delay = 0.5 }: HandDrawnArrowProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <motion.path
          d="M 10,10 C 40,0 80,40 20,80 C 10,85 5,75 15,65 C 30,50 70,50 90,85"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1.5,
            delay: delay,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M 75,70 L 90,85 L 85,100"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 0.5,
            delay: delay + 1.2,
            ease: "easeOut",
          }}
        />
      </svg>
    </div>
  );
}
