/**
 * BentoDashboard - Premium Bento-Grid Layout Dashboard
 * Inspired by Hadi Altaf designs with warm gold/beige $ave+ branding
 * 
 * Structure:
 * - Row 1: Key Metrics (3-4 cards)
 * - Row 2: Hero Visualization (2/3 chart + 1/3 gauge)
 * - Row 3: Recent Activity (full width)
 */

import { Wallet, PiggyBank, TrendingDown, Target } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { CashFlowChart } from "./CashFlowChart";
import { CreditScoreGauge } from "./CreditScoreGauge";
import { RecentActivityCard } from "./RecentActivityCard";

interface BentoDashboardProps {
  // Data props for real data integration
  totalBalance?: number;
  monthlySavings?: number;
  monthlyExpenses?: number;
  savingsGoalProgress?: number;
  balanceTrend?: number;
  savingsTrend?: number;
  expensesTrend?: number;
}

export function BentoDashboard({
  totalBalance = 24650.00,
  monthlySavings = 1847.50,
  monthlyExpenses = 3452.25,
  savingsGoalProgress = 68,
  balanceTrend = 12.4,
  savingsTrend = 8.2,
  expensesTrend = -3.1,
}: BentoDashboardProps) {
  return (
    <div className="min-h-screen bg-background p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
        
        {/* Row 1: Key Metrics - The "Pulse" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Balance"
            value={`$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={Wallet}
            trend={{ value: balanceTrend, isPositive: balanceTrend >= 0 }}
            delay={0}
          />
          <MetricCard
            label="Monthly Savings"
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
            trend={{ value: 5.3, isPositive: true }}
            delay={0.3}
          />
        </div>

        {/* Row 2: Hero Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Cash Flow Chart (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            <CashFlowChart delay={0.4} />
          </div>
          
          {/* Right: Credit Score Gauge (1/3 width on desktop) */}
          <div className="lg:col-span-1">
            <CreditScoreGauge delay={0.5} />
          </div>
        </div>

        {/* Row 3: Recent Activity - The Stream */}
        <div className="grid grid-cols-1">
        <RecentActivityCard delay={0.6} />
        </div>
        
      </div>
    </div>
  );
}
