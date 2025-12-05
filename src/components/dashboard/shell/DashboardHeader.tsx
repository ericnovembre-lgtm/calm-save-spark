import { motion } from 'framer-motion';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SyncIndicator } from '@/components/ui/sync-indicator';
import { cn } from '@/lib/utils';

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

export function DashboardHeader({
  isGenerating,
  modelName,
  syncStatus,
  lastSynced,
  lastRefresh,
  onRefresh,
  onForceRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isGenerating ? 360 : 0 }}
              transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: 'linear' }}
            >
              <Sparkles className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">$ave+ Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                Powered by Claude Opus 4.5 • {modelName || 'AI-Generated'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SyncIndicator status={syncStatus} lastSynced={lastSynced} onRefresh={onForceRefresh} />
            
            {lastRefresh && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isGenerating}
              className="border-border/50"
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
