import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text3D, Center } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PRICING_TIERS } from '@/components/pricing/TierBadge';

interface Pricing3DDiscProps {
  selectedAmount: number;
  onSelectAmount: (amount: number) => void;
}

function TierSegment({ tier, index, total, isSelected, onClick }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const targetY = hovered ? 0.3 : isSelected ? 0.15 : 0;
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        0.1
      );
    }
  });

  const angle = (index / total) * Math.PI * 2;
  const nextAngle = ((index + 1) / total) * Math.PI * 2;
  
  const colorMap: Record<string, string> = {
    Starter: '#94a3b8',
    Enhanced: '#60a5fa',
    Premium: '#a78bfa',
    Advanced: '#f472b6',
    Enterprise: '#fb923c',
  };

  return (
    <mesh
      ref={meshRef}
      rotation={[0, angle, 0]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <cylinderGeometry args={[2, 2, 0.2, 32, 1, false, angle, (nextAngle - angle)]} />
      <meshStandardMaterial
        color={colorMap[tier.name] || '#60a5fa'}
        emissive={colorMap[tier.name] || '#60a5fa'}
        emissiveIntensity={hovered ? 0.4 : isSelected ? 0.2 : 0.1}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function RotatingDisc({ selectedAmount, onSelectAmount }: Pricing3DDiscProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {PRICING_TIERS.map((tier, idx) => (
        <TierSegment
          key={tier.name}
          tier={tier}
          index={idx}
          total={PRICING_TIERS.length}
          isSelected={selectedAmount >= tier.minAmount && selectedAmount <= tier.maxAmount}
          onClick={() => onSelectAmount(Math.floor((tier.minAmount + tier.maxAmount) / 2))}
        />
      ))}
    </group>
  );
}

export function Pricing3DDisc({ selectedAmount, onSelectAmount }: Pricing3DDiscProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="h-64 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <p className="text-muted-foreground">Interactive 3D view</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-64 rounded-xl overflow-hidden border border-border/50"
    >
      <Canvas camera={{ position: [0, 3, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <RotatingDisc selectedAmount={selectedAmount} onSelectAmount={onSelectAmount} />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </motion.div>
  );
}
