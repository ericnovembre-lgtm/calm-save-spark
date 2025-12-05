/**
 * Offline Sync Indicator Component
 * Shows pending mutation count and sync status with visual feedback
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useOfflineQueueStatus } from '@/hooks/useOfflineMutation';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface OfflineSyncIndicatorProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

type SyncState = 'online' | 'offline' | 'syncing' | 'synced' | 'error';

export function OfflineSyncIndicator({ 
  className, 
  showLabel = false,
  compact = false,
}: OfflineSyncIndicatorProps) {
  const { status, isOffline } = useOfflineQueueStatus();
  const [syncState, setSyncState] = useState<SyncState>('online');
  const [showSyncedAnimation, setShowSyncedAnimation] = useState(false);
  
  // Determine current state
  useEffect(() => {
    if (isOffline) {
      setSyncState('offline');
    } else if (status?.isSyncing) {
      setSyncState('syncing');
    } else if (status?.pendingCount && status.pendingCount > 0) {
      setSyncState('offline'); // Has pending, treat as needs sync
    } else {
      setSyncState('online');
    }
  }, [isOffline, status]);
  
  // Listen for sync completion
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        if (event.data.success) {
          setSyncState('synced');
          setShowSyncedAnimation(true);
          setTimeout(() => {
            setShowSyncedAnimation(false);
            setSyncState('online');
          }, 2000);
        } else {
          setSyncState('error');
          setTimeout(() => setSyncState('online'), 3000);
        }
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handler);
    return () => navigator.serviceWorker?.removeEventListener('message', handler);
  }, []);
  
  // Manual sync handler
  const handleManualSync = async () => {
    if ('serviceWorker' in navigator) {
      setSyncState('syncing');
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({ type: 'MANUAL_SYNC' });
    }
  };
  
  // Don't render if online with no pending
  if (syncState === 'online' && !showSyncedAnimation) {
    return null;
  }
  
  const pendingCount = status?.pendingCount ?? 0;
  
  const stateConfig: Record<SyncState, {
    icon: typeof Cloud;
    color: string;
    bgColor: string;
    label: string;
    spin?: boolean;
  }> = {
    online: {
      icon: Cloud,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      label: 'Online',
    },
    offline: {
      icon: CloudOff,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      label: pendingCount > 0 ? `${pendingCount} pending` : 'Offline',
    },
    syncing: {
      icon: RefreshCw,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      label: 'Syncing...',
      spin: true,
    },
    synced: {
      icon: Check,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      label: 'Synced',
    },
    error: {
      icon: AlertCircle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      label: 'Sync failed',
    },
  };
  
  const config = stateConfig[syncState];
  const Icon = config.icon;
  
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full',
                config.bgColor,
                className
              )}
            >
              <Icon 
                className={cn(
                  'w-4 h-4',
                  config.color,
                  config.spin && 'animate-spin'
                )} 
              />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold bg-amber-500 text-white rounded-full flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{config.label}</p>
            {pendingCount > 0 && syncState !== 'syncing' && (
              <p className="text-xs text-muted-foreground">
                Click to sync manually
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          config.bgColor,
          'border border-border/50',
          className
        )}
      >
        <Icon 
          className={cn(
            'w-4 h-4',
            config.color,
            config.spin && 'animate-spin'
          )} 
        />
        
        {showLabel && (
          <span className={cn('text-sm font-medium', config.color)}>
            {config.label}
          </span>
        )}
        
        {pendingCount > 0 && (
          <span className={cn(
            'px-1.5 py-0.5 text-xs font-bold rounded-full',
            'bg-amber-500 text-white'
          )}>
            {pendingCount}
          </span>
        )}
        
        {pendingCount > 0 && syncState !== 'syncing' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleManualSync}
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Floating offline indicator for mobile
 */
export function FloatingOfflineIndicator() {
  const { status, isOffline } = useOfflineQueueStatus();
  
  if (!isOffline && (!status?.pendingCount || status.pendingCount === 0)) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
    >
      <OfflineSyncIndicator showLabel />
    </motion.div>
  );
}
