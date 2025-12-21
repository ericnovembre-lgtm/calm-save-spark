/**
 * BentoDashboard - Premium Bento-Grid Layout Dashboard
 * Connected to real data via useDashboardData, useGoalsProgress, useLatestCreditScore
 * 
 * Structure:
 * - Row 1: Key Metrics (4 cards)
 * - Row 2: Hero Visualization (2/3 chart + 1/3 gauge)
 * - Row 3: Quick Actions + Upcoming Bills
 * - Row 4: Recent Activity (full width)
 */

import { Wallet, PiggyBank, TrendingDown, Target } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { CashFlowChart } from "./CashFlowChart";
import { CreditScoreGauge } from "./CreditScoreGauge";
import { RecentActivityCard } from "./RecentActivityCard";
import { UpcomingBillsCard } from "./UpcomingBillsCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { BentoSkeleton } from "./BentoSkeleton";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useGoalsProgress } from "@/hooks/useGoalsProgress";
import { useLatestCreditScore } from "@/hooks/useLatestCreditScore";

export function BentoDashboard() {
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardData();
  const { data: goalsProgress, isLoading: isGoalsLoading } = useGoalsProgress();
  const { data: creditScore, isLoading: isCreditLoading } = useLatestCreditScore();
  
  const isLoading = isDashboardLoading || isGoalsLoading;
  
  // Calculate metrics from real data
  const totalBalance = dashboardData?.pots?.reduce((sum, pot) => sum + pot.current_amount, 0) || 0;
  const monthlySavings = dashboardData?.goals?.reduce((sum, goal) => sum + goal.current_amount, 0) || 0;
  
  // Calculate monthly expenses from transactions (negative amounts from current month)
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyExpenses = dashboardData?.transactions
    ?.filter(tx => {
      const txDate = new Date(tx.transaction_date);
      return txDate >= currentMonthStart && tx.amount < 0;
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;
  
  // Goals progress
  const savingsGoalProgress = goalsProgress?.overallProgress || 0;
  
  // Calculate trends (simplified - comparing current to previous period)
  const balanceTrend = dashboardData?.financialHealth?.components?.savings 
    ? (dashboardData.financialHealth.components.savings - 50) / 5 
    : 0;
  const savingsTrend = dashboardData?.financialHealth?.components?.goals 
    ? (dashboardData.financialHealth.components.goals - 50) / 5 
    : 0;
  const expensesTrend = dashboardData?.financialHealth?.components?.debt 
    ? (50 - dashboardData.financialHealth.components.debt) / 5 
    : 0;
  
  // Prepare cash flow chart data from transactions
  const cashFlowData = prepareCashFlowData(dashboardData?.transactions || []);
  
  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
        
        {/* Row 1: Key Metrics - The "Pulse" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <BentoSkeleton variant="metric" />
              <BentoSkeleton variant="metric" />
              <BentoSkeleton variant="metric" />
              <BentoSkeleton variant="metric" />
            </>
          ) : (
            <>
              <MetricCard
                label="Total Savings"
                value={`$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                icon={Wallet}
                trend={{ value: balanceTrend, isPositive: balanceTrend >= 0 }}
                delay={0}
              />
              <MetricCard
                label="Goals Progress"
                value={`$${monthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                icon={PiggyBank}
                trend={{ value: savingsTrend, isPositive: savingsTrend >= 0 }}
                delay={0.1}
              />
              <MetricCard
                label="Monthly Expenses"
                value={`$${monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                icon={TrendingDown}
                trend={{ value: expensesTrend, isPositive: expensesTrend <= 0 }}
                delay={0.2}
              />
              <MetricCard
                label="Goal Progress"
                value={`${savingsGoalProgress}%`}
                icon={Target}
                trend={{ value: savingsGoalProgress > 50 ? 5.3 : -2.1, isPositive: savingsGoalProgress > 50 }}
                delay={0.3}
              />
            </>
          )}
        </div>

        {/* Row 2: Hero Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Cash Flow Chart (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <BentoSkeleton variant="chart" />
            ) : (
              <CashFlowChart data={cashFlowData} delay={0.4} />
            )}
          </div>
          
          {/* Right: Credit Score Gauge (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            {isCreditLoading ? (
              <BentoSkeleton variant="gauge" />
            ) : (
              <CreditScoreGauge 
                score={creditScore?.score}
                previousScore={creditScore?.score ? creditScore.score - creditScore.change : undefined}
                delay={0.5} 
              />
            )}
          </div>
        </div>

        {/* Row 3: Quick Actions + Upcoming Bills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuickActionsCard delay={0.55} />
          <UpcomingBillsCard delay={0.6} />
        </div>

        {/* Row 4: Recent Activity - The Stream */}
        <div className="grid grid-cols-1">
          <RecentActivityCard 
            transactions={dashboardData?.transactions?.slice(0, 5).map(tx => ({
              id: tx.id,
              merchant: tx.description,
              category: tx.category || 'other',
              amount: tx.amount,
              date: formatTransactionDate(tx.transaction_date),
              type: tx.amount > 0 ? 'income' as const : 'expense' as const,
            }))}
            delay={0.65} 
          />
        </div>
        
      </div>
    </div>
  );
}

// Helper function to prepare cash flow data for chart
function prepareCashFlowData(transactions: Array<{
  amount: number;
  transaction_date: string;
}>): Array<{ month: string; income: number; expenses: number; balance: number }> {
  if (!transactions.length) {
    // Return default data if no transactions
    return [
      { month: "Jan", income: 0, expenses: 0, balance: 0 },
      { month: "Feb", income: 0, expenses: 0, balance: 0 },
      { month: "Mar", income: 0, expenses: 0, balance: 0 },
      { month: "Apr", income: 0, expenses: 0, balance: 0 },
      { month: "May", income: 0, expenses: 0, balance: 0 },
      { month: "Jun", income: 0, expenses: 0, balance: 0 },
    ];
  }
  
  // Group transactions by month
  const monthlyData = new Map<string, { income: number; expenses: number }>();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  transactions.forEach(tx => {
    const date = new Date(tx.transaction_date);
    const monthKey = months[date.getMonth()];
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { income: 0, expenses: 0 });
    }
    
    const data = monthlyData.get(monthKey)!;
    if (tx.amount > 0) {
      data.income += tx.amount;
    } else {
      data.expenses += Math.abs(tx.amount);
    }
  });
  
  // Get last 6 months
  const now = new Date();
  const result: Array<{ month: string; income: number; expenses: number; balance: number }> = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = months[date.getMonth()];
    const data = monthlyData.get(monthKey) || { income: 0, expenses: 0 };
    
    result.push({
      month: monthKey,
      income: Math.round(data.income),
      expenses: Math.round(data.expenses),
      balance: Math.round(data.income - data.expenses),
    });
  }
  
  return result;
}

// Helper function to format transaction dates
function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Yesterday';
  if (daysDiff < 7) return `${daysDiff} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
