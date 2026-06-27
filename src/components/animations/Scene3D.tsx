"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sphere, Cylinder, Torus } from "@react-three/drei";
import * as THREE from "three";

export function FullBotModel({ isSplashActive }: { isSplashActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  
  // Limbs
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  
  // Face features
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Group>(null);
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lastMouseMove, setLastMouseMove] = useState(Date.now());
  
  // Track cursor for idle detection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
      setLastMouseMove(Date.now());
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const isIdle = Date.now() - lastMouseMove > 3000; // 3 seconds of no movement
    const isMovingMouse = Date.now() - lastMouseMove < 500; // Actively moving

    // Global Scale (Splash vs Normal)
    if (groupRef.current) {
      if (isSplashActive) {
        const scale = Math.max(0.6, 1 - time * 0.1); 
        groupRef.current.scale.set(scale, scale, scale);
      } else {
        groupRef.current.scale.set(1, 1, 1);
      }
    }

    // Dancing Animation (Bobbing and Tilting body, moving legs and arms)
    if (torsoRef.current && headRef.current) {
      const bobbingY = Math.sin(time * 4) * 0.08;
      const tiltZ = Math.sin(time * 2) * 0.05;
      
      torsoRef.current.position.y = bobbingY;
      torsoRef.current.rotation.z = tiltZ;
      
      // Arms dancing
      if (leftArmRef.current && rightArmRef.current) {
        // Waving the left arm (like the image)
        leftArmRef.current.rotation.z = -Math.PI / 4 + Math.sin(time * 5) * 0.2;
        leftArmRef.current.rotation.x = Math.sin(time * 3) * 0.2;
        
        // Right arm swaying
        rightArmRef.current.rotation.x = Math.sin(time * 3 + Math.PI) * 0.3;
      }
      
      // Legs dancing (tapping/swaying)
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(time * 4) * 0.15;
        rightLegRef.current.position.y = -1.3 + Math.max(0, Math.sin(time * 4 + Math.PI) * 0.1);
      }
    }

    // Head rotation logic (Tracking vs Idle Spin)
    if (headRef.current) {
      if (!isSplashActive && !isIdle) {
        // Track mouse
        const targetRotationX = -mousePos.y * 0.4;
        const targetRotationY = mousePos.x * 0.6;
        headRef.current.rotation.x += (targetRotationX - headRef.current.rotation.x) * 0.1;
        
        // Normalize Y rotation
        let currentY = headRef.current.rotation.y % (Math.PI * 2);
        if (currentY > Math.PI) currentY -= Math.PI * 2;
        if (currentY < -Math.PI) currentY += Math.PI * 2;
        headRef.current.rotation.y = currentY + (targetRotationY - currentY) * 0.1;
      } else if (!isSplashActive && isIdle) {
        // Idle 360 Spin
        headRef.current.rotation.x += (0 - headRef.current.rotation.x) * 0.05;
        headRef.current.rotation.y += 0.03; 
      } else if (isSplashActive) {
        headRef.current.rotation.x += (0 - headRef.current.rotation.x) * 0.05;
        headRef.current.rotation.y += (0 - headRef.current.rotation.y) * 0.05;
      }
    }

    // Blinking Eyes
    if (leftEyeRef.current && rightEyeRef.current) {
      // Natural blink pattern
      const blink = Math.sin(time * 3) > 0.98 || Math.sin(time * 5) > 0.99;
      const targetScaleY = blink ? 0.1 : 1;
      leftEyeRef.current.scale.y += (targetScaleY - leftEyeRef.current.scale.y) * 0.5;
      rightEyeRef.current.scale.y += (targetScaleY - rightEyeRef.current.scale.y) * 0.5;
    }
    
    // Smiling when cursor moves
    if (mouthRef.current) {
      // If moving mouse or splash is active, smile broadly!
      const targetScale = (isMovingMouse || isSplashActive) ? 1 : 0; 
      mouthRef.current.scale.setScalar(mouthRef.current.scale.x + (targetScale - mouthRef.current.scale.x) * 0.15);
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.2} floatIntensity={1.2}>
      <group ref={groupRef} position={[0, -0.2, 0]}>
        
        {/* === HEAD === */}
        <group ref={headRef} position={[0, 1.4, 0]}>
          {/* Main White Helmet (Wide, Oblate) */}
          <RoundedBox args={[3.2, 2.3, 2.2]} radius={1.0} smoothness={16}>
            <meshPhysicalMaterial color="#ffffff" roughness={0.15} metalness={0.1} clearcoat={1} />
          </RoundedBox>

          {/* Black Visor (Large curved oval faceplate) */}
          <RoundedBox args={[2.8, 1.6, 0.4]} radius={0.75} smoothness={16} position={[0, 0, 1.0]}>
            <meshPhysicalMaterial color="#000000" roughness={0.1} metalness={0.9} clearcoat={1} />
          </RoundedBox>

          {/* Left Glowing Ring Eye */}
          <group ref={leftEyeRef} position={[-0.65, 0.1, 1.25]}>
            <Torus args={[0.35, 0.1, 32, 64]}>
              <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2.5} toneMapped={false} />
            </Torus>
            {/* Black pupil inside the ring */}
            <Sphere args={[0.3, 32, 32]} position={[0, 0, -0.05]}>
              <meshBasicMaterial color="#000000" />
            </Sphere>
            {/* White reflection highlight dot */}
            <Sphere args={[0.08, 16, 16]} position={[0.15, 0.2, 0.05]}>
              <meshBasicMaterial color="#ffffff" />
            </Sphere>
          </group>

          {/* Right Glowing Ring Eye */}
          <group ref={rightEyeRef} position={[0.65, 0.1, 1.25]}>
            <Torus args={[0.35, 0.1, 32, 64]}>
              <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2.5} toneMapped={false} />
            </Torus>
            {/* Black pupil inside the ring */}
            <Sphere args={[0.3, 32, 32]} position={[0, 0, -0.05]}>
              <meshBasicMaterial color="#000000" />
            </Sphere>
            {/* White reflection highlight dot */}
            <Sphere args={[0.08, 16, 16]} position={[0.15, 0.2, 0.05]}>
              <meshBasicMaterial color="#ffffff" />
            </Sphere>
          </group>
          
          {/* Mouth (Smile appears when cursor moves) */}
          <group ref={mouthRef} position={[0, -0.3, 1.22]} rotation={[0, 0, Math.PI]}>
            <Torus args={[0.25, 0.035, 16, 32, Math.PI]} rotation={[0, 0, 0]}>
              <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} />
            </Torus>
          </group>

          {/* Antenna */}
          <Cylinder args={[0.03, 0.03, 0.5]} position={[0, 1.3, -0.2]}>
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
          </Cylinder>
          <Sphere args={[0.06]} position={[0, 1.55, -0.2]}>
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} toneMapped={false} />
          </Sphere>
        </group>

        {/* === BODY & LIMBS (Wrapped for dancing) === */}
        <group ref={torsoRef}>
          {/* Neck Joint */}
          <Cylinder args={[0.2, 0.2, 0.4, 32]} position={[0, 0.5, 0]}>
            <meshPhysicalMaterial color="#1a1a1a" roughness={0.6} metalness={0.8} />
          </Cylinder>

          {/* Torso (Cute round pear/egg shape) */}
          <RoundedBox args={[1.7, 1.6, 1.5]} radius={0.7} smoothness={16} position={[0, -0.3, 0]}>
            <meshPhysicalMaterial color="#ffffff" roughness={0.15} metalness={0.1} clearcoat={0.5} />
          </RoundedBox>
          
          {/* Torso Accents (Chest plates) */}
          <RoundedBox args={[1.3, 1.0, 0.2]} radius={0.2} smoothness={8} position={[0, -0.1, 0.75]}>
            <meshPhysicalMaterial color="#e2e8f0" roughness={0.3} metalness={0.3} />
          </RoundedBox>
          <Cylinder args={[0.04, 0.04, 0.1]} position={[-0.3, -0.1, 0.86]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} />
          </Cylinder>
          <Cylinder args={[0.04, 0.04, 0.1]} position={[0.3, -0.1, 0.86]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} />
          </Cylinder>

          {/* === ARMS === */}
          <group ref={leftArmRef} position={[-1.0, 0, 0]}>
            {/* Shoulder Joint */}
            <Sphere args={[0.25]} position={[0, 0, 0]}>
              <meshPhysicalMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
            </Sphere>
            {/* Upper Arm */}
            <RoundedBox args={[0.35, 0.7, 0.35]} radius={0.15} position={[-0.4, -0.1, 0]} rotation={[0, 0, Math.PI / 6]}>
              <meshPhysicalMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </RoundedBox>
            {/* Hand */}
            <Sphere args={[0.22]} position={[-0.7, -0.5, 0]}>
              <meshPhysicalMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
            </Sphere>
            <group position={[-0.8, -0.6, 0.1]} rotation={[0, 0, Math.PI / 4]}>
               <RoundedBox args={[0.08, 0.25, 0.08]} radius={0.03} position={[-0.1, -0.1, 0]}><meshPhysicalMaterial color="#1a1a1a" metalness={0.9} /></RoundedBox>
               <RoundedBox args={[0.08, 0.25, 0.08]} radius={0.03} position={[0.0, -0.15, 0]}><meshPhysicalMaterial color="#1a1a1a" metalness={0.9} /></RoundedBox>
               <RoundedBox args={[0.08, 0.25, 0.08]} radius={0.03} position={[0.1, -0.1, 0]}><meshPhysicalMaterial color="#1a1a1a" metalness={0.9} /></RoundedBox>
            </group>
          </group>

          <group ref={rightArmRef} position={[1.0, 0, 0]}>
            {/* Shoulder */}
            <Sphere args={[0.25]} position={[0, 0, 0]}>
              <meshPhysicalMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
            </Sphere>
            {/* Upper Arm */}
            <RoundedBox args={[0.35, 0.7, 0.35]} radius={0.15} position={[0.3, -0.3, 0]} rotation={[0, 0, -Math.PI / 8]}>
              <meshPhysicalMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </RoundedBox>
            {/* Hand */}
            <Sphere args={[0.22]} position={[0.5, -0.7, 0]}>
              <meshPhysicalMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
            </Sphere>
          </group>

          {/* === LEGS === */}
          {/* Left Leg */}
          <group ref={leftLegRef} position={[-0.5, -1.3, 0]}>
            {/* Hip Joint */}
            <Sphere args={[0.22]} position={[0, 0.1, 0]}>
              <meshPhysicalMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
            </Sphere>
            {/* Foot */}
            <RoundedBox args={[0.65, 0.45, 0.8]} radius={0.2} position={[0, -0.3, 0.1]}>
              <meshPhysicalMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </RoundedBox>
            <RoundedBox args={[0.4, 0.1, 0.2]} radius={0.05} position={[0, -0.5, 0.4]}>
              <meshPhysicalMaterial color="#1a1a1a" metalness={0.9} />
            </RoundedBox>
          </group>

          {/* Right Leg */}
          <group ref={rightLegRef} position={[0.5, -1.3, 0]}>
            <Sphere args={[0.22]} position={[0, 0.1, 0]}>
              <meshPhysicalMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
            </Sphere>
            <RoundedBox args={[0.65, 0.45, 0.8]} radius={0.2} position={[0, -0.3, 0.1]}>
              <meshPhysicalMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </RoundedBox>
            <RoundedBox args={[0.4, 0.1, 0.2]} radius={0.05} position={[0, -0.5, 0.4]}>
              <meshPhysicalMaterial color="#1a1a1a" metalness={0.9} />
            </RoundedBox>
          </group>
        </group>
      </group>
    </Float>
  );
}

export function Scene3D({ isSplashActive = false }: { isSplashActive?: boolean }) {
  return (
    <Canvas
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
      camera={{ position: [0, 0, 10], fov: 40 }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={1.8} />
      <directionalLight position={[5, 10, 5]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-5, -5, -5]} intensity={1.5} color="#e0e7ff" />
      <FullBotModel isSplashActive={isSplashActive} />
    </Canvas>
  );
}
