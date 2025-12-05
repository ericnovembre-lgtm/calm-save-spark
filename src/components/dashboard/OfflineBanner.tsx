import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, CloudOff, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface OfflineBannerProps {
  isOffline: boolean;
  isSyncing: boolean;
  isStale: boolean;
  lastCachedAt: Date | null;
  onRefresh: () => void;
}

export function OfflineBanner({
  isOffline,
  isSyncing,
  isStale,
  lastCachedAt,
  onRefresh
}: OfflineBannerProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Determine which state to show
  const showBanner = isOffline || isSyncing || isStale;
  
  if (!showBanner) return null;

  const formatCacheAge = () => {
    if (!lastCachedAt) return 'unknown time';
    
    const now = new Date();
    const diffMs = now.getTime() - lastCachedAt.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  // Determine banner style and content based on state
  const getBannerConfig = () => {
    if (isSyncing) {
      return {
        bg: 'bg-blue-500/10 border-blue-500/30',
        icon: RefreshCw,
        iconClass: 'text-blue-500 animate-spin',
        text: 'Syncing latest data...',
        showRefresh: false
      };
    }
    
    if (isOffline) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30',
        icon: WifiOff,
        iconClass: 'text-amber-500',
        text: `Offline Mode • Showing data from ${formatCacheAge()}`,
        showRefresh: false
      };
    }
    
    if (isStale) {
      return {
        bg: 'bg-orange-500/10 border-orange-500/30',
        icon: CloudOff,
        iconClass: 'text-orange-500',
        text: `Data may be outdated • Last updated ${formatCacheAge()}`,
        showRefresh: true
      };
    }
    
    return null;
  };

  const config = getBannerConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "mx-4 mt-2 px-4 py-2 rounded-lg border flex items-center justify-between gap-3",
          config.bg
        )}
      >
        <div className="flex items-center gap-2 text-sm">
          <Icon className={cn("h-4 w-4", config.iconClass)} />
          <span className="text-foreground/80">{config.text}</span>
          {lastCachedAt && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastCachedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        {config.showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
