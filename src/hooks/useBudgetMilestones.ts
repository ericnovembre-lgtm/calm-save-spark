import { useState, useCallback } from 'react';

interface BudgetMilestone {
  type: 'achievement' | 'goal' | 'milestone';
  budgetName: string;
  percentage: number;
}

export function useBudgetMilestones() {
  const [celebrationTrigger, setCelebrationTrigger] = useState(false);
  const [lastMilestones, setLastMilestones] = useState<Set<string>>(new Set());

  const checkMilestones = useCallback((budgets: any[], spending: Record<string, any>) => {
    budgets.forEach(budget => {
      const spend = spending[budget.id];
      if (!spend) return;

      const percentage = (spend.spent_amount / budget.total_limit) * 100;
      const milestoneKey = `${budget.id}-${Math.floor(percentage / 25) * 25}`;

      // Celebrate at 50%, 75%, 100% milestones
      if (
        !lastMilestones.has(milestoneKey) &&
        (percentage >= 50 && percentage < 52 ||
         percentage >= 75 && percentage < 77 ||
         percentage >= 100 && percentage < 102)
      ) {
        setCelebrationTrigger(true);
        setLastMilestones(prev => new Set(prev).add(milestoneKey));
        
        // Reset trigger after animation
        setTimeout(() => setCelebrationTrigger(false), 3000);
      }
    });
  }, [lastMilestones]);

  return {
    celebrationTrigger,
    checkMilestones,
  };
}
