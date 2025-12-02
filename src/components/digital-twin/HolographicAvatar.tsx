import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface HolographicAvatarProps {
  healthState: 'thriving' | 'neutral' | 'struggling';
  onEventDrop?: { type: 'positive' | 'negative'; timestamp: number } | null;
}

function WireframeHuman({ 
  healthState, 
  onEventDrop 
}: { 
  healthState: 'thriving' | 'neutral' | 'struggling';
  onEventDrop?: { type: 'positive' | 'negative'; timestamp: number } | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glitchOffset = useRef(0);
  const reactionProgress = useRef(0);

  const colors = {
    thriving: new THREE.Color('#00ffff'),
    neutral: new THREE.Color('hsl(var(--primary))'),
    struggling: new THREE.Color('#ff0066'),
  };

  const color = colors[healthState];
  const shouldGlitch = healthState === 'struggling';

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Handle reaction animations
    if (onEventDrop && reactionProgress.current < 1) {
      reactionProgress.current += 0.05;
      
      if (onEventDrop.type === 'positive') {
        // Celebrate: scale up and glow
        const scale = 1 + Math.sin(reactionProgress.current * Math.PI) * 0.3;
        groupRef.current.scale.set(scale, scale, scale);
      } else {
        // Wince: shake and dim
        const shake = Math.sin(reactionProgress.current * Math.PI * 8) * 0.1;
        groupRef.current.position.x = shake;
        groupRef.current.rotation.z = shake * 0.2;
      }
      
      if (reactionProgress.current >= 1) {
        groupRef.current.scale.set(1, 1, 1);
        groupRef.current.position.x = 0;
        groupRef.current.rotation.z = 0;
      }
    } else if (shouldGlitch) {
      glitchOffset.current = Math.sin(state.clock.elapsedTime * 10) * 0.02;
      groupRef.current.position.x = glitchOffset.current;
      groupRef.current.rotation.y += 0.005;
    } else {
      groupRef.current.rotation.y += 0.002;
    }
  });

  // Reset reaction on new event
  useEffect(() => {
    if (onEventDrop) {
      reactionProgress.current = 0;
    }
  }, [onEventDrop?.timestamp]);

  // Create wireframe humanoid structure
  const wireframeMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color,
        opacity: healthState === 'struggling' ? 0.6 : 1,
        transparent: true,
      }),
    [color, healthState]
  );

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={color} wireframe opacity={0.8} transparent />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 1.2, 0.4]} />
        <meshBasicMaterial color={color} wireframe opacity={0.8} transparent />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.5, 0.8, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8]} />
        <meshBasicMaterial color={color} wireframe opacity={0.8} transparent />
      </mesh>
      <mesh position={[0.5, 0.8, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8]} />
        <meshBasicMaterial color={color} wireframe opacity={0.8} transparent />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.2, -0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshBasicMaterial color={color} wireframe opacity={0.8} transparent />
      </mesh>
      <mesh position={[0.2, -0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshBasicMaterial color={color} wireframe opacity={0.8} transparent />
      </mesh>

      {/* Orbiting data points */}
      {[0, 1, 2, 3, 4].map((i) => (
        <DataPoint key={i} angle={i * (Math.PI * 2) / 5} color={color} />
      ))}
    </group>
  );
}

function DataPoint({ angle, color }: { angle: number; color: THREE.Color }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.elapsedTime;
    ref.current.position.x = Math.cos(angle + time * 0.5) * 2;
    ref.current.position.y = Math.sin(time * 0.3) * 0.5 + 0.5;
    ref.current.position.z = Math.sin(angle + time * 0.5) * 2;
  });

  return (
    <Sphere ref={ref} args={[0.05, 8, 8]}>
      <meshBasicMaterial color={color} />
    </Sphere>
  );
}

export function HolographicAvatar({ healthState, onEventDrop }: HolographicAvatarProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff0066" />
        
        <WireframeHuman healthState={healthState} onEventDrop={onEventDrop} />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
