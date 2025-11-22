import { useEffect, useState } from 'react';
import { onLCP, onINP, onCLS, onFCP, onTTFB, Metric } from 'web-vitals';

interface PerformanceBudget {
  LCP: number;
  INP: number;
  CLS: number;
  FCP: number;
  TTFB: number;
}

interface BudgetStatus {
  metric: string;
  value: number;
  budget: number;
  status: 'good' | 'needs-improvement' | 'poor';
  overBudget: boolean;
}

const BUDGETS: PerformanceBudget = {
  LCP: 2500,  // 2.5s - good
  INP: 200,   // 200ms - good
  CLS: 0.1,   // 0.1 - good
  FCP: 1800,  // 1.8s - good
  TTFB: 600,  // 600ms - good
};

const getStatus = (value: number, budget: number, metricName: string): 'good' | 'needs-improvement' | 'poor' => {
  if (metricName === 'CLS') {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }
  
  const ratio = value / budget;
  if (ratio <= 1) return 'good';
  if (ratio <= 1.5) return 'needs-improvement';
  return 'poor';
};

export const usePerformanceBudget = (enabled: boolean = true) => {
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);
  const [violations, setViolations] = useState<BudgetStatus[]>([]);

  useEffect(() => {
    if (!enabled || import.meta.env.PROD) return;

    const reportMetric = (metric: Metric) => {
      const budget = BUDGETS[metric.name as keyof PerformanceBudget];
      if (!budget) return;

      const overBudget = metric.value > budget;
      const status = getStatus(metric.value, budget, metric.name);

      const budgetStatus: BudgetStatus = {
        metric: metric.name,
        value: Math.round(metric.value * 100) / 100,
        budget,
        status,
        overBudget,
      };

      setBudgetStatuses(prev => {
        const filtered = prev.filter(s => s.metric !== metric.name);
        return [...filtered, budgetStatus];
      });

      if (overBudget) {
        setViolations(prev => {
          const filtered = prev.filter(s => s.metric !== metric.name);
          return [...filtered, budgetStatus];
        });

        console.warn(
          `[Performance Budget] ${metric.name} exceeded:`,
          `${budgetStatus.value}${metric.name === 'CLS' ? '' : 'ms'} / ${budget}${metric.name === 'CLS' ? '' : 'ms'}`,
          `(${status})`
        );
      }
    };

    onLCP(reportMetric);
    onINP(reportMetric);
    onCLS(reportMetric);
    onFCP(reportMetric);
    onTTFB(reportMetric);
  }, [enabled]);

  return {
    budgetStatuses,
    violations,
    budgets: BUDGETS,
  };
};
