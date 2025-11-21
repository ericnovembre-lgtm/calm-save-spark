import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface LiquidFillGaugeProps {
  percentage: number;
  label: string;
  size?: number;
}

export function LiquidFillGauge({ 
  percentage, 
  label, 
  size = 200 
}: LiquidFillGaugeProps) {
  const prefersReducedMotion = useReducedMotion();
  const radius = size / 2;
  const fillHeight = (percentage / 100) * size;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer circle */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 5}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          opacity="0.3"
        />

        {/* Clip path for liquid */}
        <defs>
          <clipPath id="liquidClip">
            <circle cx={radius} cy={radius} r={radius - 8} />
          </clipPath>
        </defs>

        {/* Liquid fill */}
        <g clipPath="url(#liquidClip)">
          <motion.rect
            x="0"
            y={size - fillHeight}
            width={size}
            height={fillHeight}
            fill="url(#liquidGradient)"
            initial={prefersReducedMotion ? {} : { y: size }}
            animate={{ y: size - fillHeight }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* Wave effect */}
          {!prefersReducedMotion && (
            <motion.path
              d={`M 0,${size - fillHeight} Q ${size / 4},${size - fillHeight - 10} ${size / 2},${size - fillHeight} T ${size},${size - fillHeight} V ${size} H 0 Z`}
              fill="hsl(var(--primary) / 0.3)"
              animate={{
                d: [
                  `M 0,${size - fillHeight} Q ${size / 4},${size - fillHeight - 10} ${size / 2},${size - fillHeight} T ${size},${size - fillHeight} V ${size} H 0 Z`,
                  `M 0,${size - fillHeight} Q ${size / 4},${size - fillHeight + 10} ${size / 2},${size - fillHeight} T ${size},${size - fillHeight} V ${size} H 0 Z`,
                  `M 0,${size - fillHeight} Q ${size / 4},${size - fillHeight - 10} ${size / 2},${size - fillHeight} T ${size},${size - fillHeight} V ${size} H 0 Z`
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
        </g>

        {/* Gradient definition */}
        <defs>
          <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Percentage text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold text-foreground"
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {percentage}%
        </motion.span>
        <span className="text-sm text-muted-foreground mt-1">{label}</span>
      </div>
    </div>
  );
}
