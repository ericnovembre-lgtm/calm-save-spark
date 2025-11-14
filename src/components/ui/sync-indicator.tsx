import { motion } from "framer-motion";
import { RefreshCw, Wifi, WifiOff, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SyncIndicatorProps {
  status: 'synced' | 'syncing' | 'offline' | 'error';
  lastSynced?: Date;
  onRefresh?: () => void;
  className?: string;
}

export function SyncIndicator({ status, lastSynced, onRefresh, className }: SyncIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          label: 'Syncing...',
          animate: true
        };
      case 'synced':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-500/10',
          label: lastSynced ? `Synced ${getTimeAgo(lastSynced)}` : 'Synced',
          animate: false
        };
      case 'offline':
        return {
          icon: WifiOff,
          color: 'text-orange-600',
          bgColor: 'bg-orange-500/10',
          label: 'Offline mode',
          animate: false
        };
      case 'error':
        return {
          icon: WifiOff,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          label: 'Sync failed',
          animate: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors",
            config.bgColor,
            className
          )}>
            {/* Pulsing Dot */}
            <div className="relative flex items-center justify-center w-2 h-2">
              <motion.div
                className={cn("absolute w-2 h-2 rounded-full", config.color.replace('text-', 'bg-'))}
                animate={config.animate && !prefersReducedMotion ? {
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className={cn("w-2 h-2 rounded-full", config.color.replace('text-', 'bg-'))} />
            </div>

            {/* Status Icon */}
            <motion.div
              animate={config.animate && !prefersReducedMotion ? {
                rotate: [0, 360]
              } : {}}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Icon className={cn("w-4 h-4", config.color)} />
            </motion.div>

            {/* Status Text */}
            <span className={cn("text-sm font-medium", config.color)}>
              {config.label}
            </span>

            {/* Refresh Button */}
            {onRefresh && status !== 'syncing' && (
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-6 w-6 ml-1", config.color)}
                onClick={onRefresh}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{config.label}</p>
            {lastSynced && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last synced: {lastSynced.toLocaleTimeString()}
              </p>
            )}
            {status === 'offline' && (
              <p className="text-xs text-muted-foreground">
                Changes will sync when you're back online
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
