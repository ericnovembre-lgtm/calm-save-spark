import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useState, useEffect } from "react";

interface Milestone {
  percentage: number;
  label: string;
}

interface EnhancedProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  milestones?: Milestone[];
  showParticles?: boolean;
}

export function EnhancedProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  milestones = [
    { percentage: 25, label: "Quarter" },
    { percentage: 50, label: "Half" },
    { percentage: 75, label: "Almost" },
    { percentage: 100, label: "Complete" }
  ],
  showParticles = true
}: EnhancedProgressRingProps) {
  const prefersReducedMotion = useReducedMotion();
  const [justHitMilestone, setJustHitMilestone] = useState<number | null>(null);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  // Check for milestone hits
  useEffect(() => {
    const hitMilestone = milestones.find(m => 
      progress >= m.percentage && progress < m.percentage + 1
    );
    
    if (hitMilestone) {
      setJustHitMilestone(hitMilestone.percentage);
      setTimeout(() => setJustHitMilestone(null), 2000);
    }
  }, [progress, milestones]);

  // Determine current milestone for multi-ring effect
  const activeRings = milestones.filter(m => m.percentage <= progress).length;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />

        {/* Milestone rings */}
        {milestones.map((milestone, index) => {
          if (milestone.percentage > progress) return null;
          
          const ringRadius = radius - (index * 3);
          const ringCircumference = ringRadius * 2 * Math.PI;
          
          return (
            <motion.circle
              key={milestone.percentage}
              cx={size / 2}
              cy={size / 2}
              r={ringRadius}
              fill="none"
              stroke="url(#progress-gradient)"
              strokeWidth={strokeWidth - (index * 1.5)}
              strokeDasharray={ringCircumference}
              strokeDashoffset={0}
              strokeLinecap="round"
              opacity={0.3 + (index * 0.2)}
              initial={{ strokeDashoffset: ringCircumference }}
              animate={{ strokeDashoffset: 0 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 1,
                delay: index * 0.2,
                ease: [0.22, 1, 0.36, 1]
              }}
            />
          );
        })}

        {/* Main progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progress-gradient)"
          strokeWidth={justHitMilestone ? strokeWidth + 2 : strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={justHitMilestone ? "url(#glow)" : undefined}
          initial={{ strokeDashoffset: circumference }}
          animate={{ 
            strokeDashoffset: offset,
            strokeWidth: justHitMilestone ? [strokeWidth, strokeWidth + 2, strokeWidth] : strokeWidth
          }}
          transition={{
            strokeDashoffset: {
              duration: prefersReducedMotion ? 0 : 1.5,
              ease: [0.22, 1, 0.36, 1]
            },
            strokeWidth: {
              duration: 0.3,
              ease: "easeInOut"
            }
          }}
        />

        {/* Particles on milestone */}
        {showParticles && !prefersReducedMotion && justHitMilestone && (
          <>
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * 360;
              const rad = (angle * Math.PI) / 180;
              
              return (
                <motion.circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r="3"
                  fill="hsl(var(--primary))"
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(rad) * 30,
                    y: Math.sin(rad) * 30,
                    opacity: 0,
                    scale: 0
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut"
                  }}
                />
              );
            })}
          </>
        )}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="text-2xl font-bold text-foreground tabular-nums">
            {Math.round(progress)}%
          </div>
        </motion.div>
      </div>

      {/* Milestone celebration text */}
      {justHitMilestone && (
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-semibold text-primary whitespace-nowrap"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          🎉 {milestones.find(m => m.percentage === justHitMilestone)?.label}!
        </motion.div>
      )}
    </div>
  );
}
