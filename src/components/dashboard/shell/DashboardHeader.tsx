import { motion } from 'framer-motion';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SyncIndicator } from '@/components/ui/sync-indicator';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { formatDistanceToNow } from 'date-fns';

type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

interface DashboardHeaderProps {
  isGenerating: boolean;
  modelName?: string;
  syncStatus: SyncStatus;
  lastSynced?: Date;
  lastRefresh?: Date;
  onRefresh: () => void;
  onForceRefresh: () => void;
}

// Time-of-day greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardHeader({
  isGenerating,
  modelName,
  syncStatus,
  lastSynced,
  lastRefresh,
  onRefresh,
  onForceRefresh,
}: DashboardHeaderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={!prefersReducedMotion ? { rotate: isGenerating ? 360 : 0 } : undefined}
              transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: 'linear' }}
              className="relative"
            >
              <Sparkles className="h-6 w-6 text-primary" />
              {/* Subtle glow effect */}
              {isGenerating && !prefersReducedMotion && (
                <motion.div 
                  className="absolute inset-0 rounded-full blur-md bg-primary/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-foreground">{getGreeting()}</h1>
                {/* Animated gradient underline */}
                <motion.div 
                  className="hidden sm:block h-0.5 w-12 rounded-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"
                  animate={!prefersReducedMotion ? { 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                  } : undefined}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{ backgroundSize: '200% 100%' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Powered by Claude Opus 4.5
                </p>
                {/* Model badge with glassmorphic styling */}
                {modelName && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {modelName}
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SyncIndicator status={syncStatus} lastSynced={lastSynced} onRefresh={onForceRefresh} />
            
            {/* Last refresh with relative time and fade animation */}
            {lastRefresh && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-xs text-muted-foreground hidden sm:block"
              >
                {formatDistanceToNow(lastRefresh, { addSuffix: true })}
              </motion.span>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isGenerating}
              className="border-border/50 hover:bg-primary/5 transition-colors"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
              <span className="hidden sm:inline">Regenerate</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
