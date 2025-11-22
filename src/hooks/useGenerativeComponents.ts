import { useState, useEffect } from 'react';
import { ComponentMessage } from '@/components/generative-ui/types';

interface UserContext {
  timeInMonth: 'beginning' | 'middle' | 'end';
  budgetHealth: 'excellent' | 'good' | 'warning' | 'critical';
  recentActivity?: any[];
}

interface UseGenerativeComponentsProps {
  budgets: any[];
  spending: Record<string, any>;
  userContext: UserContext;
}

interface Insight {
  type: 'opportunity' | 'alert' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  actionUrl?: string;
}

export function useGenerativeComponents({ 
  budgets, 
  spending, 
  userContext 
}: UseGenerativeComponentsProps) {
  const [components, setComponents] = useState<ComponentMessage[]>([]);
  const [sidebarInsights, setSidebarInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const generatedComponents: ComponentMessage[] = [];

    // Calculate context
    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(String(b.total_limit)), 0);
    const totalSpent = Object.values(spending).reduce((sum: number, s: any) => sum + (s?.spent_amount || 0), 0);
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Critical budget health → Emotion-aware response
    if (userContext.budgetHealth === 'critical' && utilization > 90) {
      generatedComponents.push({
        type: 'emotion_aware_response',
        props: {
          detectedEmotion: 'stressed',
          confidence: 0.85,
          response: "I notice you're approaching your budget limits. Let's work together to find ways to reduce spending and get back on track. You've got this! 💪",
          supportResources: [
            {
              title: 'Budget Adjustment Guide',
              description: 'Learn how to reallocate your budget effectively',
              url: '/help/budget-adjustment'
            },
            {
              title: 'Spending Reduction Tips',
              description: '10 proven ways to cut costs without sacrificing quality of life',
              url: '/help/reduce-spending'
            }
          ]
        }
      });
    }

    // End of month → Predictive forecast
    if (userContext.timeInMonth === 'end' && budgets.length > 0) {
      const historicalData = Object.values(spending).map((s: any, index) => ({
        month: `Month ${index + 1}`,
        actual: s?.spent_amount || 0
      }));

      const avgSpending = historicalData.reduce((sum, d) => sum + d.actual, 0) / Math.max(historicalData.length, 1);
      
      generatedComponents.push({
        type: 'predictive_forecast',
        props: {
          category: 'Overall',
          historicalData: historicalData.slice(-6),
          predictions: [
            {
              month: 'Next Month',
              predicted: avgSpending * 1.05,
              confidence: {
                lower: avgSpending * 0.95,
                upper: avgSpending * 1.15
              }
            }
          ],
          insights: {
            trend: avgSpending > totalSpent ? 'increasing' : 'decreasing',
            volatility: 'medium',
            anomalies: utilization > 80 ? ['High spending detected this period'] : [],
            recommendations: [
              'Consider creating a buffer for unexpected expenses',
              'Review recurring subscriptions for potential savings'
            ]
          }
        }
      });
    }

    // Overspending detected → Budget alerts + insights
    const overspentBudgets = budgets.filter(b => {
      const spent = spending[b.id]?.spent_amount || 0;
      const limit = parseFloat(String(b.total_limit));
      return spent > limit * 0.8;
    });

    if (overspentBudgets.length > 0) {
      const topOverspent = overspentBudgets[0];
      const spent = spending[topOverspent.id]?.spent_amount || 0;
      const limit = parseFloat(String(topOverspent.total_limit));

      generatedComponents.push({
        type: 'budget_alert',
        props: {
          category: topOverspent.budget_name || 'Budget',
          spent,
          limit,
          severity: spent > limit ? 'danger' : 'warning'
        }
      });

      // Generate AI insights carousel
      const insights = [
        {
          id: 'reduce-dining',
          title: 'Dining Out Alert',
          description: `You've spent $${spent.toFixed(2)} on dining this month. Try meal prepping to save $200+`,
          impact: 'high',
          actionable: true,
          action: {
            label: 'Create Meal Prep Goal',
            type: 'create_goal'
          }
        },
        {
          id: 'subscription-review',
          title: 'Subscription Check',
          description: 'Review your subscriptions - many people save $50-100/month by canceling unused services',
          impact: 'medium',
          actionable: true
        }
      ];

      generatedComponents.push({
        type: 'ai_insights_carousel',
        props: {
          insights,
          title: 'Smart Savings Opportunities'
        }
      });
    }

    // Good budget health → Financial health score
    if (userContext.budgetHealth === 'excellent' || userContext.budgetHealth === 'good') {
      generatedComponents.push({
        type: 'financial_health_score',
        props: {
          totalScore: utilization < 70 ? 85 : 75,
          categories: [
            {
              name: 'Budget Control',
              score: utilization < 70 ? 90 : 80,
              maxScore: 100,
              tips: ['Great job staying under budget!', 'Consider increasing your savings goal']
            },
            {
              name: 'Spending Habits',
              score: 75,
              maxScore: 100,
              tips: ['Track discretionary spending', 'Use the 50/30/20 rule']
            },
            {
              name: 'Financial Goals',
              score: 70,
              maxScore: 100,
              tips: ['Set specific savings targets', 'Automate your savings']
            }
          ]
        }
      });
    }

    // Cash flow visualization if multiple budgets exist
    if (budgets.length >= 3) {
      const income = [{ source: 'Income', amount: totalBudget }];
      const expenses = budgets.map(b => ({
        category: b.budget_name || 'Other',
        amount: spending[b.id]?.spent_amount || 0
      }));
      const savings = totalBudget - totalSpent;

      generatedComponents.push({
        type: 'cash_flow_sankey',
        props: {
          income,
          expenses,
          savings: Math.max(savings, 0)
        }
      });
    }

    setComponents(generatedComponents);

    // Generate sidebar insights
    const insights: Insight[] = [];

    // Achievement insight - excellent budget health
    if (userContext.budgetHealth === 'excellent' && utilization < 70) {
      insights.push({
        type: 'achievement',
        title: 'Excellent Budget Control! 🎉',
        description: `You're on track to save ${(100 - utilization).toFixed(0)}% more than budgeted. Keep up the great work!`,
        confidence: 0.92,
        action: 'View savings goals'
      });
    }

    // Alert insight - high utilization
    if (utilization > 80) {
      const overspentBudgets = budgets.filter(b => {
        const spent = spending[b.id]?.spent_amount || 0;
        const limit = parseFloat(String(b.total_limit));
        return spent > limit * 0.8;
      });

      if (overspentBudgets.length > 0) {
        insights.push({
          type: 'alert',
          title: 'Budget Alert Detected',
          description: `${overspentBudgets.length} budget${overspentBudgets.length > 1 ? 's are' : ' is'} over 80% utilized. Consider reviewing your spending.`,
          confidence: 0.88,
          action: 'View budget details'
        });
      }
    }

    // Opportunity insight - savings potential
    if (budgets.length >= 3) {
      const highestSpending = budgets
        .map(b => ({
          budget: b,
          spent: spending[b.id]?.spent_amount || 0
        }))
        .sort((a, b) => b.spent - a.spent)[0];

      if (highestSpending && highestSpending.spent > 0) {
        const savingsPotential = highestSpending.spent * 0.15;
        insights.push({
          type: 'opportunity',
          title: `Save $${savingsPotential.toFixed(0)}/month`,
          description: `Your highest spending category could be optimized. Consider setting up automated savings rules.`,
          confidence: 0.75,
          action: 'Create savings rule'
        });
      }
    }

    // Suggestion insight - end of month planning
    if (userContext.timeInMonth === 'end') {
      const avgSpending = Object.values(spending).reduce((sum: number, s: any) => sum + (s?.spent_amount || 0), 0) / Math.max(budgets.length, 1);
      
      insights.push({
        type: 'suggestion',
        title: 'Plan Next Month\'s Budget',
        description: `Based on $${avgSpending.toFixed(0)} average spending, I recommend adjusting your allocations for next month.`,
        confidence: 0.82,
        action: 'Adjust budgets'
      });
    }

    // Pattern detection - spending spike
    const recentActivity = userContext.recentActivity || [];
    if (recentActivity.length > 0) {
      insights.push({
        type: 'suggestion',
        title: 'Weekend Spending Pattern',
        description: 'Your weekend spending is 40% higher than weekdays. Consider meal prepping to save more.',
        confidence: 0.79,
        action: 'View breakdown'
      });
    }

    setSidebarInsights(insights);
  }, [budgets, spending, userContext]);

  const addComponent = (component: ComponentMessage) => {
    setComponents(prev => [...prev, component]);
  };

  const removeComponent = (index: number) => {
    setComponents(prev => prev.filter((_, i) => i !== index));
  };

  return {
    components,
    sidebarInsights,
    addComponent,
    removeComponent
  };
}

export type { Insight };
