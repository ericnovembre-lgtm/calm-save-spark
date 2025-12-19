import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, AlertCircle, Loader2, X, RefreshCw } from 'lucide-react';
import { useAlgoliaSyncStatus } from '@/hooks/useAlgoliaSyncStatus';
import { useAlgoliaSync } from '@/hooks/useAlgoliaSync';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import type { AlgoliaIndex } from '@/lib/algolia-client';

interface AlgoliaSyncIndicatorProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function AlgoliaSyncIndicator({ 
  variant = 'compact', 
  className 
}: AlgoliaSyncIndicatorProps) {
  const { status, pendingCount, lastSynced, errors, dismissError, clearErrors, hasErrors } = useAlgoliaSyncStatus();
  const { bulkSync } = useAlgoliaSync();

  const handleRetry = async (indexName: string, errorId: string) => {
    dismissError(errorId);
    try {
      await bulkSync.mutateAsync({ indexName: indexName as AlgoliaIndex });
    } catch {
      // Error handling is done in the hook
    }
  };

  // Compact variant - just a status dot
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={cn(
                "flex items-center gap-1.5 cursor-default",
                className
              )}
              initial={false}
            >
              <StatusDot status={status} hasErrors={hasErrors} />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[200px]">
            <StatusTooltipContent 
              status={status} 
              pendingCount={pendingCount}
              lastSynced={lastSynced}
              errorCount={errors.length}
            />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full variant - detailed status with error list
  return (
    <div className={cn("space-y-3", className)}>
      {/* Status bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <StatusIcon status={status} hasErrors={hasErrors} />
          <div>
            <p className="text-sm font-medium">
              {getStatusLabel(status, pendingCount, hasErrors)}
            </p>
            {lastSynced && status !== 'syncing' && (
              <p className="text-xs text-muted-foreground">
                Last synced {formatDistanceToNow(lastSynced, { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error list */}
      <AnimatePresence mode="popLayout">
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-destructive">
                {errors.length} failed operation{errors.length > 1 ? 's' : ''}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={clearErrors}
              >
                Clear all
              </Button>
            </div>
            
            {errors.map((error) => (
              <motion.div
                key={error.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={cn(
                  "flex items-center justify-between gap-2 p-2 rounded-lg",
                  "bg-destructive/5 border border-destructive/20"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate capitalize">
                    {error.indexName.replace('saveplus_', '')}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {error.error}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRetry(error.indexName, error.id)}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => dismissError(error.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusDot({ status, hasErrors }: { status: string; hasErrors: boolean }) {
  const baseClasses = "w-2 h-2 rounded-full";
  
  if (hasErrors) {
    return (
      <span className={cn(baseClasses, "bg-destructive")} />
    );
  }
  
  switch (status) {
    case 'syncing':
      return (
        <motion.span
          className={cn(baseClasses, "bg-primary")}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      );
    case 'success':
      return (
        <motion.span
          className={cn(baseClasses, "bg-emerald-500")}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
        />
      );
    case 'error':
      return <span className={cn(baseClasses, "bg-destructive")} />;
    default:
      return <span className={cn(baseClasses, "bg-muted-foreground/30")} />;
  }
}

function StatusIcon({ status, hasErrors }: { status: string; hasErrors: boolean }) {
  const iconClasses = "h-5 w-5";
  
  if (hasErrors) {
    return <AlertCircle className={cn(iconClasses, "text-destructive")} />;
  }
  
  switch (status) {
    case 'syncing':
      return <Loader2 className={cn(iconClasses, "text-primary animate-spin")} />;
    case 'success':
      return <CheckCircle className={cn(iconClasses, "text-emerald-500")} />;
    case 'error':
      return <AlertCircle className={cn(iconClasses, "text-destructive")} />;
    default:
      return <Search className={cn(iconClasses, "text-muted-foreground")} />;
  }
}

function getStatusLabel(status: string, pendingCount: number, hasErrors: boolean): string {
  if (hasErrors) {
    return 'Sync issues detected';
  }
  
  switch (status) {
    case 'syncing':
      return pendingCount > 1 
        ? `Syncing ${pendingCount} operations...` 
        : 'Syncing...';
    case 'success':
      return 'Synced successfully';
    case 'error':
      return 'Sync failed';
    default:
      return 'Search index ready';
  }
}

function StatusTooltipContent({ 
  status, 
  pendingCount, 
  lastSynced,
  errorCount 
}: { 
  status: string; 
  pendingCount: number; 
  lastSynced: Date | null;
  errorCount: number;
}) {
  return (
    <div className="text-xs space-y-1">
      <p className="font-medium">{getStatusLabel(status, pendingCount, errorCount > 0)}</p>
      {lastSynced && (
        <p className="text-muted-foreground">
          Last synced {formatDistanceToNow(lastSynced, { addSuffix: true })}
        </p>
      )}
      {errorCount > 0 && (
        <p className="text-destructive">
          {errorCount} error{errorCount > 1 ? 's' : ''} - check settings
        </p>
      )}
    </div>
  );
}
