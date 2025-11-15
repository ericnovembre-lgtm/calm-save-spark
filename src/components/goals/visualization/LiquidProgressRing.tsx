import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LiquidProgressRingProps {
  progress: number;
  size?: number;
}

/**
 * Liquid fill animation for progress > 75%
 * Creates wave effect inside progress ring
 */
export const LiquidProgressRing = ({
  progress,
  size = 200
}: LiquidProgressRingProps) => {
  const [showLiquid, setShowLiquid] = useState(false);

  useEffect(() => {
    setShowLiquid(progress >= 75);
  }, [progress]);

  if (!showLiquid) return null;

  const waveHeight = (progress / 100) * size;

  return (
    <div 
      className="absolute inset-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      {/* Liquid fill */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ height: 0 }}
        animate={{ height: waveHeight }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'linear-gradient(180deg, hsl(var(--primary) / 0.3), hsl(var(--primary) / 0.1))'
        }}
      >
        {/* Animated waves */}
        <svg
          className="absolute top-0 left-0 w-full"
          style={{ transform: 'translateY(-50%)' }}
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,50 Q300,20 600,50 T1200,50 L1200,100 L0,100 Z"
            fill="hsl(var(--primary) / 0.2)"
            animate={{
              d: [
                "M0,50 Q300,20 600,50 T1200,50 L1200,100 L0,100 Z",
                "M0,50 Q300,80 600,50 T1200,50 L1200,100 L0,100 Z",
                "M0,50 Q300,20 600,50 T1200,50 L1200,100 L0,100 Z"
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Second wave layer */}
          <motion.path
            d="M0,60 Q300,30 600,60 T1200,60 L1200,100 L0,100 Z"
            fill="hsl(var(--primary) / 0.15)"
            animate={{
              d: [
                "M0,60 Q300,30 600,60 T1200,60 L1200,100 L0,100 Z",
                "M0,60 Q300,90 600,60 T1200,60 L1200,100 L0,100 Z",
                "M0,60 Q300,30 600,60 T1200,60 L1200,100 L0,100 Z"
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </svg>

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/40"
            initial={{ 
              x: Math.random() * size,
              y: waveHeight 
            }}
            animate={{
              y: [waveHeight, waveHeight - 50, waveHeight],
              x: [
                Math.random() * size,
                Math.random() * size,
                Math.random() * size
              ]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
