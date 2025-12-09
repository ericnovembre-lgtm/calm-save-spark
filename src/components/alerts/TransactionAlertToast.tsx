import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TransactionAlert } from '@/hooks/useTransactionAlerts';

interface TransactionAlertToastProps {
  alert: TransactionAlert;
  onDismiss: () => void;
  onViewDetails?: () => void;
}

export function TransactionAlertToast({
  alert,
  onDismiss,
  onViewDetails,
}: TransactionAlertToastProps) {
  const metadata = alert.metadata || {};
  const riskLevel = metadata.risk_level || 'medium';
  const latencyMs = metadata.latency_ms || 0;
  const merchant = metadata.merchant || 'Unknown';
  const amount = metadata.amount || 0;

  const riskStyles = {
    high: {
      border: 'border-red-500/30',
      bg: 'bg-red-950/40',
      icon: 'text-red-400',
      badge: 'bg-red-500/20 text-red-300',
    },
    medium: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/40',
      icon: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300',
    },
    low: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/40',
      icon: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300',
    },
  };

  const styles = riskStyles[riskLevel as keyof typeof riskStyles] || riskStyles.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        'relative overflow-hidden rounded-xl border backdrop-blur-xl p-4',
        styles.border,
        styles.bg
      )}
    >
      {/* Groq Speed Indicator */}
      <div className="absolute top-2 right-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-mono">
        <Zap className="w-3 h-3" />
        <span>{latencyMs}ms</span>
      </div>

      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 rounded-md hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', styles.bg)}>
          <AlertTriangle className={cn('w-5 h-5', styles.icon)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground truncate">
              {alert.title}
            </h4>
            <span className={cn('px-2 py-0.5 rounded-full text-xs', styles.badge)}>
              {riskLevel.toUpperCase()}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {alert.message}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">{merchant}</span>
            <span>•</span>
            <span className="font-semibold">
              ${Math.abs(amount).toFixed(2)}
            </span>
            <span>•</span>
            <span className="text-orange-400 font-mono flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Groq LPU
            </span>
          </div>

          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
              className="mt-2 h-7 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Transaction
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface TransactionAlertBannerProps {
  alerts: TransactionAlert[];
  onViewAll: () => void;
  onDismissAll: () => void;
}

export function TransactionAlertBanner({
  alerts,
  onViewAll,
  onDismissAll,
}: TransactionAlertBannerProps) {
  const highRiskCount = alerts.filter(a => a.metadata?.risk_level === 'high').length;

  if (alerts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={cn(
          'rounded-lg border p-3 mb-4',
          highRiskCount > 0
            ? 'border-red-500/30 bg-red-950/20'
            : 'border-amber-500/30 bg-amber-950/20'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-1.5 rounded-md',
              highRiskCount > 0 ? 'bg-red-500/20' : 'bg-amber-500/20'
            )}>
              <AlertTriangle className={cn(
                'w-4 h-4',
                highRiskCount > 0 ? 'text-red-400' : 'text-amber-400'
              )} />
            </div>
            <div>
              <p className="text-sm font-medium">
                {alerts.length} Transaction Alert{alerts.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3 text-orange-400" />
                Detected by Groq LPU
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onDismissAll}>
              Dismiss All
            </Button>
            <Button 
              variant={highRiskCount > 0 ? "destructive" : "default"} 
              size="sm" 
              onClick={onViewAll}
            >
              View Alerts
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
