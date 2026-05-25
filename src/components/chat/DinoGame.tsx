"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface DinoGameProps {
  isActive: boolean;
}

export const DinoGame: React.FC<DinoGameProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dino = { x: 50, y: 150, width: 20, height: 20, velocityY: 0, gravity: 0.6, jumpPower: -10, isJumping: false };
    let obstacles: { x: number, y: number, width: number, height: number }[] = [];
    let frame = 0;
    let currentScore = 0;
    let gameSpeed = 5;
    let active = true;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !dino.isJumping && active) {
        dino.velocityY = dino.jumpPower;
        dino.isJumping = true;
      }
      if (e.code === 'Space' && !active) {
        // restart
        active = true;
        setIsGameOver(false);
        dino.y = 150;
        dino.velocityY = 0;
        dino.isJumping = false;
        obstacles = [];
        currentScore = 0;
        setScore(0);
        gameLoop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const gameLoop = () => {
      if (!active) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Physics
      dino.velocityY += dino.gravity;
      dino.y += dino.velocityY;

      if (dino.y >= 150) {
        dino.y = 150;
        dino.isJumping = false;
        dino.velocityY = 0;
      }

      // Draw Dino
      ctx.fillStyle = '#60A5FA';
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

      // Obstacles
      if (frame % 60 === 0) {
        const height = 20 + Math.random() * 20;
        obstacles.push({ x: canvas.width, y: 170 - height, width: 15, height });
      }

      for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= gameSpeed;

        ctx.fillStyle = '#F87171';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Collision
        if (
          dino.x < obs.x + obs.width &&
          dino.x + dino.width > obs.x &&
          dino.y < obs.y + obs.height &&
          dino.y + dino.height > obs.y
        ) {
          active = false;
          setIsGameOver(true);
        }
      }

      // Cleanup obstacles
      obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

      // Ground
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 170, canvas.width, 2);

      currentScore++;
      if (currentScore % 10 === 0) {
        setScore(Math.floor(currentScore / 10));
        gameSpeed += 0.01;
      }

      frame++;
      if (active) {
        requestRef.current = requestAnimationFrame(gameLoop);
      }
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 120 }}
      exit={{ opacity: 0, height: 0 }}
      className="w-full bg-[#0F172A]/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center mb-4"
    >
      <div className="absolute top-2 right-4 text-blue-400 font-mono text-sm font-bold">
        Score: {score}
      </div>
      {isGameOver && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold tracking-widest uppercase">
          Game Over - Press Space to Restart
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={200} 
        className="w-[400px] h-[120px]"
      />
    </motion.div>
  );
};
