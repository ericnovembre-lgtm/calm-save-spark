import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MoodThemingProps {
  budgetHealth: 'excellent' | 'good' | 'warning' | 'critical';
  children: React.ReactNode;
}

const moodColors = {
  excellent: {
    primary: 'hsl(142 76% 36%)',
    glow: 'rgba(34, 197, 94, 0.2)',
    particles: 'hsl(142 76% 56%)',
  },
  good: {
    primary: 'hsl(221 83% 53%)',
    glow: 'rgba(59, 130, 246, 0.2)',
    particles: 'hsl(221 83% 63%)',
  },
  warning: {
    primary: 'hsl(48 96% 53%)',
    glow: 'rgba(234, 179, 8, 0.2)',
    particles: 'hsl(48 96% 63%)',
  },
  critical: {
    primary: 'hsl(0 84% 60%)',
    glow: 'rgba(239, 68, 68, 0.2)',
    particles: 'hsl(0 84% 70%)',
  },
};

export const MoodTheming = ({ budgetHealth, children }: MoodThemingProps) => {
  const [mood, setMood] = useState(moodColors[budgetHealth]);

  useEffect(() => {
    setMood(moodColors[budgetHealth]);
  }, [budgetHealth]);

  return (
    <div className="relative">
      {/* Ambient glow overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={budgetHealth}
          className="fixed inset-0 pointer-events-none z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Corner glows */}
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[120px]"
            style={{ backgroundColor: mood.glow }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[120px]"
            style={{ backgroundColor: mood.glow }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Floating mood particles */}
      <AnimatePresence mode="wait">
        <motion.div
          key={budgetHealth}
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        >
          {[...Array(20)].map((_, i) => {
            const startX = Math.random() * 100;
            const startY = 100 + Math.random() * 20;
            const endY = -20 - Math.random() * 20;
            const duration = 10 + Math.random() * 10;
            const delay = Math.random() * 5;

            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: mood.particles,
                  boxShadow: `0 0 10px ${mood.particles}`,
                  left: `${startX}%`,
                }}
                initial={{ 
                  y: `${startY}%`,
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  y: `${endY}%`,
                  opacity: [0, 0.8, 0.8, 0],
                  scale: [0, 1, 1, 0],
                  x: [0, Math.sin(i) * 50, 0],
                }}
                transition={{
                  duration,
                  delay,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
