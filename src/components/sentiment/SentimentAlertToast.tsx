import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Activity, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TriggeredAlert, SentimentMetadata } from '@/hooks/useSentimentAlerts';
import { useNavigate } from 'react-router-dom';

interface SentimentAlertToastProps {
  alert: TriggeredAlert;
  onDismiss: () => void;
  onView: () => void;
}

export const SentimentAlertToast = ({ alert, onDismiss, onView }: SentimentAlertToastProps) => {
  const navigate = useNavigate();
  const metadata = alert.data as SentimentMetadata | null;

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!metadata) return null;

  const getAlertIcon = () => {
    if (alert.alert_type.includes('state_change')) {
      const current = metadata.current;
      if (current.label.includes('bullish')) {
        return <TrendingUp className="h-5 w-5 text-emerald-400" />;
      }
      return <TrendingDown className="h-5 w-5 text-rose-400" />;
    }
    if (alert.alert_type.includes('volume')) {
      return <Activity className="h-5 w-5 text-amber-400" />;
    }
    if (alert.alert_type.includes('confidence')) {
      return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    }
    return <Activity className="h-5 w-5 text-cyan-400" />;
  };

  const getSeverityColor = () => {
    const current = metadata.current;
    if (current.label.includes('bearish')) return 'border-rose-500/30 bg-rose-950/20';
    if (current.label.includes('bullish')) return 'border-emerald-500/30 bg-emerald-950/20';
    return 'border-cyan-500/30 bg-cyan-950/20';
  };

  const handleViewDetails = () => {
    navigate(`/social-sentiment?ticker=${metadata.ticker}`);
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`fixed right-4 top-20 z-50 w-80 rounded-lg border backdrop-blur-xl shadow-xl ${getSeverityColor()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          {getAlertIcon()}
          <span className="font-semibold text-white">{metadata.ticker}</span>
          <span className="text-xs text-white/40">Sentiment Alert</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 text-white/40 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        <p className="text-sm text-white/80">{alert.message}</p>

        {/* Sentiment Change Visual */}
        {metadata.previous && (
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="text-center">
              <div className="text-lg font-mono text-white/60">
                {metadata.previous.score > 0 ? '+' : ''}{metadata.previous.score}
              </div>
              <div className="text-xs text-white/40 capitalize">
                {metadata.previous.label.replace('_', ' ')}
              </div>
            </div>
            <div className="text-white/20">→</div>
            <div className="text-center">
              <div className={`text-lg font-mono ${
                metadata.current.score >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {metadata.current.score > 0 ? '+' : ''}{metadata.current.score}
              </div>
              <div className="text-xs text-white/60 capitalize">
                {metadata.current.label.replace('_', ' ')}
              </div>
            </div>
          </div>
        )}

        {/* Volume & Confidence */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">
            Volume: <span className="text-white/60 capitalize">{metadata.current.volume}</span>
          </span>
          <span className="text-white/40">
            Confidence: <span className="text-white/60">{metadata.current.confidence}%</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="flex-1 text-white/60 hover:text-white hover:bg-white/5"
          >
            Dismiss
          </Button>
          <Button
            size="sm"
            onClick={handleViewDetails}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-1 border-t border-white/5">
          <span className="text-[10px] text-white/30">Powered by 𝕏</span>
        </div>
      </div>
    </motion.div>
  );
};

// Container component to show multiple toasts
interface SentimentAlertToastContainerProps {
  alerts: TriggeredAlert[];
  onDismiss: (id: string) => void;
}

export const SentimentAlertToastContainer = ({ alerts, onDismiss }: SentimentAlertToastContainerProps) => {
  const navigate = useNavigate();

  const getMetadata = (alert: TriggeredAlert) => alert.data as SentimentMetadata | null;

  return (
    <div className="fixed right-4 top-20 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {alerts.slice(0, 3).map((alert, index) => {
          const metadata = getMetadata(alert);
          if (!metadata) return null;
          return (
            <motion.div
              key={alert.id}
              style={{ marginTop: index * 4 }}
            >
              <SentimentAlertToast
                alert={alert}
                onDismiss={() => onDismiss(alert.id)}
                onView={() => {
                  navigate(`/social-sentiment?ticker=${metadata.ticker}`);
                  onDismiss(alert.id);
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
