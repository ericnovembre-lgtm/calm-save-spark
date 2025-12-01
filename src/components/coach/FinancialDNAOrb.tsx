import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import { useGesture } from "@use-gesture/react";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { coachSounds } from "@/lib/coach-sounds";
import { OrbFullscreenModal } from "./OrbFullscreenModal";
import { Maximize2 } from "lucide-react";

type HealthState = "stable" | "warning" | "critical";

interface FinancialDNAOrbProps {
  state: HealthState;
  insight: string;
}

function DNAOrb({ state: healthState, rotation }: { state: HealthState; rotation: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const colorMap = {
    stable: "#10b981",    // Emerald
    warning: "#f59e0b",   // Amber
    critical: "#f43f5e",  // Rose
  };

  const speedMap = {
    stable: 0.5,
    warning: 1.2,
    critical: 2.0,
  };

  const distortMap = {
    stable: 0.15,
    warning: 0.25,
    critical: 0.4,
  };

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Apply manual rotation from drag gesture
      meshRef.current.rotation.x = rotation.x + time * 0.05 * speedMap[healthState];
      meshRef.current.rotation.y = rotation.y + time * 0.1 * speedMap[healthState];
      
      // Breathing effect for critical state
      if (healthState === "critical") {
        const scale = 1 + Math.sin(time * 3) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.2, 64, 64]}>
      <MeshDistortMaterial
        color={colorMap[healthState]}
        attach="material"
        distort={distortMap[healthState]}
        speed={speedMap[healthState]}
        roughness={0.2}
        metalness={0.8}
        emissive={colorMap[healthState]}
        emissiveIntensity={0.5}
      />
    </Sphere>
  );
}

// Particle field orbiting the DNA orb
function ParticleField({ state }: { state: HealthState }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = state === "critical" ? 200 : state === "warning" ? 150 : 100;
  
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 1.8 + Math.random() * 0.6;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, [particleCount]);

  useFrame((frameState) => {
    if (particlesRef.current) {
      const time = frameState.clock.getElapsedTime();
      particlesRef.current.rotation.y = time * 0.1;
      
      if (state === "critical") {
        // Erratic rotation for critical state
        particlesRef.current.rotation.x = Math.sin(time * 2) * 0.5;
      }
    }
  });

  return (
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
        size={0.02}
        color={state === "critical" ? "#f43f5e" : state === "warning" ? "#f59e0b" : "#10b981"}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export function FinancialDNAOrb({ state, insight }: FinancialDNAOrbProps) {
  const prevStateRef = useRef<HealthState>(state);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  useEffect(() => {
    // Play sound on state change
    if (prevStateRef.current !== state) {
      if (state === "critical") {
        coachSounds.playStateCritical();
      } else if (state === "warning") {
        coachSounds.playStateWarning();
      }
      prevStateRef.current = state;
    }
  }, [state]);

  // Drag gesture for rotation
  const bind = useGesture(
    {
      onDrag: ({ delta: [dx, dy] }) => {
        setRotation((prev) => ({
          x: prev.x + dy * 0.01,
          y: prev.y + dx * 0.01,
        }));
      },
    },
    { target: canvasRef }
  );

  const handleExpand = () => {
    coachSounds.playOrbExpand();
    setIsFullscreenOpen(true);
  };

  const stateLabels = {
    stable: "Optimizing for Growth",
    warning: "Attention Needed",
    critical: "Critical Action Required",
  };

  return (
    <>
      <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-command-surface border border-white/10 group">
        {/* Expand Button */}
        <button
          onClick={handleExpand}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </button>

        {/* 3D Canvas with drag and glitch effect */}
        <div
          ref={canvasRef}
          className={`w-full h-full cursor-grab active:cursor-grabbing touch-none ${
            state === "critical" ? "animate-glitch" : ""
          }`}
        >
          <Canvas camera={{ position: [0, 0, 2.2], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <DNAOrb state={state} rotation={rotation} />
            <ParticleField state={state} />
          </Canvas>
        </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 right-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono ${
              state === "critical"
                ? "bg-command-rose/20 text-command-rose border border-command-rose/30"
                : state === "warning"
                ? "bg-command-amber/20 text-command-amber border border-command-amber/30"
                : "bg-command-emerald/20 text-command-emerald border border-command-emerald/30"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              state === "critical" ? "bg-command-rose animate-breathing" :
              state === "warning" ? "bg-command-amber animate-breathing" :
              "bg-command-emerald"
            }`} />
            {stateLabels[state]}
          </motion.div>
        </div>

        {/* Typewriter Insight */}
        <div className="absolute bottom-4 left-4 right-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-command-bg/90 backdrop-blur-sm border border-white/10 rounded-lg p-4"
          >
            <TypewriterText 
              text={insight}
              speed={30}
              className="text-sm text-white leading-relaxed font-mono"
            />
          </motion.div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <OrbFullscreenModal
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        state={state}
      />
    </>
  );
}
