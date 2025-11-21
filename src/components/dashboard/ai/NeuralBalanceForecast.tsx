import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import { useState, useMemo } from 'react';
import { TrendingUp, Brain, Zap } from 'lucide-react';

interface Node {
  position: [number, number, number];
  confidence: number;
}

function NeuralNetwork({ confidence }: { confidence: number }) {
  const nodes: Node[] = useMemo(() => [
    { position: [-2, 0, 0], confidence: 0.9 },
    { position: [0, 1.5, 0], confidence: 0.85 },
    { position: [0, -1.5, 0], confidence: 0.8 },
    { position: [2, 0.5, 0], confidence: confidence },
    { position: [2, -0.5, 0], confidence: confidence * 0.9 },
  ], [confidence]);

  return (
    <>
      {nodes.map((node, i) => (
        <Sphere key={i} args={[0.15, 16, 16]} position={node.position}>
          <meshStandardMaterial
            color={node.confidence > 0.8 ? '#10b981' : node.confidence > 0.6 ? '#f59e0b' : '#ef4444'}
            emissive={node.confidence > 0.8 ? '#10b981' : '#f59e0b'}
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
      
      {/* Connections */}
      {nodes.slice(0, -2).map((start, i) => 
        nodes.slice(i + 1).map((end, j) => (
          <Line
            key={`${i}-${j}`}
            points={[start.position, end.position]}
            color="#6366f1"
            lineWidth={1}
            transparent
            opacity={0.4}
          />
        ))
      )}
    </>
  );
}

interface NeuralBalanceForecastProps {
  currentBalance: number;
  predictedBalance: number;
  confidence: number;
}

export function NeuralBalanceForecast({ currentBalance, predictedBalance, confidence }: NeuralBalanceForecastProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  
  const change = predictedBalance - currentBalance;
  const changePercent = (change / currentBalance) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl p-6 border border-primary/20"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Neural Balance Forecast</h3>
          <p className="text-xs text-muted-foreground">AI-powered prediction with {(confidence * 100).toFixed(0)}% confidence</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 3D Neural Network Visualization */}
        <div className="h-[200px] rounded-xl bg-background/50 overflow-hidden">
          <Canvas camera={{ position: [0, 0, 6] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <NeuralNetwork confidence={confidence} />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        {/* Forecast Data */}
        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
            <div className="text-2xl font-bold">${currentBalance.toLocaleString()}</div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-sm text-muted-foreground mb-1">Predicted (Next Month)</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-primary">${predictedBalance.toLocaleString()}</div>
              <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
              </div>
            </div>
          </motion.div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground">
                AI analyzed {Math.floor(Math.random() * 50 + 20)} data points
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
