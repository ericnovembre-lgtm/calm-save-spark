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
    <footer className="border-t border-border/20 py-4 mt-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 text-[11px] text-muted-foreground/60">
          {/* Sparkle with subtle animation */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={!prefersReducedMotion ? { 
                rotate: [0, 12, -12, 0],
                scale: [1, 1.08, 1]
              } : undefined}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 6 }}
            >
              <Sparkles className="h-3 w-3 text-primary/50" />
            </motion.div>
            <span className="font-medium tracking-wide">AI-Personalized</span>
          </motion.div>

          {/* Divider */}
          <span className="w-px h-3 bg-border/30" />

          {/* Processing time badge */}
          {processingTimeMs && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 backdrop-blur-sm"
            >
              <Zap className="h-3 w-3 text-amber-500/70" />
              <span className="font-medium">{(processingTimeMs / 1000).toFixed(1)}s</span>
            </motion.div>
          )}

          {/* Relative time since generation */}
          {generatedAt && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden sm:inline font-medium tracking-wide"
            >
              {formatDistanceToNow(generatedAt, { addSuffix: true })}
            </motion.span>
          )}
        </div>
      </div>
    </footer>
  );
}
