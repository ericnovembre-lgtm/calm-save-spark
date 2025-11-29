import type { WidgetHelpContent } from '@/components/dashboard/WidgetHelpTooltip';

/**
 * Centralized help content for dashboard widgets
 * Used by WidgetHelpTooltip component
 */
export const WIDGET_HELP_CONTENT: Record<string, WidgetHelpContent> = {
  cashFlowForecast: {
    title: '30-Day Cash Flow Forecast',
    description: 'This chart predicts your future balance based on past spending patterns and scheduled transfers.',
    tips: [
      'The solid line shows your expected balance',
      'The dashed line shows an optimistic scenario',
      'Green/red indicates positive/negative trend',
      'Hover over points for detailed values',
    ],
  },
  aiInsights: {
    title: 'AI Insights Hub',
    description: 'Your personal AI financial advisor analyzes your data to provide actionable recommendations.',
    tips: [
      'Switch tabs to see different AI features',
      'Insights tab: Smart spending analysis',
      'Tips tab: Proactive recommendations',
      'Agents tab: Automated financial tasks',
      'Memory tab: AI learns your preferences',
    ],
  },
  upcomingBills: {
    title: 'Upcoming Bills',
    description: 'Never miss a payment! Bills pulsing amber are due within 3 days and need attention.',
    tips: [
      'Amber pulse = urgent (due soon)',
      'Click "Pay Now" for quick payment',
      'Bills are sorted by due date',
      'Set up auto-pay to avoid late fees',
    ],
  },
  dailyBriefing: {
    title: 'Daily AI Briefing',
    description: 'Your personalized financial summary that highlights what matters most today.',
    tips: [
      'Updates every morning with fresh insights',
      'Prioritizes urgent financial matters',
      'Click suggested actions to take them',
    ],
  },
  smartActions: {
    title: 'Smart Action Chips',
    description: 'AI-generated suggestions based on your financial data and behavior patterns.',
    tips: [
      'Click any chip to take immediate action',
      'Chips are prioritized by urgency',
      'Actions refresh as your data changes',
    ],
  },
  widgetGrid: {
    title: 'Generative Widget Grid',
    description: 'Your dashboard layout adapts to show what\'s most important right now.',
    tips: [
      'Drag widgets to reorder them',
      'Pulsing borders indicate urgency',
      'Layout saves automatically',
    ],
  },
  portfolio: {
    title: 'Portfolio Overview',
    description: 'Track your investment performance across all connected accounts.',
    tips: [
      'Green/red shows gains/losses',
      'Total return includes dividends',
      'Click for detailed breakdown',
    ],
  },
  budgets: {
    title: 'Budget Tracker',
    description: 'Monitor your spending against budgets you\'ve set for different categories.',
    tips: [
      'Progress bar shows % spent',
      'Yellow = approaching limit',
      'Red = over budget',
      'Click category for details',
    ],
  },
  goals: {
    title: 'Savings Goals',
    description: 'Track progress toward your financial goals with visual milestones.',
    tips: [
      'Drag balance to contribute',
      'Celebrate when you hit milestones!',
      'Freeze days protect your streaks',
    ],
  },
  credit: {
    title: 'Credit Score',
    description: 'Monitor your credit health and track score changes over time.',
    tips: [
      'Score updates monthly',
      'Green arrow = improvement',
      'Click for score factors',
    ],
  },
  peerInsights: {
    title: 'Community Insights',
    description: 'Compare your savings to other $ave+ users with similar financial goals.',
    tips: [
      'See how you rank vs. community average',
      'Get tips from top savers',
      'Track goal completion rates',
      'Benchmarks update weekly',
    ],
  },
  journeyMilestones: {
    title: 'Journey Milestones',
    description: 'Track your financial journey with unlockable achievements and progress markers.',
    tips: [
      'Complete actions to unlock milestones',
      'View your progress timeline',
      'Expand cards for details',
      'Celebrate your achievements!',
    ],
  },
  skillTree: {
    title: 'Financial Skills',
    description: 'Level up your financial abilities by completing goals and milestones.',
    tips: [
      'Each skill has 5 levels',
      'Progress is calculated from activity',
      'Unlock advanced features as you level up',
      'Keep building skills for rewards',
    ],
  },
  weeklyChallenges: {
    title: 'Weekly Challenges',
    description: 'Join community savings challenges to boost your motivation.',
    tips: [
      'Compete with other savers',
      'Earn XP and rewards',
      'Weekly and monthly options',
      'Track participants count',
    ],
  },
  anomalyAlerts: {
    title: 'Anomaly Detection',
    description: 'AI-powered alerts for unusual spending patterns or bill changes.',
    tips: [
      'Red = high severity alert',
      'Yellow = moderate concern',
      'Click to view details',
      'Dismiss resolved issues',
    ],
  },
  portfolioWidget: {
    title: 'Portfolio Overview',
    description: 'Track your investment performance across all connected accounts.',
    tips: [
      'Shows total investment value',
      'Green/red indicates gains/losses',
      'Market change updates daily',
      'Click for detailed breakdown',
    ],
  },
};
