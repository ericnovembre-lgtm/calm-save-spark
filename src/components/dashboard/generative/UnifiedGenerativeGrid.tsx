import React, { lazy, Suspense, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DashboardLayout, GenerativeWidgetSpec, DashboardTheme } from '@/hooks/useClaudeGenerativeDashboard';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useWidgetPreferences } from '@/hooks/useWidgetPreferences';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AnimatedWidgetWrapper } from '@/components/dashboard/AnimatedWidgetWrapper';
import { WidgetPinButton, PinnedIndicator } from '@/components/dashboard/WidgetPinButton';

// Real widget components
import { EnhancedBalanceCard } from '@/components/dashboard/EnhancedBalanceCard';
import { GoalsSection } from '@/components/dashboard/GoalsSection';
import { BudgetsWidget } from '@/components/dashboard/BudgetsWidget';
import { PortfolioWidget } from '@/components/dashboard/PortfolioWidget';
import { CreditWidget } from '@/components/dashboard/CreditWidget';
import { CreditEmptyState } from '@/components/dashboard/CreditEmptyState';
import { UpcomingBillsWidget } from '@/components/dashboard/UpcomingBillsWidget';
import { UnifiedAIInsights } from '@/components/dashboard/UnifiedAIInsights';
import CashFlowForecast from '@/components/dashboard/CashFlowForecast';
import JourneyMilestones from '@/components/dashboard/JourneyMilestones';
import { ConnectAccountCard } from '@/components/dashboard/ConnectAccountCard';
import { useAuth } from '@/hooks/useAuth';
import { SocialSentimentWidget } from '@/components/dashboard/SocialSentimentWidget';
import { AIUsageSummaryWidget } from '@/components/dashboard/AIUsageSummaryWidget';
import { TaxDocumentUploadWidget } from '@/components/dashboard/TaxDocumentUploadWidget';
import { NudgesWidget } from '@/components/dashboard/NudgesWidget';
import { GenerativeWidgetRenderer } from './GenerativeWidgetRenderer';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Lazy load new widgets
const NetWorthMiniChart = lazy(() => import('./widgets/NetWorthMiniChart'));
const DebtTrackerMini = lazy(() => import('./widgets/DebtTrackerMini'));
const SubscriptionsMini = lazy(() => import('./widgets/SubscriptionsMini'));
const SpendingAlertsMini = lazy(() => import('./widgets/SpendingAlertsMini'));
const PredictiveAnalytics = lazy(() => import('@/components/dashboard/PredictiveAnalytics').then(m => ({ default: m.PredictiveAnalytics })));
const DailyBriefingCard = lazy(() => import('@/components/dashboard/DailyBriefingCard').then(m => ({ default: m.DailyBriefingCard })));
const StreakRecoveryBanner = lazy(() => import('@/components/dashboard/StreakRecoveryBanner').then(m => ({ default: m.StreakRecoveryBanner })));

interface UnifiedGenerativeGridProps {
  layout: DashboardLayout;
  widgets: Record<string, GenerativeWidgetSpec>;
  theme: DashboardTheme;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

const WidgetSkeleton = () => (
  <div className="h-48 rounded-xl bg-muted/50 animate-pulse" />
);

// Map AI widget IDs to real React components
function RealWidgetRenderer({ 
  widgetId, 
  widget,
  size,
  dashboardData,
  accounts,
  userId
}: { 
  widgetId: string;
  widget: GenerativeWidgetSpec;
  size: 'hero' | 'large' | 'medium' | 'compact';
  dashboardData: any;
  accounts: any[];
  userId?: string;
}) {
  const totalBalance = accounts?.reduce((sum, acc) => sum + parseFloat(String(acc.balance)), 0) || 0;
  
  // Calculate monthly change from transactions
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  
  const transactions = dashboardData?.transactions || [];
  const monthlyChange = transactions
    ?.filter((tx: any) => new Date(tx.transaction_date) >= thisMonth)
    .reduce((sum: number, tx: any) => sum + parseFloat(String(tx.amount)), 0) || 0;

  // Calculate savings velocity
  const savingsVelocity = Math.min(100, Math.max(0, 
    Math.abs(monthlyChange) / (totalBalance || 1) * 100 * 5
  ));

  // Generate weekly trend
  const weeklyTrend = [...Array(7)].map((_, i) => {
    const dayOffset = 6 - i;
    const baseAmount = totalBalance - (monthlyChange / 30 * dayOffset);
    const variation = Math.sin(i * 0.8) * (totalBalance * 0.01);
    return Math.max(0, baseAmount + variation);
  });

  // Map widget IDs to real components
  switch (widgetId) {
    case 'balance_hero':
    case 'net_worth':
      return (
        <EnhancedBalanceCard 
          balance={totalBalance}
          monthlyGrowth={monthlyChange}
          savingsVelocity={savingsVelocity}
          weeklyTrend={weeklyTrend}
        />
      );

    case 'goal_progress':
    case 'goals':
      return <GoalsSection />;

    case 'spending_breakdown':
    case 'budget_status':
    case 'budgets':
      if (dashboardData?.budgets && dashboardData.budgets.length > 0) {
        return (
          <BudgetsWidget
            budgets={dashboardData.budgets.map((b: any) => ({
              category: b.name,
              spent: b.spent_amount || 0,
              limit: b.budget_amount,
              color: b.color || 'hsl(var(--primary))'
            }))}
          />
        );
      }
      return null;

    case 'investment_summary':
    case 'portfolio':
      if (dashboardData?.investments && dashboardData.investments.length > 0) {
        return (
          <PortfolioWidget
            totalValue={dashboardData.investments.reduce((sum: number, inv: any) => sum + inv.total_value, 0)}
            costBasis={dashboardData.investments.reduce((sum: number, inv: any) => sum + inv.cost_basis, 0)}
            marketChange={
              dashboardData.investments.length > 0
                ? dashboardData.investments.reduce((sum: number, inv: any) => {
                    const change = inv.total_value > 0 ? ((inv.total_value - inv.cost_basis) / inv.cost_basis) * 100 : 0;
                    return sum + change;
                  }, 0) / dashboardData.investments.length
                : 0
            }
          />
        );
      }
      return null;

    case 'credit_score':
    case 'credit':
      if (dashboardData?.creditScore) {
        return (
          <CreditWidget
            score={dashboardData.creditScore.score}
            change={dashboardData.creditScore.change}
            goal={dashboardData.creditGoal}
          />
        );
      }
      return <CreditEmptyState />;

    case 'upcoming_bills':
    case 'bills':
      return <UpcomingBillsWidget />;

    case 'ai_insight':
    case 'insights':
      return <UnifiedAIInsights />;

    case 'quick_actions':
    case 'actions':
      return null; // Handled by NLQ commander

    case 'cashflow_forecast':
    case 'cashflow':
      return userId ? <CashFlowForecast userId={userId} /> : null;

    case 'savings_streak':
    case 'milestones':
    case 'journey':
      return <JourneyMilestones />;

    case 'connect_account':
    case 'accounts':
      return <ConnectAccountCard />;

    case 'social_sentiment':
    case 'sentiment':
      return <SocialSentimentWidget />;

    case 'ai_usage':
      return <AIUsageSummaryWidget />;

    case 'tax_documents':
      return <TaxDocumentUploadWidget />;

    case 'nudges':
    case 'recommendations':
      return <NudgesWidget />;

    // New widget types
    case 'net_worth_chart':
      return (
        <Suspense fallback={<WidgetSkeleton />}>
          <NetWorthMiniChart userId={userId} />
        </Suspense>
      );

    case 'debt_tracker':
    case 'debts':
      return (
        <Suspense fallback={<WidgetSkeleton />}>
          <DebtTrackerMini userId={userId} />
        </Suspense>
      );

    case 'subscriptions':
    case 'subscription_manager':
      return (
        <Suspense fallback={<WidgetSkeleton />}>
          <SubscriptionsMini userId={userId} />
        </Suspense>
      );

    case 'spending_alerts':
    case 'budget_alerts':
      return (
        <Suspense fallback={<WidgetSkeleton />}>
          <SpendingAlertsMini userId={userId} />
        </Suspense>
      );

    case 'what_if_analysis':
    case 'predictive':
      // PredictiveAnalytics requires props, skip if no data
      return null;

    case 'daily_briefing':
    case 'briefing':
      return (
        <Suspense fallback={<WidgetSkeleton />}>
          <DailyBriefingCard />
        </Suspense>
      );

    case 'streak_recovery':
    case 'streak_warning':
      return (
        <Suspense fallback={<WidgetSkeleton />}>
          <StreakRecoveryBanner />
        </Suspense>
      );

    default:
      // Fall back to generic AI-generated widget renderer
      return (
        <GenerativeWidgetRenderer
          widget={widget}
          size={size}
        />
      );
  }
}

export function UnifiedGenerativeGrid({ 
  layout, 
  widgets,
  theme,
  className 
}: UnifiedGenerativeGridProps) {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const { preferences, isPinned, isHidden, updateOrder } = useWidgetPreferences();
  
  // Fetch real dashboard data to pass to widgets
  const { data: dashboardData } = useDashboardData();
  
  const { data: accounts } = useQuery({
    queryKey: ['connected_accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connected_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getWidget = (widgetId: string) => widgets[widgetId];

  // Apply user preferences to grid items
  const orderedGridItems = useMemo(() => {
    const gridIds = layout.grid.map(item => item.widgetId);
    const pinnedIds = preferences.pinnedWidgets.filter(id => gridIds.includes(id));
    const unpinnedIds = gridIds.filter(id => !pinnedIds.includes(id));
    
    // Apply custom order if set
    if (preferences.widgetOrder.length > 0) {
      unpinnedIds.sort((a, b) => {
        const aIdx = preferences.widgetOrder.indexOf(a);
        const bIdx = preferences.widgetOrder.indexOf(b);
        if (aIdx === -1 && bIdx === -1) return 0;
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });
    }
    
    // Filter out hidden widgets and combine pinned first
    return [...pinnedIds, ...unpinnedIds]
      .filter(id => !preferences.hiddenWidgets.includes(id))
      .map(id => layout.grid.find(item => item.widgetId === id)!)
      .filter(Boolean);
  }, [layout.grid, preferences]);

  const renderWidget = (widgetId: string, widget: GenerativeWidgetSpec, size: 'hero' | 'large' | 'medium' | 'compact') => (
    <WidgetErrorBoundary widgetId={widgetId} widgetType={widget.headline}>
      <RealWidgetRenderer
        widgetId={widgetId}
        widget={widget}
        size={size}
        dashboardData={dashboardData}
        accounts={accounts || []}
        userId={user?.id}
      />
    </WidgetErrorBoundary>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-6", className)}
    >
      {/* Hero Section */}
      <AnimatePresence mode="wait">
        {layout.hero && getWidget(layout.hero.widgetId) && (
          <motion.section
            key="hero"
            variants={itemVariants}
            className="w-full"
            data-tour="hero-widget"
          >
            {renderWidget(layout.hero.widgetId, getWidget(layout.hero.widgetId)!, 'hero')}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Featured Section */}
      {layout.featured.length > 0 && (
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          data-tour="featured-widgets"
        >
          {layout.featured.map((item, index) => {
            const widget = getWidget(item.widgetId);
            if (!widget) return null;
            return (
              <motion.div
                key={item.widgetId}
                variants={itemVariants}
                className={cn(
                  item.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'
                )}
              >
                {renderWidget(item.widgetId, widget, item.size)}
              </motion.div>
            );
          })}
        </motion.section>
      )}

      {/* Grid Section - Reorderable */}
      {orderedGridItems.length > 0 && (
        <Reorder.Group
          axis="y"
          values={orderedGridItems.map(item => item.widgetId)}
          onReorder={(newOrder) => updateOrder(newOrder)}
          as="section"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          data-tour="grid-widgets"
          layoutScroll
        >
          {orderedGridItems.map((item, index) => {
            const widget = getWidget(item.widgetId);
            if (!widget) return null;
            const pinned = isPinned(item.widgetId);
            
            return (
              <Reorder.Item
                key={item.widgetId}
                value={item.widgetId}
                as="div"
                layout={prefersReducedMotion ? undefined : "position"}
                className="relative group"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                whileDrag={{ 
                  scale: prefersReducedMotion ? 1 : 1.03, 
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                  zIndex: 50,
                }}
              >
                {/* Pin indicator */}
                <PinnedIndicator isPinned={pinned} />
                
                {/* Pin button on hover */}
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <WidgetPinButton widgetId={item.widgetId} />
                </div>
                
                <AnimatedWidgetWrapper
                  widgetId={item.widgetId}
                  enterDelay={index * 0.03}
                  changeAnimation="flash"
                >
                  {renderWidget(item.widgetId, widget, 'compact')}
                </AnimatedWidgetWrapper>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}
    </motion.div>
  );
}
