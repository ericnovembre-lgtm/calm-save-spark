import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface HolographicHealthGlobeProps {
  score: number;
  trend?: number;
}

function RotatingGlobe({ score }: { score: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const getColorFromScore = (score: number): THREE.Color => {
    if (score >= 81) return new THREE.Color('#10b981'); // green
    if (score >= 61) return new THREE.Color('#3b82f6'); // blue
    if (score >= 41) return new THREE.Color('#eab308'); // yellow
    return new THREE.Color('#ef4444'); // red
  };

  const color = useMemo(() => getColorFromScore(score), [score]);

  // Create orbit particles
  const particles = useMemo(() => {
    const count = Math.floor(score / 2); // More particles for higher scores
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2.5 + Math.random() * 0.5;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, [score]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
      particlesRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <>
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      
      {/* Main globe */}
      <Sphere ref={meshRef} args={[2, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Orbit particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color={color}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color={color} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </>
  );
}

export const HolographicHealthGlobe = ({ score, trend = 0 }: HolographicHealthGlobeProps) => {
  const prefersReducedMotion = useReducedMotion();

  const getScoreRating = (score: number) => {
    if (score >= 81) return { label: "Excellent", color: "text-green-600 dark:text-green-400" };
    if (score >= 61) return { label: "Good", color: "text-blue-600 dark:text-blue-400" };
    if (score >= 41) return { label: "Fair", color: "text-yellow-600 dark:text-yellow-400" };
    return { label: "Poor", color: "text-red-600 dark:text-red-400" };
  };

  const rating = getScoreRating(score);

  if (prefersReducedMotion) {
    // Fallback to simple circular gauge for reduced motion
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative w-48 h-48">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${rating.color}`}>{score}</span>
            <span className="text-sm text-muted-foreground">out of 100</span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className={`text-2xl font-semibold ${rating.color}`}>{rating.label}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-background/50 to-accent/10 backdrop-blur-sm border border-border/50">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <RotatingGlobe score={score} />
        </Canvas>
        
        {/* Score overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className={`text-6xl font-bold ${rating.color} drop-shadow-2xl`}>
              {score}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Financial Health Score</div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className={`text-2xl font-semibold ${rating.color}`}>{rating.label}</p>
        {trend !== 0 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)} points this month
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
