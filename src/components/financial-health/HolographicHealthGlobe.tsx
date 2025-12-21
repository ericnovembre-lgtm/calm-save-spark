import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars, Ring } from '@react-three/drei';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface HolographicHealthGlobeProps {
  score: number;
  trend?: number;
}

// Electron ring component
function ElectronRing({ 
  score, 
  color, 
  radius, 
  tilt, 
  speedMultiplier 
}: { 
  score: number; 
  color: THREE.Color;
  radius: number;
  tilt: number;
  speedMultiplier: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  // Rotation speed based on score (higher score = slower = more stable)
  const baseSpeed = score > 70 ? 0.003 : score > 50 ? 0.006 : 0.01;
  const speed = baseSpeed * speedMultiplier;

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z += speed;
    }
  });

  return (
    <group rotation={[tilt, 0, 0]}>
      <Ring
        ref={ringRef}
        args={[radius - 0.05, radius + 0.05, 64]}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </Ring>
    </group>
  );
}

function RotatingGlobe({ score }: { score: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const getColorFromScore = (score: number): THREE.Color => {
    if (score >= 81) return new THREE.Color('#10b981'); // green
    if (score >= 61) return new THREE.Color('#3b82f6'); // blue
    if (score >= 41) return new THREE.Color('#eab308'); // yellow
    return new THREE.Color('#ef4444'); // red
  };

  const color = useMemo(() => getColorFromScore(score), [score]);

  // Create orbit particles
  const particles = useMemo(() => {
    const count = Math.floor(score / 2);
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2.8 + Math.random() * 0.5;
      
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

    if (glowRef.current) {
      // Breathing glow effect
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 1;
      glowRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <>
      <Stars radius={100} depth={50} count={800} factor={4} saturation={0} fade speed={0.5} />
      
      {/* Outer glow sphere */}
      <Sphere ref={glowRef} args={[2.3, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
        />
      </Sphere>

      {/* Main core globe */}
      <Sphere ref={meshRef} args={[1.8, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.25}
          speed={1.2}
          roughness={0.15}
          metalness={0.9}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Electron Ring 1 - Equatorial, slow */}
      <ElectronRing
        score={score}
        color={color}
        radius={2.5}
        tilt={Math.PI / 2}
        speedMultiplier={1}
      />

      {/* Electron Ring 2 - Tilted, faster */}
      <ElectronRing
        score={score}
        color={color}
        radius={2.7}
        tilt={Math.PI / 3}
        speedMultiplier={1.5}
      />

      {/* Electron Ring 3 - Opposite tilt */}
      <ElectronRing
        score={score}
        color={color}
        radius={2.6}
        tilt={-Math.PI / 4}
        speedMultiplier={0.8}
      />

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
          size={0.04}
          color={color}
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>

      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color={color} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />
      <pointLight position={[0, 10, -10]} intensity={0.3} color="#ffffff" />
    </>
  );
}

// Score display with parallax effect
function ParallaxScore({ score, rating }: { score: number; rating: { label: string; color: string } }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  // Spring-based smooth parallax
  const x = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 });
  const y = useSpring(useMotionValue(0), { stiffness: 100, damping: 30 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const offsetX = (e.clientX - centerX) / centerX;
      const offsetY = (e.clientY - centerY) / centerY;
      
      x.set(offsetX * 15);
      y.set(offsetY * 10);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion, x, y]);

  return (
    <motion.div
      className="text-center"
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={`text-7xl font-bold ${rating.color} drop-shadow-2xl`}
        style={{
          textShadow: '0 0 40px currentColor, 0 0 80px currentColor',
        }}
      >
        {score}
      </motion.div>
      <motion.div 
        className="text-sm text-muted-foreground mt-2 tracking-widest uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Financial Health Score
      </motion.div>
    </motion.div>
  );
}

export const HolographicHealthGlobe = ({ score, trend = 0 }: HolographicHealthGlobeProps) => {
  const prefersReducedMotion = useReducedMotion();

  const getScoreRating = (score: number) => {
    if (score >= 81) return { label: "Excellent", color: "text-green-500" };
    if (score >= 61) return { label: "Good", color: "text-blue-500" };
    if (score >= 41) return { label: "Fair", color: "text-yellow-500" };
    return { label: "Poor", color: "text-red-500" };
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
      <div className="relative w-full h-[450px] rounded-3xl overflow-hidden bg-gradient-to-br from-background/80 via-background/50 to-primary/5 backdrop-blur-xl border border-border/30">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <RotatingGlobe score={score} />
        </Canvas>
        
        {/* Score overlay with parallax */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <ParallaxScore score={score} rating={rating} />
        </div>

        {/* Scanline effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)',
          }}
        />
      </div>

      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <p className={`text-2xl font-semibold ${rating.color}`}>{rating.label}</p>
        {trend !== 0 && (
          <motion.div 
            className="flex items-center justify-center gap-2 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              trend > 0 
                ? 'text-green-600 bg-green-500/10' 
                : 'text-red-600 bg-red-500/10'
            }`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)} points this month
            </span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
