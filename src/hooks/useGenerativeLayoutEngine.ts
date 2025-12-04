import { useMemo } from 'react';
import { UnifiedDashboardData } from '@/lib/dashboard-data-types';
import { differenceInDays } from 'date-fns';

export interface WidgetPriority {
  id: string;
  score: number;
  size: 'hero' | 'large' | 'normal';
  urgencyReason: string;
  isPulsing?: boolean;
  urgencyLevel?: 'critical' | 'high' | 'medium' | 'low';
}

interface ExtendedDashboardData extends UnifiedDashboardData {
  creditScore?: { score: number; change: number };
  creditGoal?: { target: number; progress: number };
  taxDocumentCount?: number;
}

interface AnalysisContext {
  dashboardData?: ExtendedDashboardData;
  totalBalance: number;
  monthlyChange: number;
  hasAccounts: boolean;
  upcomingBills?: Array<{ next_expected_date: string; amount: number; merchant: string }>;
}

/**
 * Generative Layout Engine
 * Analyzes financial health and assigns priority scores (0-100) to widgets
 * Higher scores = more urgent = larger placement
 */
export function useGenerativeLayoutEngine(context: AnalysisContext): WidgetPriority[] {
  return useMemo(() => {
    const priorities: WidgetPriority[] = [];
    const { dashboardData, totalBalance, monthlyChange, hasAccounts, upcomingBills } = context;

    // 1. Account Connection (Score: 100 if no accounts)
    if (!hasAccounts) {
      priorities.push({
        id: 'connect-account',
        score: 100,
        size: 'hero',
        urgencyReason: 'Connect your first account to start tracking',
        urgencyLevel: 'critical',
      });
    }

    // 2. Upcoming Bills - HIGH PRIORITY when due soon
    if (upcomingBills && upcomingBills.length > 0) {
      const billsDueTomorrow = upcomingBills.filter(bill => {
        const daysUntil = differenceInDays(new Date(bill.next_expected_date), new Date());
        return daysUntil <= 1;
      });

      const billsDueThisWeek = upcomingBills.filter(bill => {
        const daysUntil = differenceInDays(new Date(bill.next_expected_date), new Date());
        return daysUntil <= 7;
      });

      let billsScore = 45; // Base score
      let billsSize: 'hero' | 'large' | 'normal' = 'normal';
      let isPulsing = false;
      let urgencyLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';

      if (billsDueTomorrow.length > 0) {
        billsScore = 95; // Critical - bill due tomorrow
        billsSize = 'large';
        isPulsing = true;
        urgencyLevel = 'critical';
      } else if (billsDueThisWeek.length > 0) {
        billsScore = 75;
        billsSize = 'normal';
        urgencyLevel = 'medium';
      }

      priorities.push({
        id: 'upcoming-bills',
        score: billsScore,
        size: billsSize,
        isPulsing,
        urgencyLevel,
        urgencyReason: billsDueTomorrow.length > 0
          ? `⚠️ ${billsDueTomorrow.length} bill(s) due tomorrow!`
          : `${billsDueThisWeek.length} bill(s) due this week`,
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

    // 4. Investments/Portfolio - HERO when big moves
    const hasInvestments = dashboardData?.investments && dashboardData.investments.length > 0;
    if (hasInvestments) {
      const totalValue = dashboardData.investments.reduce((sum, inv) => sum + inv.total_value, 0);
      const totalCost = dashboardData.investments.reduce((sum, inv) => sum + inv.cost_basis, 0);
      const marketChange = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
      
      let portfolioScore = 55;
      let portfolioSize: 'hero' | 'large' | 'normal' = 'normal';
      let urgencyLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';

      // Portfolio becomes HERO when >5% gain
      if (marketChange > 5) {
        portfolioScore = 92;
        portfolioSize = 'hero'; // Full-width hero header
        urgencyLevel = 'high';
      } else if (marketChange < -5) {
        portfolioScore = 90;
        portfolioSize = 'large';
        urgencyLevel = 'high';
      } else if (Math.abs(marketChange) > 2) {
        portfolioScore = 70;
        urgencyLevel = 'medium';
      }
      
      priorities.push({
        id: 'portfolio',
        score: portfolioScore,
        size: portfolioSize,
        urgencyLevel,
        urgencyReason: marketChange > 5
          ? `🚀 Portfolio up ${marketChange.toFixed(1)}%!`
          : marketChange < -5
          ? `📉 Portfolio down ${Math.abs(marketChange).toFixed(1)}% - review positions`
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

    // 8. Nudges - AI-powered financial reminders
    priorities.push({
      id: 'nudges',
      score: 55,
      size: 'normal',
      urgencyReason: 'AI-powered financial reminders',
    });

    // 9. Milestones
    priorities.push({
      id: 'milestones',
      score: 45,
      size: 'normal',
      urgencyReason: 'Track your progress'
    });

    // 10. Skill Tree
    priorities.push({
      id: 'skill-tree',
      score: 42,
      size: 'normal',
      urgencyReason: 'Build financial skills'
    });

    // 11. Peer Insights
    priorities.push({
      id: 'peer-insights',
      score: 38,
      size: 'normal',
      urgencyReason: 'Compare with peers'
    });

    // 12. Challenges
    priorities.push({
      id: 'challenges',
      score: 48,
      size: 'normal',
      urgencyReason: 'Active savings challenges',
    });

    // 13. Credit Score
    if (dashboardData?.creditScore) {
      let creditScore = 50;
      let urgencyLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
      
      if (dashboardData.creditScore.change > 0) {
        creditScore = 70;
        urgencyLevel = 'medium';
      } else if (dashboardData.creditScore.change < -10) {
        creditScore = 85;
        urgencyLevel = 'high';
      }
      
      priorities.push({
        id: 'credit',
        score: creditScore,
        size: creditScore > 80 ? 'large' : 'normal',
        urgencyLevel,
        urgencyReason: dashboardData.creditScore.change > 0
          ? `Credit score improving (+${dashboardData.creditScore.change})`
          : dashboardData.creditScore.change < 0
          ? `Credit score needs attention (${dashboardData.creditScore.change})`
          : 'Monitor your credit health',
      });
    } else {
      // Show credit empty state with lower priority
      priorities.push({
        id: 'credit',
        score: 35,
        size: 'normal',
        urgencyReason: 'Set up credit monitoring',
      });
    }

    // 14. Manual Transfer
    priorities.push({
      id: 'manual-transfer',
      score: 40,
      size: 'normal',
      urgencyReason: 'Quick transfer to savings',
    });

    // 15. Cash Flow Forecast
    priorities.push({
      id: 'cashflow',
      score: 52,
      size: 'normal',
      urgencyReason: '30-day financial forecast',
    });

    // 16. Tax Documents Upload - Dynamic priority based on tax season
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const isTaxSeason = currentMonth >= 1 && currentMonth <= 4;
    
    // Base score varies by tax season
    let taxDocsScore = isTaxSeason ? 72 : 45;
    let taxDocsSize: 'hero' | 'large' | 'normal' = isTaxSeason ? 'large' : 'normal';
    let taxUrgencyLevel: 'critical' | 'high' | 'medium' | 'low' = isTaxSeason ? 'medium' : 'low';
    let taxUrgencyReason = isTaxSeason 
      ? '📋 Tax season! Upload W-2s and 1099s for GPT-5 analysis'
      : 'Upload and analyze tax documents with GPT-5';
    
    // If no documents exist yet, boost priority further
    const hasTaxDocs = dashboardData?.taxDocumentCount && dashboardData.taxDocumentCount > 0;
    if (!hasTaxDocs) {
      taxDocsScore = isTaxSeason ? 85 : 55;
      taxUrgencyReason = isTaxSeason
        ? '⚠️ Tax season! Upload your first tax document'
        : 'Get started: Upload your first tax document';
      if (isTaxSeason) {
        taxDocsSize = 'large';
        taxUrgencyLevel = 'high';
      }
    }

    priorities.push({
      id: 'tax-documents',
      score: taxDocsScore,
      size: taxDocsSize,
      urgencyLevel: taxUrgencyLevel,
      urgencyReason: taxUrgencyReason,
    });

    // 17. AI Usage Summary - User-friendly AI insights
    priorities.push({
      id: 'ai-usage',
      score: 46,
      size: 'normal',
      urgencyReason: 'AI working for you',
    });

    // Sort by score descending
    return priorities.sort((a, b) => b.score - a.score);
  }, [context]);
}
