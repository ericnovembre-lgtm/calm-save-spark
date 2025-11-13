import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ParticleEffect } from '@/components/effects/ParticleEffect';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showParticles?: boolean;
  onMilestone?: () => void;
}

export const ProgressRing = ({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  showParticles = false,
  onMilestone
}: ProgressRingProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [prevProgress, setPrevProgress] = useState(progress);
  const [triggerParticles, setTriggerParticles] = useState(false);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  // Detect milestone completions (every 25%)
  useEffect(() => {
    if (progress > prevProgress) {
      const prevMilestone = Math.floor(prevProgress / 25);
      const currentMilestone = Math.floor(progress / 25);
      
      if (currentMilestone > prevMilestone && showParticles) {
        setTriggerParticles(true);
        onMilestone?.();
        
        // Reset particle trigger after animation
        setTimeout(() => setTriggerParticles(false), 2000);
      }
    }
    setPrevProgress(progress);
  }, [progress, prevProgress, showParticles, onMilestone]);

  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Define gradient */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        
        {/* Progress circle with gradient */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={false}
          animate={{
            strokeDashoffset: offset,
            filter: triggerParticles 
              ? ['drop-shadow(0 0 8px hsl(var(--primary)))', 'drop-shadow(0 0 0px hsl(var(--primary)))']
              : 'drop-shadow(0 0 4px hsl(var(--primary) / 0.3))',
          }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : 0.5, 
            ease: [0.22, 1, 0.36, 1] 
          }}
        />
      </svg>
      
      {/* Center text */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        animate={triggerParticles && !prefersReducedMotion ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <span className="text-2xl font-display font-semibold text-foreground tabular-nums">
          {Math.round(progress)}%
        </span>
      </motion.div>

      {/* Particle effect on milestones */}
      {showParticles && <ParticleEffect trigger={triggerParticles} />}
    </div>
  );
};
