import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface PerformanceBudget {
  metric: string;
  threshold: number;
  unit: string;
  severity: 'warning' | 'error';
}

/**
 * Performance budget thresholds
 * - Warning: Approaching limits (yellow)
 * - Error: Exceeding limits (red)
 */
const PERFORMANCE_BUDGETS: PerformanceBudget[] = [
  { metric: 'page_load', threshold: 3000, unit: 'ms', severity: 'error' },
  { metric: 'page_load', threshold: 2000, unit: 'ms', severity: 'warning' },
  { metric: 'auth_check', threshold: 1500, unit: 'ms', severity: 'error' },
  { metric: 'auth_check', threshold: 500, unit: 'ms', severity: 'warning' },
  { metric: 'hero_load', threshold: 1000, unit: 'ms', severity: 'error' },
  { metric: 'hero_load', threshold: 300, unit: 'ms', severity: 'warning' },
  { metric: 'features_load', threshold: 1500, unit: 'ms', severity: 'error' },
  { metric: 'features_load', threshold: 500, unit: 'ms', severity: 'warning' },
  { metric: 'component_load', threshold: 2000, unit: 'ms', severity: 'error' },
  { metric: 'component_load', threshold: 1000, unit: 'ms', severity: 'warning' },
];

const METRIC_LABELS: Record<string, string> = {
  page_load: 'Page Load',
  auth_check: 'Auth Check',
  hero_load: 'Hero Section',
  features_load: 'Features Section',
  stats_load: 'Stats Section',
  cta_load: 'CTA Section',
  component_load: 'Component',
};

/**
 * Hook to monitor performance metrics and show alerts when budgets are exceeded
 */
export function usePerformanceBudgetAlerts(enabled: boolean = true) {
  const alertedMetrics = useRef<Set<string>>(new Set());
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (!enabled || !isDev) return;

    const handlePerformanceMetric = (event: CustomEvent) => {
      const { metric, value, component } = event.detail;
      
      // Find applicable budgets for this metric
      const budgets = PERFORMANCE_BUDGETS.filter(b => b.metric === metric);
      
      for (const budget of budgets) {
        if (value > budget.threshold) {
          // Create unique key for this alert
          const alertKey = `${metric}-${component || 'global'}-${budget.severity}`;
          
          // Skip if already alerted for this metric/component/severity
          if (alertedMetrics.current.has(alertKey)) continue;
          
          alertedMetrics.current.add(alertKey);
          
          const label = component || METRIC_LABELS[metric] || metric;
          const exceedBy = Math.round(value - budget.threshold);
          const percentage = Math.round(((value - budget.threshold) / budget.threshold) * 100);
          
          // Show toast notification
          if (budget.severity === 'error') {
            toast.error(`Performance Budget Exceeded: ${label}`, {
              description: `Load time: ${Math.round(value)}ms (${exceedBy}ms over budget, +${percentage}%)`,
              duration: 5000,
              action: {
                label: 'View Metrics',
                onClick: () => {
                  // Could open performance dashboard here
                  console.log('[Performance] Opening metrics dashboard');
                }
              }
            });
            
            console.error(`[Performance Budget] ❌ ${label}: ${value}ms exceeds ${budget.threshold}ms budget`, {
              metric,
              value,
              threshold: budget.threshold,
              exceedBy,
              percentage,
              component
            });
          } else {
            toast.warning(`Performance Warning: ${label}`, {
              description: `Load time: ${Math.round(value)}ms (approaching ${budget.threshold}ms budget)`,
              duration: 3000,
            });
            
            console.warn(`[Performance Budget] ⚠️ ${label}: ${value}ms approaching ${budget.threshold}ms budget`, {
              metric,
              value,
              threshold: budget.threshold,
              exceedBy,
              percentage,
              component
            });
          }
          
          // Track budget violation
          if (typeof window !== 'undefined' && (window as any).saveplus_audit_event) {
            (window as any).saveplus_audit_event('performance_budget_violation', {
              metric,
              value,
              threshold: budget.threshold,
              severity: budget.severity,
              component,
              exceedBy,
              percentage,
              url: window.location.href,
              timestamp: Date.now()
            });
          }
          
          // Only alert for the highest severity for this metric
          break;
        }
      }
    };

    // Listen to performance metric events
    window.addEventListener('performance_metric' as any, handlePerformanceMetric);

    // Clear alerted metrics on route change
    const handleRouteChange = () => {
      alertedMetrics.current.clear();
    };
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('performance_metric' as any, handlePerformanceMetric);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [enabled, isDev]);

  return {
    clearAlerts: () => alertedMetrics.current.clear(),
  };
}

/**
 * Get color for performance value based on budgets
 */
export function getPerformanceColor(metric: string, value: number): 'green' | 'yellow' | 'red' {
  const budgets = PERFORMANCE_BUDGETS.filter(b => b.metric === metric).sort((a, b) => a.threshold - b.threshold);
  
  if (budgets.length === 0) return 'green';
  
  // Check error threshold
  const errorBudget = budgets.find(b => b.severity === 'error');
  if (errorBudget && value > errorBudget.threshold) return 'red';
  
  // Check warning threshold
  const warningBudget = budgets.find(b => b.severity === 'warning');
  if (warningBudget && value > warningBudget.threshold) return 'yellow';
  
  return 'green';
}
