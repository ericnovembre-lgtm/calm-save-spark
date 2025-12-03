import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConfidenceGaugeProps {
  confidence: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ConfidenceGauge({ 
  confidence, 
  size = 'md',
  showLabel = true 
}: ConfidenceGaugeProps) {
  // Clamp confidence between 0 and 100
  const clampedConfidence = Math.max(0, Math.min(100, confidence));
  
  // Color based on confidence level
  const getColor = () => {
    if (clampedConfidence >= 80) return { stroke: 'stroke-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (clampedConfidence >= 60) return { stroke: 'stroke-amber-500', text: 'text-amber-500', bg: 'bg-amber-500' };
    return { stroke: 'stroke-rose-500', text: 'text-rose-500', bg: 'bg-rose-500' };
  };
  
  const colors = getColor();
  
  const sizes = {
    sm: { width: 32, strokeWidth: 3, fontSize: 'text-[10px]' },
    md: { width: 48, strokeWidth: 4, fontSize: 'text-xs' },
    lg: { width: 64, strokeWidth: 5, fontSize: 'text-sm' },
  };
  
  const { width, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedConfidence / 100) * circumference;

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative" style={{ width, height: width }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={width} height={width}>
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="stroke-muted"
          />
          {/* Progress circle */}
          <motion.circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            className={colors.stroke}
            style={{ strokeDasharray: circumference }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        {/* Center text */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center font-semibold",
          colors.text,
          fontSize
        )}>
          {Math.round(clampedConfidence)}
        </div>
      </div>
      {showLabel && (
        <span className={cn("font-medium", fontSize, colors.text)}>
          {clampedConfidence >= 80 ? 'High' : clampedConfidence >= 60 ? 'Medium' : 'Low'}
        </span>
      )}
    </div>
  );
}

// Linear bar version for tables
export function ConfidenceBar({ confidence }: { confidence: number }) {
  const clampedConfidence = Math.max(0, Math.min(100, confidence));
  
  const getColor = () => {
    if (clampedConfidence >= 80) return 'bg-emerald-500';
    if (clampedConfidence >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", getColor())}
          initial={{ width: 0 }}
          animate={{ width: `${clampedConfidence}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-medium">
        {Math.round(clampedConfidence)}%
      </span>
    </div>
  );
}
