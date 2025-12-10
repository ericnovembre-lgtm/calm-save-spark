import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PulseMetric {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'good' | 'warning' | 'critical';
  icon: string;
}

export interface FinancialPulse {
  healthScore: number;
  metrics: {
    spending: PulseMetric;
    savings: PulseMetric;
    budgetAdherence: PulseMetric;
    debtRatio: PulseMetric;
    emergencyFund: PulseMetric;
    netWorth: PulseMetric;
  };
  insights: string[];
  lastUpdated: string;
}

export function useFinancialPulse() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['financial-pulse', user?.id],
    queryFn: async (): Promise<FinancialPulse> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Fetch all required data in parallel
      const [
        transactionsRes,
        goalsRes,
        budgetsRes,
        debtsRes,
        netWorthRes,
      ] = await Promise.all([
        supabase
          .from('transactions')
          .select('amount, category, transaction_date')
          .eq('user_id', user.id)
          .gte('transaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('transaction_date', { ascending: false }),
        supabase
          .from('goals')
          .select('target_amount, current_amount, name')
          .eq('user_id', user.id),
        supabase
          .from('user_budgets')
          .select('total_limit, name, period')
          .eq('user_id', user.id)
          .eq('is_active', true),
        supabase
          .from('debts')
          .select('current_balance, original_balance, debt_name')
          .eq('user_id', user.id),
        supabase
          .from('net_worth_snapshots')
          .select('total_assets, total_liabilities, net_worth')
          .eq('user_id', user.id)
          .order('snapshot_date', { ascending: false })
          .limit(2),
      ]);

      const transactions = transactionsRes.data || [];
      const goals = goalsRes.data || [];
      const budgets = budgetsRes.data || [];
      const debts = debtsRes.data || [];
      const netWorthSnapshots = netWorthRes.data || [];

      // Calculate metrics
      const totalSpending = transactions
        .filter(t => Number(t.amount) < 0)
        .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

      const totalSavings = goals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0);
      const totalGoalTargets = goals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0);
      const savingsRate = totalGoalTargets > 0 ? (totalSavings / totalGoalTargets) * 100 : 0;

      const totalBudget = budgets.reduce((sum, b) => sum + Number(b.total_limit || 0), 0);
      const budgetAdherence = totalBudget > 0 ? Math.min(100, ((totalBudget - totalSpending) / totalBudget) * 100 + 50) : 50;

      const totalDebt = debts.reduce((sum, d) => sum + Number(d.current_balance || 0), 0);
      const originalDebt = debts.reduce((sum, d) => sum + Number(d.original_balance || 0), 0);
      const debtPayoffRate = originalDebt > 0 ? ((originalDebt - totalDebt) / originalDebt) * 100 : 100;

      const currentNetWorth = netWorthSnapshots[0]?.net_worth || 0;
      const previousNetWorth = netWorthSnapshots[1]?.net_worth || currentNetWorth;
      const netWorthChange = previousNetWorth !== 0 ? ((currentNetWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100 : 0;

      // Emergency fund calculation (assume 3 months expenses target)
      const monthlyExpenses = totalSpending;
      const emergencyTarget = monthlyExpenses * 3;
      const emergencyFundProgress = emergencyTarget > 0 ? Math.min(100, (totalSavings / emergencyTarget) * 100) : 0;

      // Calculate health score (weighted average)
      const healthScore = Math.round(
        (savingsRate * 0.2) +
        (budgetAdherence * 0.25) +
        (debtPayoffRate * 0.2) +
        (emergencyFundProgress * 0.2) +
        (Math.min(100, 50 + netWorthChange) * 0.15)
      );

      const getStatus = (value: number): 'good' | 'warning' | 'critical' => {
        if (value >= 70) return 'good';
        if (value >= 40) return 'warning';
        return 'critical';
      };

      const getTrend = (change: number): 'up' | 'down' | 'stable' => {
        if (change > 2) return 'up';
        if (change < -2) return 'down';
        return 'stable';
      };

      // Generate insights
      const insights: string[] = [];
      if (budgetAdherence < 50) insights.push('Spending is exceeding your budget targets');
      if (savingsRate > 50) insights.push('Great progress on your savings goals!');
      if (debtPayoffRate > 80) insights.push('Almost debt-free - keep it up!');
      if (emergencyFundProgress < 30) insights.push('Consider building your emergency fund');
      if (netWorthChange > 5) insights.push('Your net worth is growing nicely');

      return {
        healthScore: Math.max(0, Math.min(100, healthScore)),
        metrics: {
          spending: {
            label: 'Monthly Spending',
            value: totalSpending,
            trend: getTrend(-5), // Placeholder trend
            trendValue: -5,
            status: getStatus(100 - (totalSpending / (totalBudget || 1)) * 100),
            icon: '💸',
          },
          savings: {
            label: 'Savings Progress',
            value: savingsRate,
            trend: getTrend(savingsRate > 50 ? 5 : -5),
            trendValue: savingsRate > 50 ? 5 : -5,
            status: getStatus(savingsRate),
            icon: '🎯',
          },
          budgetAdherence: {
            label: 'Budget Health',
            value: budgetAdherence,
            trend: getTrend(budgetAdherence > 50 ? 3 : -3),
            trendValue: budgetAdherence > 50 ? 3 : -3,
            status: getStatus(budgetAdherence),
            icon: '📊',
          },
          debtRatio: {
            label: 'Debt Freedom',
            value: debtPayoffRate,
            trend: getTrend(debtPayoffRate > 50 ? 5 : -2),
            trendValue: debtPayoffRate > 50 ? 5 : -2,
            status: getStatus(debtPayoffRate),
            icon: '⚖️',
          },
          emergencyFund: {
            label: 'Emergency Fund',
            value: emergencyFundProgress,
            trend: getTrend(emergencyFundProgress > 50 ? 2 : -2),
            trendValue: emergencyFundProgress > 50 ? 2 : -2,
            status: getStatus(emergencyFundProgress),
            icon: '🛡️',
          },
          netWorth: {
            label: 'Net Worth',
            value: currentNetWorth,
            trend: getTrend(netWorthChange),
            trendValue: netWorthChange,
            status: getStatus(50 + netWorthChange),
            icon: '💰',
          },
        },
        insights,
        lastUpdated: new Date().toISOString(),
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
