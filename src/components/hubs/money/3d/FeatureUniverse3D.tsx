import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FeatureSphere {
  position: [number, number, number];
  title: string;
  color: string;
}

function FeatureNode({ position, title, color }: FeatureSphere) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>
    </group>
  );
}

export function FeatureUniverse3D() {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    return null;
  }

  const features: FeatureSphere[] = [
    { position: [2, 0, 0], title: 'Budget', color: '#3b82f6' },
    { position: [-2, 0.5, 0], title: 'Transactions', color: '#10b981' },
    { position: [0, 0, 2], title: 'Automations', color: '#f59e0b' },
    { position: [0, 0, -2], title: 'Debts', color: '#ef4444' },
    { position: [1.5, 1.5, 1], title: 'Pots', color: '#eab308' },
    { position: [-1.5, -0.5, -1], title: 'Subscriptions', color: '#a855f7' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-96 w-full mb-8 rounded-3xl overflow-hidden bg-gradient-to-b from-background to-muted"
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        
        {features.map((feature, i) => (
          <FeatureNode key={i} {...feature} />
        ))}
        
        {/* Connection lines */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={features.length * 2}
              array={new Float32Array(features.flatMap(f => [0, 0, 0, ...f.position]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ffffff" opacity={0.2} transparent />
        </lineSegments>
      </Canvas>
    </motion.div>
  );
}
