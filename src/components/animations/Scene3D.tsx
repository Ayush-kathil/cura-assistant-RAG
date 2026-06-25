"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sphere } from "@react-three/drei";
import * as THREE from "three";

function RobotFace() {
  const groupRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Smoothly look at cursor
      const targetRotationX = -mousePos.y * 0.5;
      const targetRotationY = mousePos.x * 0.5;
      
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.05;

      // Add a slight natural breathing animation to scale
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.set(scale, scale, scale);
    }
    
    // Blinking logic
    if (leftEyeRef.current && rightEyeRef.current) {
      // Blink every ~4 seconds randomly
      const time = state.clock.elapsedTime;
      const blink = Math.sin(time * 3) > 0.98 || Math.sin(time * 5) > 0.99;
      const targetScaleY = blink ? 0.1 : 1;
      
      leftEyeRef.current.scale.y += (targetScaleY - leftEyeRef.current.scale.y) * 0.5;
      rightEyeRef.current.scale.y += (targetScaleY - rightEyeRef.current.scale.y) * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <group ref={groupRef}>
        {/* Main Head Shape (Smooth rounded box for an Eve-like look) */}
        <RoundedBox args={[2, 1.5, 1.2]} radius={0.5} smoothness={8}>
          <meshPhysicalMaterial 
            color="#ffffff" 
            roughness={0.1} 
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </RoundedBox>

        {/* Visor / Faceplate (Dark glass) */}
        <RoundedBox args={[1.7, 0.8, 0.2]} radius={0.3} smoothness={8} position={[0, 0, 0.55]}>
          <meshPhysicalMaterial 
            color="#0f172a" 
            roughness={0.2} 
            metalness={0.8}
            clearcoat={1}
          />
        </RoundedBox>

        {/* Left Eye */}
        <Sphere ref={leftEyeRef} args={[0.15, 32, 32]} position={[-0.4, 0, 0.62]}>
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} toneMapped={false} />
        </Sphere>

        {/* Right Eye */}
        <Sphere ref={rightEyeRef} args={[0.15, 32, 32]} position={[0.4, 0, 0.62]}>
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} toneMapped={false} />
        </Sphere>
      </group>
    </Float>
  );
}

export function Scene3D() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#e0e7ff" />
      <RobotFace />
    </Canvas>
  );
}
