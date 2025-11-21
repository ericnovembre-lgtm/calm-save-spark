import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.5, 0.7, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <Points ref={pointsRef} positions={particles.positions} colors={particles.colors}>
      <PointMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </Points>
  );
}

export function QuantumParticleField() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 text-center">
        <p className="text-muted-foreground">3D visualization disabled (reduced motion)</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg h-[400px]"
    >
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Quantum Particle Field</h3>
        <p className="text-sm text-muted-foreground">Real-time transaction visualization</p>
      </div>
      <div className="h-full bg-gradient-to-b from-background to-accent/20">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <ParticleField />
        </Canvas>
      </div>
    </motion.div>
  );
}
