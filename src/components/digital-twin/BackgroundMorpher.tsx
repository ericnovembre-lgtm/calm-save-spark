import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface BackgroundMorpherProps {
  netWorth: number;
}

type SceneType = 'starter' | 'growth' | 'prosperity' | 'freedom';

export function BackgroundMorpher({ netWorth }: BackgroundMorpherProps) {
  const scene: SceneType = useMemo(() => {
    if (netWorth >= 1000000) return 'freedom';
    if (netWorth >= 500000) return 'prosperity';
    if (netWorth >= 100000) return 'growth';
    return 'starter';
  }, [netWorth]);

  const sceneConfigs = {
    starter: {
      gradient: 'radial-gradient(circle at 30% 50%, hsla(var(--muted) / 0.2) 0%, transparent 50%)',
      particles: 20,
      color: 'hsla(var(--muted-foreground) / 0.3)',
    },
    growth: {
      gradient: 'radial-gradient(circle at 50% 50%, hsla(var(--accent) / 0.15) 0%, transparent 50%)',
      particles: 40,
      color: 'hsla(var(--accent) / 0.4)',
    },
    prosperity: {
      gradient: 'radial-gradient(circle at 60% 40%, hsla(var(--accent) / 0.25) 0%, transparent 50%)',
      particles: 60,
      color: 'hsla(var(--accent) / 0.5)',
    },
    freedom: {
      gradient: 'radial-gradient(circle at 50% 50%, hsla(var(--accent) / 0.3) 0%, transparent 60%)',
      particles: 80,
      color: 'hsla(var(--accent) / 0.6)',
    },
  };

  const config = sceneConfigs[scene];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scene}
        className="fixed inset-0 -z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: config.gradient,
          }}
        />

        {/* Floating abstract shapes */}
        {Array.from({ length: config.particles }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: config.color,
              filter: 'blur(40px)',
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, Math.random() * 0.5 + 0.8, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Scene label */}
        <motion.div
          className="absolute top-8 left-8 text-xs font-mono text-muted-foreground"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          ENVIRONMENT: {scene.toUpperCase()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
