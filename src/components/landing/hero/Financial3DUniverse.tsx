import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, OrbitControls } from '@react-three/drei';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import * as THREE from 'three';

function FloatingCoin({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.001;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial 
          color="hsl(var(--primary))" 
          metalness={0.8} 
          roughness={0.2}
          emissive="hsl(var(--primary))"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

function DollarSign({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.3, 1, 0.1]} />
        <meshStandardMaterial 
          color="hsl(var(--accent))" 
          metalness={0.7}
          roughness={0.3}
          emissive="hsl(var(--accent))"
          emissiveIntensity={0.4}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  const coins = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 5
      ] as [number, number, number]
    }));
  }, []);

  const dollars = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 4
      ] as [number, number, number]
    }));
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="hsl(var(--primary))" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="hsl(var(--accent))" />
      
      <Sparkles 
        count={100} 
        scale={15} 
        size={2} 
        speed={0.3}
        color="hsl(var(--primary))"
      />
      
      {coins.map((coin) => (
        <FloatingCoin key={coin.id} position={coin.position} />
      ))}
      
      {dollars.map((dollar) => (
        <DollarSign key={dollar.id} position={dollar.position} />
      ))}
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function Financial3DUniverse() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
