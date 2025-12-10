import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIConfidenceIndicatorProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function AIConfidenceIndicator({ 
  confidence, 
  size = 'md',
  showLabel = true 
}: AIConfidenceIndicatorProps) {
  const percentage = Math.round(confidence * 100);
  
  const getColor = () => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getBgColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn('relative', sizeClasses[size])}>
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8%"
            className="text-muted"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="8%"
            strokeLinecap="round"
            className={getColor()}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: confidence }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              strokeDasharray: '283%',
              strokeDashoffset: `${283 - 283 * confidence}%`,
            }}
          />
        </svg>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className={cn(iconSizes[size], getColor())} />
        </div>
      </div>

      {showLabel && (
        <div className="text-sm">
          <p className={cn('font-semibold', getColor())}>{percentage}%</p>
          <p className="text-xs text-muted-foreground">AI Confidence</p>
        </div>
      )}
    </div>
  );
}
