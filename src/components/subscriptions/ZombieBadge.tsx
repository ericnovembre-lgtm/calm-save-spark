import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ZombieBadgeProps {
  zombieScore: number;
  daysSinceLastUsage?: number;
  className?: string;
}

export function ZombieBadge({ zombieScore, daysSinceLastUsage, className = '' }: ZombieBadgeProps) {
  if (zombieScore < 70) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 ${className}`}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <AlertTriangle className="w-4 h-4" />
            </motion.div>
            <span className="text-xs font-semibold">Unused</span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">Zombie Subscription Detected</p>
            <p className="text-sm">
              {daysSinceLastUsage ? `No usage detected in ${daysSinceLastUsage} days` : 'Low usage detected'}
            </p>
            <p className="text-xs text-muted-foreground">
              Zombie Score: {zombieScore.toFixed(0)}/100
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
