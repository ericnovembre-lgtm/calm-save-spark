import { motion } from 'framer-motion';

interface MultiRingProgressProps {
  current: number;
  target: number;
  size?: number;
  monthlyContribution?: number;
  weeklyContribution?: number;
}

/**
 * Multi-ring progress visualization
 * Outer: Total progress
 * Middle: Monthly contribution
 * Inner: Weekly contribution
 */
export const MultiRingProgress = ({
  current,
  target,
  size = 120,
  monthlyContribution = 0,
  weeklyContribution = 0
}: MultiRingProgressProps) => {
  const progress = Math.min((current / target) * 100, 100);
  const monthlyProgress = monthlyContribution > 0 
    ? Math.min((monthlyContribution / (target * 0.05)) * 100, 100) 
    : 0;
  const weeklyProgress = weeklyContribution > 0
    ? Math.min((weeklyContribution / (target * 0.0125)) * 100, 100)
    : 0;

  const strokeWidth = size * 0.08;
  const radius1 = (size / 2) - (strokeWidth / 2);
  const radius2 = radius1 - strokeWidth * 1.2;
  const radius3 = radius2 - strokeWidth * 1.2;
  
  const circumference1 = 2 * Math.PI * radius1;
  const circumference2 = 2 * Math.PI * radius2;
  const circumference3 = 2 * Math.PI * radius3;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circles */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius1}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius2}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius3}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />

        {/* Outer ring - Total progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius1}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference1}
          initial={{ strokeDashoffset: circumference1 }}
          animate={{ 
            strokeDashoffset: circumference1 - (progress / 100) * circumference1 
          }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Middle ring - Monthly contribution */}
        {monthlyProgress > 0 && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius2}
            fill="none"
            stroke="hsl(var(--primary) / 0.6)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference2}
            initial={{ strokeDashoffset: circumference2 }}
            animate={{ 
              strokeDashoffset: circumference2 - (monthlyProgress / 100) * circumference2 
            }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        )}

        {/* Inner ring - Weekly contribution */}
        {weeklyProgress > 0 && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius3}
            fill="none"
            stroke="hsl(var(--primary) / 0.4)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference3}
            initial={{ strokeDashoffset: circumference3 }}
            animate={{ 
              strokeDashoffset: circumference3 - (weeklyProgress / 100) * circumference3 
            }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          />
        )}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {progress.toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};
