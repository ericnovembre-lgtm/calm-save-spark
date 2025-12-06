import React, { lazy, Suspense, useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DashboardLayout, GenerativeWidgetSpec, DashboardTheme } from '@/hooks/useClaudeGenerativeDashboard';
import { getBentoSizeClass, essentialWidgets } from '@/lib/bento-sizes';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useWidgetPreferences } from '@/hooks/useWidgetPreferences';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AnimatedWidgetWrapper } from '@/components/dashboard/AnimatedWidgetWrapper';
import { WidgetPinButton, PinnedIndicator } from '@/components/dashboard/WidgetPinButton';
import { WidgetQuickActions } from '@/components/dashboard/WidgetQuickActions';
import { useWidgetAnalytics } from '@/hooks/useWidgetAnalytics';
import { TooltipProvider } from '@/components/ui/tooltip';
import { StreamingWidgetSkeleton } from '@/components/dashboard/skeletons/StreamingWidgetSkeleton';
import { SwipeableWidget } from '@/components/dashboard/gestures/SwipeableWidget';
import { toast } from 'sonner';

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
  onModalOpen?: (modalId: string) => void;
  isStreaming?: boolean;
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
  // Map widget IDs to copilot IDs
  const getCoPilotId = (id: string): string => {
    const mapping: Record<string, string> = {
      'balance_hero': 'dashboard-balance',
      'net_worth': 'dashboard-balance',
      'goal_progress': 'dashboard-goals',
      'goals': 'dashboard-goals',
      'spending_breakdown': 'dashboard-spending',
      'budget_status': 'dashboard-spending',
      'budgets': 'dashboard-spending',
      'ai_insight': 'dashboard-ai-insights',
      'insights': 'dashboard-ai-insights',
      'quick_actions': 'dashboard-quick-actions',
      'actions': 'dashboard-quick-actions',
    };
    return mapping[id] || `dashboard-widget-${id}`;
  };

  switch (widgetId) {
    case 'balance_hero':
    case 'net_worth':
      return (
        <div data-copilot-id={getCoPilotId(widgetId)}>
          <EnhancedBalanceCard
          balance={totalBalance}
          monthlyGrowth={monthlyChange}
          savingsVelocity={savingsVelocity}
          weeklyTrend={weeklyTrend}
          />
        </div>
      );

    case 'goal_progress':
    case 'goals':
      return <div data-copilot-id={getCoPilotId(widgetId)}><GoalsSection /></div>;

    case 'spending_breakdown':
    case 'budget_status':
    case 'budgets':
      if (dashboardData?.budgets && dashboardData.budgets.length > 0) {
        return (
          <div data-copilot-id={getCoPilotId(widgetId)}>
            <BudgetsWidget
              budgets={dashboardData.budgets.map((b: any) => ({
                category: b.name,
                spent: b.spent_amount || 0,
                limit: b.budget_amount,
                color: b.color || 'hsl(var(--primary))'
              }))}
            />
          </div>
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
      return <div data-copilot-id={getCoPilotId(widgetId)}><UnifiedAIInsights /></div>;

    case 'quick_actions':
    case 'actions':
      return <div data-copilot-id={getCoPilotId(widgetId)} />; // Handled by NLQ commander

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
  className,
  onModalOpen,
  isStreaming = false
}: UnifiedGenerativeGridProps) {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const { preferences, isPinned, isHidden, updateOrder, toggleHide } = useWidgetPreferences();
  const { trackView, trackViewEnd, trackClick, trackDrag } = useWidgetAnalytics();
  
  // Track widget views with Intersection Observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const viewedWidgetsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const widgetId = entry.target.getAttribute('data-widget-id');
          if (!widgetId) return;
          
          if (entry.isIntersecting && !viewedWidgetsRef.current.has(widgetId)) {
            viewedWidgetsRef.current.add(widgetId);
            trackView(widgetId);
          } else if (!entry.isIntersecting && viewedWidgetsRef.current.has(widgetId)) {
            viewedWidgetsRef.current.delete(widgetId);
            trackViewEnd(widgetId);
          }
        });
      },
      { threshold: 0.5, rootMargin: '0px' }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, [trackView, trackViewEnd]);

  // Callback ref to observe widget elements
  const observeWidget = (element: HTMLElement | null, widgetId: string) => {
    if (element && observerRef.current) {
      element.setAttribute('data-widget-id', widgetId);
      observerRef.current.observe(element);
    }
  };
  
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

  // Default widget specs for essential widgets if not provided by Claude
  const defaultEssentialSpecs: Record<string, GenerativeWidgetSpec> = {
    ai_insight: {
      id: 'ai_insight',
      type: 'hybrid',
      headline: 'AI Insights',
      mood: 'calm',
      urgencyScore: 75
    },
    cashflow_forecast: {
      id: 'cashflow_forecast',
      type: 'chart',
      headline: '30-Day Forecast',
      mood: 'calm',
      urgencyScore: 70
    }
  };

  const getWidget = (widgetId: string) => widgets[widgetId] || defaultEssentialSpecs[widgetId];

  // Apply user preferences to grid items + force essential widgets
  const orderedGridItems = useMemo(() => {
    const gridIds = layout.grid.map(item => item.widgetId);
    
    // Force essential widgets if missing from Claude's layout
    const missingEssentials = essentialWidgets.filter(id => !gridIds.includes(id));
    const essentialItems = missingEssentials.map(widgetId => ({
      widgetId,
      position: 999,
      priority: 75
    }));
    
    // Merge essential items into layout
    const allGridItems = [...layout.grid, ...essentialItems];
    const allGridIds = allGridItems.map(item => item.widgetId);
    
    const pinnedIds = preferences.pinnedWidgets.filter(id => allGridIds.includes(id));
    const unpinnedIds = allGridIds.filter(id => !pinnedIds.includes(id));
    
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
      .map(id => allGridItems.find(item => item.widgetId === id)!)
      .filter(Boolean);
  }, [layout.grid, preferences]);

  // Track which widgets have loaded
  const [loadedWidgets, setLoadedWidgets] = useState<Set<string>>(new Set());
  
  // Mark widget as loaded after a brief delay to show skeleton transition
  const markWidgetLoaded = (widgetId: string) => {
    if (!loadedWidgets.has(widgetId)) {
      setTimeout(() => {
        setLoadedWidgets(prev => new Set([...prev, widgetId]));
      }, 300 + Math.random() * 200); // Stagger loading effect
    }
  };

  // Swipeable widget types (not hero, not essential)
  const swipeableWidgets = useMemo(() => new Set([
    'goal_progress', 'goals', 'spending_breakdown', 'budget_status', 'budgets',
    'investment_summary', 'portfolio', 'credit_score', 'credit', 'upcoming_bills',
    'bills', 'social_sentiment', 'sentiment', 'ai_usage', 'nudges', 'recommendations',
    'net_worth_chart', 'debt_tracker', 'debts', 'subscriptions', 'spending_alerts',
    'daily_briefing', 'briefing', 'streak_recovery'
  ]), []);

  const handleSwipeLeft = useCallback((widgetId: string) => {
    // Hide the widget
    toggleHide(widgetId);
    toast.info('Widget hidden', {
      description: 'You can restore it from the widget menu',
      action: {
        label: 'Undo',
        onClick: () => toggleHide(widgetId)
      }
    });
  }, [toggleHide]);

  const handleSwipeRight = useCallback((widgetId: string, onModalOpen?: (modalId: string) => void) => {
    // Trigger quick action based on widget type
    const quickActionMap: Record<string, string> = {
      'goal_progress': 'add_to_goal',
      'goals': 'add_to_goal',
      'upcoming_bills': 'pay_bill',
      'bills': 'pay_bill',
      'debt_tracker': 'debt_payment',
      'debts': 'debt_payment',
      'credit_score': 'credit_tips',
      'credit': 'credit_tips',
    };
    
    const modalId = quickActionMap[widgetId];
    if (modalId && onModalOpen) {
      onModalOpen(modalId);
    }
  }, []);

  const renderWidget = (widgetId: string, widget: GenerativeWidgetSpec, size: 'hero' | 'large' | 'medium' | 'compact') => {
    const isWidgetLoading = isStreaming || !loadedWidgets.has(widgetId);
    const isSwipeable = swipeableWidgets.has(widgetId) && size !== 'hero';
    
    // Auto-mark as loaded when not streaming
    if (!isStreaming && !loadedWidgets.has(widgetId)) {
      markWidgetLoaded(widgetId);
    }

    const widgetContent = (
      <StreamingWidgetSkeleton
        isLoading={isWidgetLoading}
        widgetType={widgetId}
      >
        <WidgetErrorBoundary widgetId={widgetId} widgetType={widget.headline}>
          <div 
            onClick={() => trackClick(widgetId)}
            className="cursor-pointer"
          >
            <RealWidgetRenderer
              widgetId={widgetId}
              widget={widget}
              size={size}
              dashboardData={dashboardData}
              accounts={accounts || []}
              userId={user?.id}
            />
          </div>
        </WidgetErrorBoundary>
      </StreamingWidgetSkeleton>
    );

    // Wrap swipeable widgets
    if (isSwipeable) {
      return (
        <SwipeableWidget
          onSwipeLeft={() => handleSwipeLeft(widgetId)}
          onSwipeRight={onModalOpen ? () => handleSwipeRight(widgetId, onModalOpen) : undefined}
          leftLabel="Hide"
          rightLabel="Quick Action"
          threshold={80}
        >
          {widgetContent}
        </SwipeableWidget>
      );
    }
    
    return widgetContent;
  };

  const handleReorder = (newOrder: string[]) => {
    // Track drag for any widget that changed position
    newOrder.forEach((id, index) => {
      const oldIndex = orderedGridItems.findIndex(item => item.widgetId === id);
      if (oldIndex !== index) {
        trackDrag(id, index);
      }
    });
    updateOrder(newOrder);
  };

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

      {/* Grid Section - Bento Layout */}
      {orderedGridItems.length > 0 && (
        <TooltipProvider>
          <Reorder.Group
            axis="y"
            values={orderedGridItems.map(item => item.widgetId)}
            onReorder={handleReorder}
            as="section"
            className="bento-grid"
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
                  className={cn(
                    "relative group",
                    getBentoSizeClass(item.widgetId)
                  )}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileDrag={{ 
                    scale: prefersReducedMotion ? 1 : 1.03, 
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                    zIndex: 50,
                  }}
                  ref={(el) => observeWidget(el, item.widgetId)}
                >
                  {/* Pin indicator */}
                  <PinnedIndicator isPinned={pinned} />
                  
                  {/* Action buttons on hover */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <WidgetQuickActions widgetId={item.widgetId} onModalOpen={onModalOpen} />
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
        </TooltipProvider>
      )}
    </motion.div>
  );
}
