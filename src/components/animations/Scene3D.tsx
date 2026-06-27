"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Float, Trail, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function NeuralConstellation() {
  const groupRef = useRef<THREE.Group>(null);
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
      // Gentle constant rotation
      groupRef.current.rotation.y += 0.002;
      groupRef.current.rotation.x += 0.001;

      // Parallax effect based on mouse
      const targetX = mousePos.x * 0.2;
      const targetY = mousePos.y * 0.2;
      
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.05;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central glowing core */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[1, 64, 64]} scale={1.2}>
          <meshStandardMaterial 
            color="#3b82f6" 
            emissive="#1d4ed8" 
            emissiveIntensity={0.8}
            wireframe={true}
            transparent
            opacity={0.15}
          />
        </Sphere>
        
        {/* Inner solid core */}
        <Sphere args={[0.5, 32, 32]}>
          <meshPhysicalMaterial 
            color="#ffffff" 
            emissive="#60a5fa" 
            emissiveIntensity={1}
            roughness={0.2}
            metalness={0.8}
            clearcoat={1}
          />
        </Sphere>
      </Float>

      {/* Orbiting data points representing RAG documents */}
      <DataOrbit radius={2} speed={1} color="#60a5fa" size={0.08} />
      <DataOrbit radius={3} speed={-0.6} color="#c084fc" size={0.06} axis="y" />
      <DataOrbit radius={2.5} speed={0.8} color="#38bdf8" size={0.05} axis="z" />
      <DataOrbit radius={3.5} speed={-0.4} color="#818cf8" size={0.04} axis="x" offset={Math.PI / 4} />
      
      {/* Ambient background particles */}
      <Sparkles count={300} scale={10} size={2} speed={0.2} opacity={0.3} color="#93c5fd" />
    </group>
  );
}

function DataOrbit({ radius, speed, color, size, axis = "y", offset = 0 }: { radius: number, speed: number, color: string, size: number, axis?: string, offset?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime * speed + offset;
      if (axis === "y") {
        groupRef.current.rotation.y = t;
        groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.3;
      } else if (axis === "x") {
        groupRef.current.rotation.x = t;
        groupRef.current.rotation.z = Math.cos(t * 0.5) * 0.3;
      } else {
        groupRef.current.rotation.z = t;
        groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Trail width={0.5} length={4} color={color} attenuation={(t) => t * t}>
        <mesh ref={meshRef} position={[radius, 0, 0]}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </Trail>
    </group>
  );
}

export function Scene3D() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={1} color="#e0e7ff" />
      
      <NeuralConstellation />
    </Canvas>
  );
}
