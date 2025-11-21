import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Trophy, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import confetti from 'canvas-confetti';

export function GamifiedSavingsSimulator() {
  const prefersReducedMotion = useReducedMotion();
  const [balance, setBalance] = useState(0);
  const [level, setLevel] = useState(1);
  const [coinsDropped, setCoinsDropped] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dropCoin = () => {
    if (prefersReducedMotion) {
      setBalance(prev => prev + 10);
      setCoinsDropped(prev => prev + 1);
      return;
    }

    const increment = 10 * level;
    setBalance(prev => prev + increment);
    setCoinsDropped(prev => prev + 1);

    if (balance + increment >= level * 1000) {
      setLevel(prev => prev + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const startSimulation = () => {
    setIsSimulating(true);
    const interval = setInterval(() => {
      dropCoin();
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setIsSimulating(false);
    }, 5000);
  };

  const reset = () => {
    setBalance(0);
    setLevel(1);
    setCoinsDropped(0);
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
      className="bg-card rounded-2xl p-6 border border-border"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Savings Simulator
        </h3>
        <div className="flex items-center gap-2 text-primary font-semibold">
          <span>Level {level}</span>
        </div>
      </div>

      {/* Piggy bank area */}
      <div className="relative h-64 bg-gradient-to-b from-primary/5 to-accent/5 rounded-xl mb-6 flex items-end justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0" />
        
        {/* Balance display */}
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-6 py-3 rounded-full border border-primary/20"
          animate={prefersReducedMotion ? {} : { scale: balance > 0 ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{balance.toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Piggy bank */}
        <div className="text-8xl mb-8 filter drop-shadow-lg">🐷</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-primary/5 rounded-xl">
          <p className="text-2xl font-bold text-foreground">{coinsDropped}</p>
          <p className="text-xs text-muted-foreground">Coins Dropped</p>
        </div>
        <div className="text-center p-3 bg-primary/5 rounded-xl">
          <p className="text-2xl font-bold text-foreground">${(balance * 0.05).toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Interest Earned</p>
        </div>
        <div className="text-center p-3 bg-primary/5 rounded-xl">
          <p className="text-2xl font-bold text-foreground">{level * 10}x</p>
          <p className="text-xs text-muted-foreground">Multiplier</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button
          onClick={startSimulation}
          disabled={isSimulating}
          className="flex-1"
        >
          <Play className="w-4 h-4 mr-2" />
          {isSimulating ? 'Simulating...' : 'Start Simulation'}
        </Button>
        <Button onClick={reset} variant="outline">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Achievement notification */}
      {level > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center"
        >
          <p className="text-sm font-semibold text-primary">🎉 Level {level} Unlocked!</p>
        </motion.div>
      )}
    </motion.div>
  );
}
