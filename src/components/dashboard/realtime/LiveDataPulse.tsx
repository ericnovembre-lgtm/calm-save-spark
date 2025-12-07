import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface LiveDataPulseProps {
  value: number;
  previousValue?: number;
  lastUpdated?: Date;
  showLiveBadge?: boolean;
  showDirection?: boolean;
  className?: string;
  pulseColor?: 'cyan' | 'emerald' | 'violet' | 'amber' | 'rose';
}

const colorMap = {
  cyan: 'bg-amber-500/20 border-amber-500/50',
  emerald: 'bg-emerald-500/20 border-emerald-500/50',
  violet: 'bg-yellow-500/20 border-yellow-500/50',
  amber: 'bg-amber-500/20 border-amber-500/50',
  rose: 'bg-rose-500/20 border-rose-500/50',
};

const glowMap = {
  cyan: 'shadow-amber-500/50',
  emerald: 'shadow-emerald-500/50',
  violet: 'shadow-yellow-500/50',
  amber: 'shadow-amber-500/50',
  rose: 'shadow-rose-500/50',
};

export function LiveDataPulse({
  value,
  previousValue,
  lastUpdated,
  showLiveBadge = true,
  showDirection = true,
  className,
  pulseColor = 'cyan',
}: LiveDataPulseProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isPulsing, setIsPulsing] = useState(false);
  const [prevVal, setPrevVal] = useState(previousValue ?? value);

  const change = value - prevVal;
  const isIncrease = change > 0;
  const isDecrease = change < 0;
  const hasChange = change !== 0;

  // Trigger pulse on value change
  useEffect(() => {
    if (value !== prevVal) {
      setIsPulsing(true);
      const timeout = setTimeout(() => {
        setIsPulsing(false);
        setPrevVal(value);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [value, prevVal]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={cn('relative inline-flex items-center gap-2', className)}>
      {/* Pulse Effect */}
      <AnimatePresence>
        {isPulsing && !prefersReducedMotion && (
          <motion.div
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={cn(
              'absolute inset-0 rounded-lg border',
              colorMap[pulseColor]
            )}
          />
        )}
      </AnimatePresence>

      {/* Direction Indicator */}
      {showDirection && hasChange && (
        <motion.div
          initial={{ opacity: 0, y: isIncrease ? 5 : -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            isIncrease ? 'text-emerald-400' : 'text-rose-400'
          )}
        >
          {isIncrease ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          <span>{Math.abs(change).toLocaleString()}</span>
        </motion.div>
      )}

      {/* Live Badge */}
      {showLiveBadge && (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
          <motion.div
            animate={prefersReducedMotion ? {} : { 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isPulsing ? 'bg-emerald-400' : 'bg-amber-400'
            )}
          />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Live
          </span>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <span className="text-[10px] text-muted-foreground">
          {formatTime(lastUpdated)}
        </span>
      )}
    </div>
  );
}

// Simpler live indicator dot
export function LiveDot({ 
  isLive = true,
  size = 'sm',
  className 
}: { 
  isLive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  
  const sizeMap = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  if (!isLive) return null;

  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { 
        scale: [1, 1.3, 1],
        opacity: [1, 0.6, 1],
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={cn(
        'rounded-full bg-emerald-400',
        sizeMap[size],
        className
      )}
    />
  );
}
