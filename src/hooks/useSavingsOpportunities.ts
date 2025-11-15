import { useMemo } from 'react';

interface SavingsOpportunity {
  id: string;
  category: string;
  title: string;
  description: string;
  potentialSavings: number;
  confidence: 'high' | 'medium' | 'low';
  action: string;
}

/**
 * Detects smart savings opportunities based on spending patterns
 */
export function useSavingsOpportunities(
  budgets: any[],
  spending: Record<string, any>
): SavingsOpportunity[] {
  return useMemo(() => {
    const opportunities: SavingsOpportunity[] = [];

    budgets.forEach(budget => {
      const spend = spending[budget.id];
      if (!spend) return;

      const spentAmount = spend.spent_amount;
      const limit = parseFloat(String(budget.total_limit));
      const remaining = limit - spentAmount;
      const percentage = (spentAmount / limit) * 100;

      // Under-utilized budget (spending < 70% of budget)
      if (percentage < 70 && remaining > 50) {
        opportunities.push({
          id: `underutilized-${budget.id}`,
          category: budget.name,
          title: 'Under-utilized Budget',
          description: `You're only using ${percentage.toFixed(0)}% of your ${budget.name} budget. Consider reducing it by $${(remaining * 0.5).toFixed(0)}.`,
          potentialSavings: remaining * 0.5,
          confidence: 'high',
          action: 'Reduce budget allocation'
        });
      }

      // Consistently over budget (> 110%)
      if (percentage > 110) {
        opportunities.push({
          id: `overspending-${budget.id}`,
          category: budget.name,
          title: 'Overspending Alert',
          description: `You're ${(percentage - 100).toFixed(0)}% over your ${budget.name} budget. Review transactions to find cuts.`,
          potentialSavings: Math.abs(remaining) * 0.3,
          confidence: 'medium',
          action: 'Cut unnecessary expenses'
        });
      }

      // Near limit but can optimize (85-95%)
      if (percentage >= 85 && percentage < 95) {
        opportunities.push({
          id: `optimization-${budget.id}`,
          category: budget.name,
          title: 'Optimization Opportunity',
          description: `You're at ${percentage.toFixed(0)}% of your ${budget.name} budget. Small cuts now can keep you under budget.`,
          potentialSavings: limit * 0.1,
          confidence: 'medium',
          action: 'Find small savings'
        });
      }
    });

    // Sort by potential savings
    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }, [budgets, spending]);
}
