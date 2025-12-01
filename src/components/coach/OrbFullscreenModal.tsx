import { motion } from "framer-motion";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

type HealthState = "stable" | "warning" | "critical";

interface OrbFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: HealthState;
}

function LargeOrb({ state }: { state: HealthState }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const colorMap = {
    stable: "#10b981",
    warning: "#f59e0b",
    critical: "#f43f5e",
  };

  const speedMap = {
    stable: 0.5,
    warning: 1.2,
    critical: 2.0,
  };

  useFrame((frameState) => {
    if (meshRef.current) {
      const time = frameState.clock.getElapsedTime();
      meshRef.current.rotation.x = time * 0.1 * speedMap[state];
      meshRef.current.rotation.y = time * 0.15 * speedMap[state];

      if (state === "critical") {
        const scale = 1 + Math.sin(time * 3) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <Sphere ref={meshRef} args={[2, 64, 64]}>
      <MeshDistortMaterial
        color={colorMap[state]}
        attach="material"
        distort={state === "critical" ? 0.4 : state === "warning" ? 0.25 : 0.15}
        speed={speedMap[state]}
        roughness={0.2}
        metalness={0.8}
        emissive={colorMap[state]}
        emissiveIntensity={0.5}
      />
    </Sphere>
  );
}

export function OrbFullscreenModal({ isOpen, onClose, state }: OrbFullscreenModalProps) {
  // Mock financial breakdown data
  const breakdown = [
    { category: "Spending", value: 2840, percentage: 45, trend: -5 },
    { category: "Savings", value: 1580, percentage: 25, trend: +12 },
    { category: "Investments", value: 950, percentage: 15, trend: +8 },
    { category: "Debts", value: 632, percentage: 10, trend: -3 },
    { category: "Bills", value: 316, percentage: 5, trend: 0 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] bg-command-bg border border-white/10 p-0">
        <div className="relative w-full h-full flex">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Left: 3D Canvas */}
          <div className="flex-1 relative">
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <LargeOrb state={state} />
            </Canvas>

            {/* State Label Overlay */}
            <div className="absolute top-4 left-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono ${
                  state === "critical"
                    ? "bg-command-rose/20 text-command-rose border border-command-rose/30"
                    : state === "warning"
                    ? "bg-command-amber/20 text-command-amber border border-command-amber/30"
                    : "bg-command-emerald/20 text-command-emerald border border-command-emerald/30"
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    state === "critical"
                      ? "bg-command-rose animate-breathing"
                      : state === "warning"
                      ? "bg-command-amber animate-breathing"
                      : "bg-command-emerald"
                  }`}
                />
                {state === "critical"
                  ? "Critical Action Required"
                  : state === "warning"
                  ? "Attention Needed"
                  : "Optimizing for Growth"}
              </motion.div>
            </div>
          </div>

          {/* Right: Breakdown Panel */}
          <div className="w-96 bg-command-surface border-l border-white/10 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold font-mono text-white mb-6">
              Financial Breakdown
            </h3>

            <div className="space-y-4">
              {breakdown.map((item, idx) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-white/80">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.trend !== 0 && (
                        <span
                          className={`text-xs font-mono flex items-center gap-1 ${
                            item.trend > 0
                              ? "text-command-emerald"
                              : "text-command-rose"
                          }`}
                        >
                          {item.trend > 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(item.trend)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold font-mono text-white">
                      ${item.value.toLocaleString()}
                    </span>
                    <span className="text-sm text-white/40 font-mono">
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className={`h-full ${
                        item.category === "Spending"
                          ? "bg-command-rose"
                          : item.category === "Savings"
                          ? "bg-command-emerald"
                          : "bg-command-cyan"
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-command-cyan/10 border border-command-cyan/30 rounded-lg">
              <p className="text-xs text-white/80 font-mono leading-relaxed">
                <strong className="text-command-cyan">Financial Health Tip:</strong>{" "}
                Your spending-to-savings ratio is optimal. Consider automating 10%
                of monthly income to investments.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
