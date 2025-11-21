import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Trail, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { Target, Clock, TrendingUp } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  daysLeft: number;
}

interface PlanetProps {
  goal: Goal;
  orbitRadius: number;
  speed: number;
  color: string;
  onClick: (goal: Goal) => void;
}

function Planet({ goal, orbitRadius, speed, color, onClick }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const size = 0.3 + (goal.current / goal.target) * 0.5;
  const progress = goal.current / goal.target;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * speed;
      meshRef.current.position.x = Math.cos(t) * orbitRadius;
      meshRef.current.position.z = Math.sin(t) * orbitRadius;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      <Trail
        width={2}
        length={10}
        color={color}
        attenuation={(t) => t * t}
      >
        <mesh
          ref={meshRef}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={() => onClick(goal)}
          scale={hovered ? 1.2 : 1}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={progress > 0.8 ? 0.5 : 0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </Trail>
      
      {hovered && (
        <Text
          position={[0, size + 0.5, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {goal.name}
        </Text>
      )}
    </group>
  );
}

function CentralSun({ balance }: { balance: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color="#f59e0b"
        emissive="#f59e0b"
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}

interface FinancialUniverseProps {
  totalBalance: number;
  goals: Goal[];
}

export function FinancialUniverse({ totalBalance, goals }: FinancialUniverseProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const planetColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-2xl p-6 border border-border"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-1">Financial Universe</h3>
        <p className="text-sm text-muted-foreground">Your goals orbit around your total balance</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 3D Universe */}
        <div className="lg:col-span-2 h-[400px] rounded-xl bg-gradient-to-br from-background via-primary/5 to-accent/5 overflow-hidden">
          <Canvas camera={{ position: [0, 5, 10] }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[0, 0, 0]} intensity={2} color="#f59e0b" />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
            
            {/* Central Sun (Total Balance) */}
            <CentralSun balance={totalBalance} />
            
            {/* Orbiting Planets (Goals) */}
            {goals.map((goal, i) => (
              <Planet
                key={goal.id}
                goal={goal}
                orbitRadius={3 + i * 1.5}
                speed={0.5 - i * 0.1}
                color={planetColors[i % planetColors.length]}
                onClick={setSelectedGoal}
              />
            ))}
            
            <OrbitControls enableZoom={true} minDistance={5} maxDistance={20} />
          </Canvas>
        </div>

        {/* Goal Details */}
        <div className="space-y-4">
          {selectedGoal ? (
            <motion.div
              key={selectedGoal.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20"
            >
              <h4 className="font-semibold mb-3">{selectedGoal.name}</h4>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Progress</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">${selectedGoal.current.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">/ ${selectedGoal.target.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(selectedGoal.current / selectedGoal.target) * 100}%` }}
                      className="h-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedGoal.daysLeft} days left</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-green-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>On track</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click a planet to view goal details</p>
            </div>
          )}

          {/* Legend */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Your Goals
            </div>
            {goals.map((goal, i) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedGoal(goal)}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: planetColors[i % planetColors.length] }}
                />
                <span className="text-sm">{goal.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
