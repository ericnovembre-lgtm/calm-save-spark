import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface DashboardFooterProps {
  generatedAt?: Date;
  processingTimeMs?: number;
}

export function DashboardFooter({ generatedAt, processingTimeMs }: DashboardFooterProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <footer className="border-t border-border/50 py-3 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          {/* Sparkle with subtle animation */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={!prefersReducedMotion ? { 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1]
              } : undefined}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
            >
              <Sparkles className="h-3 w-3 text-primary" />
            </motion.div>
            <span>Personalized by Claude</span>
          </motion.div>

          {/* Processing time badge */}
          {processingTimeMs && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50"
            >
              <Zap className="h-3 w-3 text-amber-500" />
              <span>{(processingTimeMs / 1000).toFixed(1)}s</span>
            </motion.div>
          )}

          {/* Relative time since generation */}
          {generatedAt && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden sm:inline"
            >
              Updated {formatDistanceToNow(generatedAt, { addSuffix: true })}
            </motion.span>
          )}
        </div>
      </div>
    </footer>
  );
}
