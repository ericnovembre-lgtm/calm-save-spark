import { useMemo } from 'react';
import { UnifiedDashboardData } from '@/lib/dashboard-data-types';

export interface WidgetPriority {
  id: string;
  score: number;
  size: 'hero' | 'large' | 'normal';
  urgencyReason: string;
}

interface AnalysisContext {
  dashboardData?: UnifiedDashboardData;
  totalBalance: number;
  monthlyChange: number;
  hasAccounts: boolean;
}

/**
 * Generative Layout Engine
 * Analyzes financial health and assigns priority scores (0-100) to widgets
 * Higher scores = more urgent = larger placement
 */
export function useGenerativeLayoutEngine(context: AnalysisContext): WidgetPriority[] {
  return useMemo(() => {
    const priorities: WidgetPriority[] = [];
    const { dashboardData, totalBalance, monthlyChange, hasAccounts } = context;

    // 1. Account Connection (Score: 100 if no accounts)
    if (!hasAccounts) {
      priorities.push({
        id: 'connect-account',
        score: 100,
        size: 'hero',
        urgencyReason: 'Connect your first account to start tracking'
      });
    }

    // 2. Balance Card Analysis
    const lowBalanceThreshold = 500;
    const isLowBalance = totalBalance < lowBalanceThreshold;
    
    let balanceScore = 50; // Base score
    if (isLowBalance) balanceScore = 95; // Critical
    else if (monthlyChange > 0) balanceScore = 75; // Growing
    else if (monthlyChange < -200) balanceScore = 85; // Declining fast
    
    priorities.push({
      id: 'balance',
      score: balanceScore,
      size: balanceScore > 90 ? 'hero' : balanceScore > 70 ? 'large' : 'normal',
      urgencyReason: isLowBalance 
        ? `Low balance: $${totalBalance.toFixed(0)} needs attention`
        : monthlyChange > 0
        ? `Growing: +$${monthlyChange.toFixed(0)} this month`
        : `Declining: $${monthlyChange.toFixed(0)} this month`
    });

    // 3. Goals Analysis
    if (dashboardData?.goals && dashboardData.goals.length > 0) {
      const activeGoals = dashboardData.goals.filter(g => g.current_amount < g.target_amount);
      const nearingCompletion = activeGoals.filter(
        g => (g.current_amount / g.target_amount) > 0.8
      );
      
      let goalsScore = 60; // Base score
      if (nearingCompletion.length > 0) goalsScore = 88; // Almost there!
      else if (activeGoals.length === 0) goalsScore = 40; // No active goals
      
      priorities.push({
        id: 'goals',
        score: goalsScore,
        size: goalsScore > 85 ? 'large' : 'normal',
        urgencyReason: nearingCompletion.length > 0
          ? `${nearingCompletion.length} goal(s) almost complete!`
          : `${activeGoals.length} active goal(s)`
      });
    }

    // 4. Investments/Portfolio
    const hasInvestments = dashboardData?.investments && dashboardData.investments.length > 0;
    if (hasInvestments) {
      const totalValue = dashboardData.investments.reduce((sum, inv) => sum + inv.total_value, 0);
      const totalCost = dashboardData.investments.reduce((sum, inv) => sum + inv.cost_basis, 0);
      const marketChange = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
      
      let portfolioScore = 55;
      if (Math.abs(marketChange) > 5) portfolioScore = 90; // Big moves
      else if (Math.abs(marketChange) > 2) portfolioScore = 70; // Notable moves
      
      priorities.push({
        id: 'portfolio',
        score: portfolioScore,
        size: portfolioScore > 85 ? 'large' : 'normal',
        urgencyReason: marketChange > 5
          ? `Portfolio up ${marketChange.toFixed(1)}% today!`
          : marketChange < -5
          ? `Portfolio down ${Math.abs(marketChange).toFixed(1)}% - review positions`
          : `Portfolio ${marketChange > 0 ? '+' : ''}${marketChange.toFixed(1)}%`
      });
    }

    // 5. Budgets
    if (dashboardData?.budgets && dashboardData.budgets.length > 0) {
      const overBudget = dashboardData.budgets.filter(b => {
        const currentSpending = b.budget_spending?.[0]?.spent_amount || 0;
        return currentSpending > b.total_limit;
      });
      
      let budgetScore = 50;
      if (overBudget.length > 0) budgetScore = 82; // Over budget
      
      priorities.push({
        id: 'budgets',
        score: budgetScore,
        size: budgetScore > 80 ? 'large' : 'normal',
        urgencyReason: overBudget.length > 0
          ? `${overBudget.length} budget(s) exceeded`
          : 'On track with budgets'
      });
    }

    // 6. AI Insights
    priorities.push({
      id: 'ai-insights',
      score: 65,
      size: 'normal',
      urgencyReason: 'AI-powered recommendations'
    });

    // 7. Recommendations
    priorities.push({
      id: 'recommendations',
      score: 58,
      size: 'normal',
      urgencyReason: 'Personalized savings tips'
    });

    // 8. Milestones
    priorities.push({
      id: 'milestones',
      score: 45,
      size: 'normal',
      urgencyReason: 'Track your progress'
    });

    // 9. Skill Tree
    priorities.push({
      id: 'skill-tree',
      score: 42,
      size: 'normal',
      urgencyReason: 'Build financial skills'
    });

    // 10. Peer Insights
    priorities.push({
      id: 'peer-insights',
      score: 38,
      size: 'normal',
      urgencyReason: 'Compare with peers'
    });

    // Sort by score descending
    return priorities.sort((a, b) => b.score - a.score);
  }, [context]);
}
