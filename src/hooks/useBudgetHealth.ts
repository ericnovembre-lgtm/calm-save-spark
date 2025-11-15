import { useMemo } from 'react';

type BudgetHealth = 'excellent' | 'good' | 'warning' | 'critical';

interface Budget {
  total_limit: number;
  id: string;
}

interface Spending {
  spent_amount: number;
}

export const useBudgetHealth = (
  budgets: Budget[],
  spending: Record<string, Spending>
): BudgetHealth => {
  return useMemo(() => {
    if (budgets.length === 0) return 'good';

    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(String(b.total_limit)), 0);
    const totalSpent = Object.values(spending).reduce(
      (sum: number, s: Spending) => sum + (s?.spent_amount || 0),
      0
    );

    if (totalBudget === 0) return 'good';

    const percentageUsed = (totalSpent / totalBudget) * 100;

    if (percentageUsed >= 95) return 'critical';
    if (percentageUsed >= 80) return 'warning';
    if (percentageUsed >= 50) return 'good';
    return 'excellent';
  }, [budgets, spending]);
};
