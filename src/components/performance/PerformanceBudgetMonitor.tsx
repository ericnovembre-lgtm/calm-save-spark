import { usePerformanceBudget } from '@/hooks/usePerformanceBudget';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const PerformanceBudgetMonitor = () => {
  const { budgetStatuses, violations } = usePerformanceBudget(import.meta.env.DEV);

  // Only show in development
  if (import.meta.env.PROD) return null;
  if (budgetStatuses.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <AnimatePresence>
        {violations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-destructive/90 backdrop-blur-sm text-destructive-foreground rounded-lg p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-2">Performance Budget Violations</h4>
                <div className="space-y-1 text-xs">
                  {violations.map((v) => (
                    <div key={v.metric} className="flex justify-between gap-2">
                      <span className="font-medium">{v.metric}:</span>
                      <span>
                        {v.value}
                        {v.metric === 'CLS' ? '' : 'ms'} / {v.budget}
                        {v.metric === 'CLS' ? '' : 'ms'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.details
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 bg-card/90 backdrop-blur-sm rounded-lg shadow-lg"
      >
        <summary className="cursor-pointer p-3 text-sm font-medium hover:bg-accent/10 rounded-lg transition-colors">
          Performance Metrics
        </summary>
        <div className="p-3 space-y-2 text-xs">
          {budgetStatuses.map((status) => (
            <div key={status.metric} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {status.status === 'good' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {status.status === 'needs-improvement' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                {status.status === 'poor' && <XCircle className="w-4 h-4 text-red-500" />}
                <span className="font-medium">{status.metric}</span>
              </div>
              <div className="text-right">
                <span className={status.overBudget ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                  {status.value}
                  {status.metric === 'CLS' ? '' : 'ms'}
                </span>
                <span className="text-muted-foreground"> / {status.budget}{status.metric === 'CLS' ? '' : 'ms'}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.details>
    </div>
  );
};
