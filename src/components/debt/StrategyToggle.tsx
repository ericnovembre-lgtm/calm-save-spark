import { motion } from 'framer-motion';
import { Zap, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StrategyToggleProps {
  strategy: 'avalanche' | 'snowball';
  onChange: (strategy: 'avalanche' | 'snowball') => void;
}

export function StrategyToggle({ strategy, onChange }: StrategyToggleProps) {
  return (
    <div className="relative flex items-center gap-2 p-1 rounded-xl bg-muted">
      {/* Sliding background indicator */}
      <motion.div
        className="absolute h-[calc(100%-8px)] rounded-lg bg-primary"
        initial={false}
        animate={{
          x: strategy === 'avalanche' ? 4 : '50%',
          width: 'calc(50% - 4px)'
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      />

      {/* Avalanche Button */}
      <button
        onClick={() => onChange('avalanche')}
        className={cn(
          'relative z-10 flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
          'font-semibold text-sm transition-colors',
          strategy === 'avalanche' 
            ? 'text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Zap className={cn('w-4 h-4', strategy === 'avalanche' && 'animate-pulse')} />
        <span>Avalanche</span>
      </button>

      {/* Snowball Button */}
      <button
        onClick={() => onChange('snowball')}
        className={cn(
          'relative z-10 flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
          'font-semibold text-sm transition-colors',
          strategy === 'snowball' 
            ? 'text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Snowflake className={cn('w-4 h-4', strategy === 'snowball' && 'animate-pulse')} />
        <span>Snowball</span>
      </button>
    </div>
  );
}
