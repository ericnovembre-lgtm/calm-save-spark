import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AegisShieldProps {
  securityScore: number;
  className?: string;
}

type ShieldState = 'safe' | 'vulnerable' | 'critical';

function getShieldState(score: number): ShieldState {
  if (score >= 70) return 'safe';
  if (score >= 40) return 'vulnerable';
  return 'critical';
}

function getShieldColor(state: ShieldState): string {
  switch (state) {
    case 'safe': return '#10b981'; // emerald
    case 'vulnerable': return '#f59e0b'; // amber
    case 'critical': return '#ef4444'; // red
  }
}

function getStateLabel(state: ShieldState): string {
  switch (state) {
    case 'safe': return 'Protected';
    case 'vulnerable': return 'Vulnerable';
    case 'critical': return 'Critical';
  }
}

// 3D Shield Mesh Component
function ShieldMesh({ state, score }: { state: ShieldState; score: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  const color = useMemo(() => new THREE.Color(getShieldColor(state)), [state]);
  
  // Rotation and effects
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Base rotation speed varies by state
      const speed = state === 'safe' ? 0.2 : state === 'vulnerable' ? 0.4 : 0.6;
      meshRef.current.rotation.y += delta * speed;
      
      // Glitch effect for vulnerable/critical states
      if (state !== 'safe' && Math.random() > 0.98) {
        meshRef.current.rotation.x += (Math.random() - 0.5) * 0.1;
      }
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y += delta * 0.15;
      wireframeRef.current.rotation.x += delta * 0.05;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.1;
      // Pulse effect
      const pulse = Math.sin(Date.now() * 0.002) * 0.05;
      glowRef.current.scale.setScalar(1.3 + pulse);
    }
  });

  const distortionAmount = state === 'safe' ? 0.1 : state === 'vulnerable' ? 0.2 : 0.35;

  return (
    <group>
      {/* Outer glow sphere */}
      <mesh ref={glowRef} scale={1.3}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.08}
          wireframe
        />
      </mesh>

      {/* Main shield - icosahedron for geometric look */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 2]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.6}
          distort={distortionAmount}
          speed={state === 'safe' ? 1 : 3}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={wireframeRef}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshBasicMaterial 
          color={color} 
          wireframe 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* Inner core glow */}
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.4}
        />
      </mesh>

      {/* Orbiting rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.01, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.5, 0.01, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Fallback for reduced motion
function StaticShield({ state }: { state: ShieldState }) {
  const color = getShieldColor(state);
  
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer glow */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl opacity-30"
        style={{ backgroundColor: color }}
      />
      {/* Shield icon */}
      <svg 
        viewBox="0 0 24 24" 
        className="w-32 h-32"
        style={{ color }}
      >
        <path 
          fill="currentColor" 
          d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
        />
      </svg>
    </div>
  );
}

export function AegisShield({ securityScore, className = '' }: AegisShieldProps) {
  const prefersReducedMotion = useReducedMotion();
  const state = getShieldState(securityScore);
  const stateLabel = getStateLabel(state);
  const color = getShieldColor(state);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div 
            className={`relative ${className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Background glow effect */}
            <div 
              className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: color }}
            />
            
            {/* Shield container */}
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              {prefersReducedMotion ? (
                <div className="w-full h-full flex items-center justify-center">
                  <StaticShield state={state} />
                </div>
              ) : (
                <Canvas
                  camera={{ position: [0, 0, 4], fov: 50 }}
                  style={{ background: 'transparent' }}
                >
                  <ambientLight intensity={0.4} />
                  <pointLight position={[10, 10, 10]} intensity={1} color={color} />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} color={color} />
                  <ShieldMesh state={state} score={securityScore} />
                  <OrbitControls 
                    enableZoom={false} 
                    enablePan={false}
                    autoRotate={false}
                    maxPolarAngle={Math.PI / 1.5}
                    minPolarAngle={Math.PI / 3}
                  />
                </Canvas>
              )}
            </div>

            {/* Status badge */}
            <motion.div 
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full border backdrop-blur-xl"
              style={{ 
                backgroundColor: `${color}20`,
                borderColor: `${color}40`,
                boxShadow: `0 0 20px ${color}30`
              }}
              animate={state !== 'safe' ? {
                boxShadow: [
                  `0 0 20px ${color}30`,
                  `0 0 40px ${color}50`,
                  `0 0 20px ${color}30`
                ]
              } : undefined}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span 
                className="text-sm font-mono font-semibold"
                style={{ color }}
              >
                {stateLabel.toUpperCase()}
              </span>
            </motion.div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-slate-900/95 backdrop-blur-xl border-white/10 p-4 max-w-xs"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="font-semibold text-white">Security Health Report</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span 
                className="text-3xl font-mono font-bold"
                style={{ color }}
              >
                {securityScore}
              </span>
              <span className="text-white/60 text-sm">/ 100</span>
            </div>
            <p className="text-xs text-white/50">
              {state === 'safe' && 'All security measures are active. Your assets are protected.'}
              {state === 'vulnerable' && 'Some security features need attention. Enable 2FA and review active sessions.'}
              {state === 'critical' && 'Critical security issues detected! Take immediate action to protect your account.'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
