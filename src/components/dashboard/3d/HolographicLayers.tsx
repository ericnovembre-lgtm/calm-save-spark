import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function DataLayer({ position, data, color }: { position: [number, number, number]; data: string; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {data}
      </Text>
    </group>
  );
}

export function HolographicLayers() {
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
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg h-[500px]"
    >
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Holographic Data Layers</h3>
        <p className="text-sm text-muted-foreground">3D financial data visualization</p>
      </div>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <DataLayer position={[0, 2, 0]} data="Income: $5,000" color="#10b981" />
        <DataLayer position={[0, 0, 0]} data="Expenses: $3,200" color="#ef4444" />
        <DataLayer position={[0, -2, 0]} data="Savings: $1,800" color="#3b82f6" />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </motion.div>
  );
}
