/**
 * MemoryMonitor - Visual memory usage display (dev only)
 */
import { useMemoryMonitor } from '@/hooks/useMemoryMonitor';
import { cn } from '@/lib/utils';
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MemoryMonitorProps {
  className?: string;
  showHistory?: boolean;
  compact?: boolean;
}

export function MemoryMonitor({ 
  className, 
  showHistory = true,
  compact = false 
}: MemoryMonitorProps) {
  const { 
    current, 
    limit, 
    percentage, 
    trend, 
    isLeaking, 
    history, 
    isSupported,
    suggestGC 
  } = useMemoryMonitor();

  // Only show in development
  if (!import.meta.env.DEV || !isSupported) {
    return null;
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'growing': return <TrendingUp className="h-3 w-3 text-amber-500" />;
      case 'shrinking': return <TrendingDown className="h-3 w-3 text-emerald-500" />;
      default: return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    if (isLeaking) return 'text-rose-500';
    if (percentage > 80) return 'text-amber-500';
    if (percentage > 60) return 'text-yellow-500';
    return 'text-emerald-500';
  };

  if (compact) {
    return (
      <div className={cn(
        'fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-slate-900/90 backdrop-blur-sm border border-white/10 text-xs font-mono',
        className
      )}>
        <Activity className={cn('h-3 w-3', getStatusColor())} />
        <span className={getStatusColor()}>{current}MB</span>
        {getTrendIcon()}
        {isLeaking && <AlertTriangle className="h-3 w-3 text-rose-500 animate-pulse" />}
      </div>
    );
  }

  return (
    <div className={cn(
      'fixed bottom-4 left-4 z-50 p-3 rounded-lg',
      'bg-slate-900/95 backdrop-blur-sm border border-white/10',
      'text-xs font-mono min-w-[200px]',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className={cn('h-4 w-4', getStatusColor())} />
          <span className="text-white/80">Memory</span>
        </div>
        {isLeaking && (
          <div className="flex items-center gap-1 text-rose-500">
            <AlertTriangle className="h-3 w-3 animate-pulse" />
            <span>Leak!</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-1 mb-2">
        <div className="flex justify-between">
          <span className="text-white/60">Used:</span>
          <span className={getStatusColor()}>{current}MB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Limit:</span>
          <span className="text-white/80">{limit}MB</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/60">Trend:</span>
          <span className="flex items-center gap-1">
            {getTrendIcon()}
            <span className="text-white/80 capitalize">{trend}</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
        <div 
          className={cn(
            'h-full transition-all duration-300',
            percentage > 80 ? 'bg-rose-500' : 
            percentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Mini history chart */}
      {showHistory && history.length > 1 && (
        <div className="h-8 flex items-end gap-px">
          {history.map((value, i) => {
            const max = Math.max(...history);
            const height = (value / max) * 100;
            return (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-t transition-all',
                  i === history.length - 1 ? 'bg-primary' : 'bg-white/20'
                )}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      )}

      {/* GC button */}
      <button
        onClick={suggestGC}
        className="mt-2 w-full py-1 px-2 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white/80 transition-colors text-[10px]"
      >
        Request GC
      </button>
    </div>
  );
}
