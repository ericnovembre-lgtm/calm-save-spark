import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakFlameProps {
  streak: number;
  maxStreak?: number;
}

/**
 * Animated flame showing current streak
 * Grows with streak, freezes on break
 */
export const StreakFlame = ({ streak, maxStreak = 365 }: StreakFlameProps) => {
  const intensity = Math.min(streak / maxStreak, 1);
  const size = 40 + (intensity * 40); // 40-80px

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Flame
          size={size}
          className="text-primary drop-shadow-lg"
          fill="currentColor"
        />
        
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.6), transparent 70%)'
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Streak count */}
      <motion.div
        className="mt-2 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-2xl font-bold text-foreground">{streak}</div>
        <div className="text-xs text-muted-foreground">Day Streak</div>
      </motion.div>

      {/* Particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/60"
          style={{
            left: '50%',
            top: '50%'
          }}
          animate={{
            y: [-20, -60],
            x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30],
            opacity: [1, 0],
            scale: [1, 0.5]
          }}
          transition={{
            duration: 1 + Math.random(),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};
