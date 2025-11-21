import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { TrendingUp } from 'lucide-react';
import * as THREE from 'three';

interface BalanceSegment {
  name: string;
  amount: number;
  color: string;
}

interface BalanceSphereVisualizationProps {
  totalBalance: number;
  segments: BalanceSegment[];
}

function InteractiveSphere({ segments, onClick }: { segments: BalanceSegment[]; onClick: (segment: BalanceSegment) => void }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <group>
      {/* Main sphere */}
      <Sphere args={[2, 32, 32]} ref={sphereRef}>
        <meshStandardMaterial
          color="#6366f1"
          metalness={0.8}
          roughness={0.2}
          emissive="#6366f1"
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* Segment indicators */}
      {segments.map((segment, i) => {
        const angle = (i / segments.length) * Math.PI * 2;
        const x = Math.cos(angle) * 2.5;
        const z = Math.sin(angle) * 2.5;
        
        return (
          <Float
            key={i}
            speed={2}
            rotationIntensity={0.5}
            floatIntensity={0.5}
          >
            <group
              position={[x, 0, z]}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered(null)}
              onClick={() => onClick(segment)}
            >
              <Sphere args={[hovered === i ? 0.3 : 0.2, 16, 16]}>
                <meshStandardMaterial
                  color={segment.color}
                  emissive={segment.color}
                  emissiveIntensity={hovered === i ? 0.8 : 0.4}
                />
              </Sphere>
              {hovered === i && (
                <Text
                  position={[0, 0.5, 0]}
                  fontSize={0.3}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {segment.name}
                </Text>
              )}
            </group>
          </Float>
        );
      })}

      {/* Particle trail */}
      {segments.map((_, i) => {
        const angle = (i / segments.length) * Math.PI * 2;
        const x = Math.cos(angle) * 2.8;
        const z = Math.sin(angle) * 2.8;
        
        return (
          <mesh key={`particle-${i}`} position={[x, 0, z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

export function BalanceSphere({ totalBalance, segments }: BalanceSphereVisualizationProps) {
  const [selectedSegment, setSelectedSegment] = useState<BalanceSegment | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-2xl p-6 border border-border overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">Balance Sphere</h3>
          <p className="text-sm text-muted-foreground">Interactive 3D visualization</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
          <div className="text-sm text-green-500 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +12.5%
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 3D Sphere */}
        <div className="h-[300px] rounded-xl bg-gradient-to-br from-background to-muted overflow-hidden">
          <Canvas camera={{ position: [0, 0, 8] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
            <InteractiveSphere segments={segments} onClick={setSelectedSegment} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
          </Canvas>
        </div>

        {/* Segment Details */}
        <div className="space-y-3">
          {selectedSegment ? (
            <motion.div
              key={selectedSegment.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-muted rounded-xl p-4"
            >
              <h4 className="font-semibold mb-2">{selectedSegment.name}</h4>
              <div className="text-2xl font-bold mb-1">${selectedSegment.amount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                {((selectedSegment.amount / totalBalance) * 100).toFixed(1)}% of total
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Click on a segment to see details</p>
            </div>
          )}

          <div className="space-y-2">
            {segments.map((segment, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedSegment(segment)}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{segment.name}</div>
                  <div className="text-xs text-muted-foreground">
                    ${segment.amount.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
