"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sphere, Cylinder } from "@react-three/drei";
import * as THREE from "three";

export function FullBotModel({ isSplashActive }: { isSplashActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
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
    // Look at cursor logic
    if (headRef.current && !isSplashActive) {
      const targetRotationX = -mousePos.y * 0.5;
      const targetRotationY = mousePos.x * 0.5;
      headRef.current.rotation.x += (targetRotationX - headRef.current.rotation.x) * 0.05;
      headRef.current.rotation.y += (targetRotationY - headRef.current.rotation.y) * 0.05;
    }

    if (groupRef.current && isSplashActive) {
      // In splash mode, look straight ahead, smile, and slowly scale up
      headRef.current!.rotation.x += (0 - headRef.current!.rotation.x) * 0.05;
      headRef.current!.rotation.y += (0 - headRef.current!.rotation.y) * 0.05;
      const t = state.clock.elapsedTime;
      const scale = Math.min(1 + t * 0.3, 3); // Scale up over time
      groupRef.current.scale.set(scale, scale, scale);
    }

    // Blinking logic
    if (leftEyeRef.current && rightEyeRef.current) {
      const time = state.clock.elapsedTime;
      const blink = Math.sin(time * 3) > 0.98 || Math.sin(time * 5) > 0.99;
      const targetScaleY = blink ? 0.1 : 1;
      leftEyeRef.current.scale.y += (targetScaleY - leftEyeRef.current.scale.y) * 0.5;
      rightEyeRef.current.scale.y += (targetScaleY - rightEyeRef.current.scale.y) * 0.5;
    }

    // Smiling logic during splash
    if (mouthRef.current) {
      const targetScaleY = isSplashActive ? 1.5 : 0.2; // Smile when splash is active
      const targetScaleX = isSplashActive ? 1.2 : 0.8;
      mouthRef.current.scale.y += (targetScaleY - mouthRef.current.scale.y) * 0.1;
      mouthRef.current.scale.x += (targetScaleX - mouthRef.current.scale.x) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <group ref={groupRef}>
        
        {/* Head Group */}
        <group ref={headRef} position={[0, 1.2, 0]}>
          <RoundedBox args={[2, 1.5, 1.2]} radius={0.5} smoothness={8}>
            <meshPhysicalMaterial color="#ffffff" roughness={0.1} metalness={0.1} clearcoat={1} />
          </RoundedBox>

          {/* Visor / Faceplate */}
          <RoundedBox args={[1.7, 0.8, 0.2]} radius={0.3} smoothness={8} position={[0, 0, 0.55]}>
            <meshPhysicalMaterial color="#0f172a" roughness={0.2} metalness={0.8} clearcoat={1} />
          </RoundedBox>

          {/* Left Eye */}
          <Sphere ref={leftEyeRef} args={[0.15, 32, 32]} position={[-0.4, 0.1, 0.62]}>
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} toneMapped={false} />
          </Sphere>

          {/* Right Eye */}
          <Sphere ref={rightEyeRef} args={[0.15, 32, 32]} position={[0.4, 0.1, 0.62]}>
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} toneMapped={false} />
          </Sphere>

          {/* Mouth / Smile */}
          <mesh ref={mouthRef} position={[0, -0.2, 0.62]}>
            <boxGeometry args={[0.4, 0.05, 0.05]} />
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} />
          </mesh>
        </group>

        {/* Neck */}
        <Cylinder args={[0.3, 0.4, 0.8, 32]} position={[0, 0.5, 0]}>
          <meshPhysicalMaterial color="#94a3b8" roughness={0.4} metalness={0.6} />
        </Cylinder>

        {/* Torso */}
        <RoundedBox args={[2.5, 2, 1.5]} radius={0.4} smoothness={8} position={[0, -1, 0]}>
          <meshPhysicalMaterial color="#ffffff" roughness={0.1} metalness={0.1} clearcoat={1} />
        </RoundedBox>

        {/* Logo/Core on Torso */}
        <Sphere args={[0.3, 32, 32]} position={[0, -0.8, 0.75]}>
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} toneMapped={false} />
        </Sphere>
      </group>
    </Float>
  );
}

export function Scene3D({ isSplashActive = false }: { isSplashActive?: boolean }) {
  return (
    <Canvas
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#e0e7ff" />
      <FullBotModel isSplashActive={isSplashActive} />
    </Canvas>
  );
}
