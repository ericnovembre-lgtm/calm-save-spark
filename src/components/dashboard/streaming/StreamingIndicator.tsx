import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { StreamPhase } from '@/hooks/useStreamingAI';

type IndicatorVariant = 'dots' | 'pulse' | 'wave' | 'brain';

interface StreamingIndicatorProps {
  phase: StreamPhase;
  variant?: IndicatorVariant;
  progress?: number;
  elapsedMs?: number;
  tokensPerSecond?: number;
  onCancel?: () => void;
  showDebugInfo?: boolean;
  className?: string;
}

const phaseText: Record<StreamPhase, string> = {
  idle: '',
  connecting: 'Connecting...',
  streaming: 'Generating...',
  parsing: 'Processing...',
  complete: 'Complete',
  error: 'Error',
};

const phaseIcons: Record<StreamPhase, React.ReactNode> = {
  idle: null,
  connecting: <Loader2 className="h-4 w-4 animate-spin" />,
  streaming: <Sparkles className="h-4 w-4" />,
  parsing: <Brain className="h-4 w-4" />,
  complete: <Sparkles className="h-4 w-4 text-emerald-400" />,
  error: <X className="h-4 w-4 text-rose-400" />,
};

export function StreamingIndicator({
  phase,
  variant = 'dots',
  progress = 0,
  elapsedMs = 0,
  tokensPerSecond = 0,
  onCancel,
  showDebugInfo = false,
  className,
}: StreamingIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();
  
  if (phase === 'idle') return null;
  
  const isActive = phase !== 'complete' && phase !== 'error';

  const formatElapsed = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-center gap-3 px-4 py-2 rounded-full',
        'bg-card/90 backdrop-blur-sm border border-border',
        className
      )}
    >
      {/* Indicator Animation */}
      <div className="relative">
        {variant === 'dots' && <DotsIndicator phase={phase} reduced={prefersReducedMotion} />}
        {variant === 'pulse' && <PulseIndicator progress={progress} reduced={prefersReducedMotion} />}
        {variant === 'wave' && <WaveIndicator reduced={prefersReducedMotion} />}
        {variant === 'brain' && <BrainIndicator phase={phase} reduced={prefersReducedMotion} />}
      </div>

      {/* Status Text */}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground flex items-center gap-2">
          {phaseIcons[phase]}
          {phaseText[phase]}
        </span>
        {elapsedMs > 0 && (
          <span className="text-xs text-muted-foreground">
            {formatElapsed(elapsedMs)}
            {showDebugInfo && tokensPerSecond > 0 && ` • ${tokensPerSecond.toFixed(1)} tok/s`}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {progress > 0 && progress < 100 && (
        <div className="w-20 h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-foreground/60"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Cancel Button */}
      {onCancel && isActive && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={onCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </motion.div>
  );
}

// Animated Dots
function DotsIndicator({ phase, reduced }: { phase: StreamPhase; reduced: boolean }) {
  if (reduced) {
    return <span className="text-accent">•••</span>;
  }
  
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-accent"
          animate={{
            y: phase === 'streaming' ? [0, -4, 0] : 0,
            opacity: phase === 'connecting' ? [0.3, 1, 0.3] : 1,
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// Pulse Ring
function PulseIndicator({ progress, reduced }: { progress: number; reduced: boolean }) {
  const circumference = 2 * Math.PI * 12;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-8 h-8">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="16"
          cy="16"
          r="12"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-white/10"
        />
        <motion.circle
          cx="16"
          cy="16"
          r="12"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          style={{ strokeDasharray: circumference, strokeDashoffset }}
          animate={reduced ? {} : { strokeDashoffset }}
          transition={{ duration: 0.3 }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--foreground))" />
          </linearGradient>
        </defs>
      </svg>
      {!reduced && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-accent" />
        </motion.div>
      )}
    </div>
  );
}

// Audio Wave
function WaveIndicator({ reduced }: { reduced: boolean }) {
  if (reduced) {
    return <div className="flex gap-0.5 items-end h-4">{[...Array(5)].map((_, i) => (
      <div key={i} className="w-0.5 bg-accent" style={{ height: '50%' }} />
    ))}</div>;
  }
  
  return (
    <div className="flex gap-0.5 items-end h-4">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 bg-gradient-to-t from-accent to-foreground/60 rounded-full"
          animate={{ height: ['30%', '100%', '30%'] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Brain Neural
function BrainIndicator({ phase, reduced }: { phase: StreamPhase; reduced: boolean }) {
  return (
    <motion.div
      animate={reduced ? {} : { 
        scale: phase === 'streaming' ? [1, 1.1, 1] : 1,
      }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <Brain className={cn(
        'h-5 w-5',
        phase === 'streaming' ? 'text-foreground' : 'text-accent'
      )} />
    </motion.div>
  );
}
