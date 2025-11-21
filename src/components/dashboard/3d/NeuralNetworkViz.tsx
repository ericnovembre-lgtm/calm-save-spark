import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function NetworkNode({ position, active }: { position: [number, number, number]; active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && active) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.2);
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.2]} position={position}>
      <meshStandardMaterial
        color={active ? "#10b981" : "#6b7280"}
        emissive={active ? "#10b981" : "#000000"}
        emissiveIntensity={active ? 0.5 : 0}
      />
    </Sphere>
  );
}

export function NeuralNetworkViz() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 text-center">
        <p className="text-muted-foreground">3D visualization disabled (reduced motion)</p>
      </div>
    );
  }

  const inputNodes: [number, number, number][] = [[-3, 2, 0], [-3, 0, 0], [-3, -2, 0]];
  const hiddenNodes: [number, number, number][] = [[0, 2.5, 0], [0, 0.5, 0], [0, -1.5, 0]];
  const outputNode: [number, number, number] = [3, 0, 0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg h-[400px]"
    >
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Neural Network</h3>
        <p className="text-sm text-muted-foreground">Live AI prediction model</p>
      </div>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Input layer */}
        {inputNodes.map((pos, i) => (
          <NetworkNode key={`input-${i}`} position={pos} active={true} />
        ))}
        
        {/* Hidden layer */}
        {hiddenNodes.map((pos, i) => (
          <NetworkNode key={`hidden-${i}`} position={pos} active={i % 2 === 0} />
        ))}
        
        {/* Output node */}
        <NetworkNode position={outputNode} active={true} />

        {/* Connections */}
        {inputNodes.map((input, i) =>
          hiddenNodes.map((hidden, j) => (
            <Line
              key={`conn-input-${i}-hidden-${j}`}
              points={[input, hidden]}
              color="#3b82f6"
              lineWidth={1}
              transparent
              opacity={0.3}
            />
          ))
        )}
        
        {hiddenNodes.map((hidden, i) => (
          <Line
            key={`conn-hidden-${i}-output`}
            points={[hidden, outputNode]}
            color="#10b981"
            lineWidth={1}
            transparent
            opacity={0.3}
          />
        ))}
      </Canvas>
    </motion.div>
  );
}
