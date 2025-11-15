import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BudgetAlert {
  id: string;
  type: 'warning' | 'danger' | 'success';
  budgetName: string;
  message: string;
  percentage: number;
}

export function useBudgetAlerts(budgets: any[], spending: Record<string, any>) {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [shownAlerts, setShownAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newAlerts: BudgetAlert[] = [];

    budgets.forEach(budget => {
      const spend = spending[budget.id];
      if (!spend) return;

      const percentage = (spend.spent_amount / budget.total_limit) * 100;
      const alertKey = `${budget.id}-${Math.floor(percentage / 10) * 10}`;

      // 80% warning
      if (percentage >= 80 && percentage < 100 && !shownAlerts.has(`${budget.id}-80`)) {
        newAlerts.push({
          id: alertKey,
          type: 'warning',
          budgetName: budget.name,
          message: `You've used ${percentage.toFixed(0)}% of your ${budget.name} budget`,
          percentage
        });
      }

      // 100% danger
      if (percentage >= 100 && !shownAlerts.has(`${budget.id}-100`)) {
        newAlerts.push({
          id: alertKey,
          type: 'danger',
          budgetName: budget.name,
          message: `You've exceeded your ${budget.name} budget by ${(percentage - 100).toFixed(0)}%`,
          percentage
        });
      }
    });

    // Show toast notifications for new alerts
    newAlerts.forEach(alert => {
      if (!shownAlerts.has(alert.id)) {
        if (alert.type === 'danger') {
          toast.error(alert.message, {
            duration: 5000,
            action: {
              label: 'View Budget',
              onClick: () => window.location.hash = '#budget'
            }
          });
        } else if (alert.type === 'warning') {
          toast.warning(alert.message, {
            duration: 4000
          });
        }
        
        setShownAlerts(prev => new Set(prev).add(alert.id));
      }
    });

    setAlerts(newAlerts);
  }, [budgets, spending]);

  return { alerts };
}
