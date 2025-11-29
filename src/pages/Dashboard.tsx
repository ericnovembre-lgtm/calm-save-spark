import { CreditWidget } from "@/components/dashboard/CreditWidget";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { EnhancedBalanceCard } from "@/components/dashboard/EnhancedBalanceCard";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { ManualTransferCard } from "@/components/dashboard/ManualTransferCard";
import JourneyMilestones from "@/components/dashboard/JourneyMilestones";
import { ConnectAccountCard } from "@/components/dashboard/ConnectAccountCard";
import { ChallengeCard } from "@/components/gamification/ChallengeCard";
import CashFlowForecast from "@/components/dashboard/CashFlowForecast";
import { UnifiedAIInsights } from "@/components/dashboard/UnifiedAIInsights";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { UnifiedFAB } from "@/components/dashboard/UnifiedFAB";
import { EmailVerificationBanner } from "@/components/dashboard/EmailVerificationBanner";
import { KeyboardHints } from "@/components/dashboard/KeyboardHints";
import { SkipLinks } from "@/components/accessibility/SkipLinks";
import { LiveRegionAnnouncer, useAnnounce } from "@/components/accessibility/LiveRegionAnnouncer";
import { SyncIndicator } from "@/components/ui/sync-indicator";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { QuickActionsWidget } from "@/components/mobile/QuickActionsWidget";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChatSidebar } from "@/components/dashboard/ChatSidebar";
import { useChatSidebar } from "@/hooks/useChatSidebar";
import { cn } from "@/lib/utils";
import { DashboardErrorBoundary } from "@/components/error/DashboardErrorBoundary";
import { MilestoneCelebration } from "@/components/effects/MilestoneCelebration";
import { useMilestoneDetector } from "@/hooks/useMilestoneDetector";
import { AuroraMeshBackground } from "@/components/dashboard/AuroraMeshBackground";
import { SentimentIndicator } from "@/components/dashboard/SentimentIndicator";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useGenerativeLayoutEngine } from "@/hooks/useGenerativeLayoutEngine";
import { DailyBriefingAgent } from "@/components/dashboard/DailyBriefingAgent";
import { SmartActionChips } from "@/components/dashboard/SmartActionChips";
import { GenerativeWidgetGrid } from "@/components/dashboard/GenerativeWidgetGrid";
import { PortfolioWidget } from "@/components/dashboard/PortfolioWidget";
import { BudgetsWidget } from "@/components/dashboard/BudgetsWidget";
import { SmartBanner } from "@/components/dashboard/SmartBanner";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { AnomalyAlertCenter } from "@/components/ai/AnomalyAlertCenter";
import { useKeyboardShortcuts, defaultDashboardShortcuts, useShortcutsHelp } from "@/hooks/useKeyboardShortcuts";
import { NaturalLanguageCommander } from "@/components/dashboard/NaturalLanguageCommander";
import { AdHocChartPanel } from "@/components/dashboard/AdHocChartPanel";
import { UpcomingBillsWidget } from "@/components/dashboard/UpcomingBillsWidget";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { LottieCelebrations } from "@/components/effects/LottieCelebrations";
import { DashboardTour } from "@/components/dashboard/DashboardTour";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { isOpen: isChatOpen, toggle: toggleChat } = useChatSidebar();
  const { announce } = useAnnounce();
  const [balanceAnnouncement, setBalanceAnnouncement] = useState('');
  const isMobile = useIsMobile();
  
  // NLQ state
  const [nlqQuery, setNlqQuery] = useState('');
  const [isNlqProcessing, setIsNlqProcessing] = useState(false);
  const [showAdHocChart, setShowAdHocChart] = useState(false);
  const [adHocChartData, setAdHocChartData] = useState<Array<{ name: string; value: number }>>([]);
  const [adHocInsight, setAdHocInsight] = useState('');
  
  // Celebrations state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'success' | 'achievement' | 'goal' | 'milestone'>('success');
  
  // Check onboarding status
  useOnboardingStatus(true);
  
  // Keyboard shortcuts
  const shortcuts = useKeyboardShortcuts([
    ...defaultDashboardShortcuts,
    {
      key: '?',
      shift: true,
      description: 'Show shortcuts',
      action: () => showHelp()
    }
  ]);
  const { showHelp } = useShortcutsHelp(shortcuts);
  
  // Sync status
  const { status: syncStatus, lastSynced, forceRefresh } = useSyncStatus();
  
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const userId = session?.user?.id;
  
  // Accounts still queried separately (not yet in dashboardData aggregation)
  const { data: accounts, isLoading: accountsLoading } = useQuery({
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

  const totalBalance = accounts?.reduce((sum, acc) => sum + parseFloat(String(acc.balance)), 0) || 0;
  
  const { milestone, dismissMilestone } = useMilestoneDetector(totalBalance);
  
  // Unified dashboard data aggregation (includes transactions, goals, pots, budgets, etc.)
  const { 
    data: dashboardData, 
    isLoading: dashboardDataLoading,
  } = useDashboardData();
  
  // Use transactions from dashboardData instead of separate query
  const transactions = dashboardData?.transactions || [];
  
  // Announce balance changes to screen readers
  useEffect(() => {
    if (totalBalance > 0) {
      const message = `Current balance: $${totalBalance.toLocaleString()}`;
      setBalanceAnnouncement(message);
      announce(message, 'polite');
    }
  }, [totalBalance, announce]);
  
  // Calculate this month's change
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  
  const monthlyChange = transactions
    ?.filter(tx => new Date(tx.transaction_date) >= thisMonth)
    .reduce((sum, tx) => sum + parseFloat(String(tx.amount)), 0) || 0;

  // Calculate net worth change percentage for sentiment UI
  const netWorthChangePercent = totalBalance > 0 ? (monthlyChange / totalBalance) * 100 : 0;

  // Get upcoming bills for priority engine
  const { upcomingBills } = useSubscriptions();

  // Generative Layout Engine - analyzes urgency and assigns priority scores
  const layoutPriorities = useGenerativeLayoutEngine({
    dashboardData,
    totalBalance,
    monthlyChange,
    hasAccounts: (accounts?.length || 0) > 0,
    upcomingBills: upcomingBills?.map(b => ({
      next_expected_date: b.next_expected_date,
      amount: Number(b.amount),
      merchant: b.merchant,
    })),
  });

  // NLQ handler - generate ad-hoc charts from natural language
  const handleNLQuery = async (query: string) => {
    setNlqQuery(query);
    setIsNlqProcessing(true);
    setShowAdHocChart(true);

    // Simulate AI processing - in production, this would call an edge function
    setTimeout(() => {
      // Mock data based on query keywords
      const mockData = query.toLowerCase().includes('coffee') 
        ? [
            { name: 'Coffee', value: 127.50 },
            { name: 'Tea', value: 45.20 },
          ]
        : query.toLowerCase().includes('groceries')
        ? [
            { name: 'Groceries', value: 450.00 },
            { name: 'Dining', value: 280.00 },
          ]
        : [
            { name: 'Shopping', value: 320.00 },
            { name: 'Entertainment', value: 180.00 },
            { name: 'Transport', value: 95.00 },
            { name: 'Utilities', value: 150.00 },
          ];

      setAdHocChartData(mockData);
      setAdHocInsight(`Based on your spending patterns, ${mockData[0].name.toLowerCase()} is your largest expense in this category.`);
      setIsNlqProcessing(false);
    }, 1500);
  };

  // Calculate savings velocity (0-100) based on recent activity
  const savingsVelocity = Math.min(100, Math.max(0, 
    Math.abs(monthlyChange) / (totalBalance || 1) * 100 * 5
  ));

  // Generate 7-day trend data
  const weeklyTrend = [...Array(7)].map((_, i) => {
    const dayOffset = 6 - i;
    const baseAmount = totalBalance - (monthlyChange / 30 * dayOffset);
    return Math.max(0, baseAmount + (Math.random() - 0.5) * 100);
  });

  // Mock challenges data
  const mockChallenges = [
    {
      id: '1',
      name: 'Weekly Savings Sprint',
      description: 'Save $500 this week',
      type: 'weekly' as const,
      target: 500,
      current: 320,
      reward: '+100 XP and 1 Streak Freeze',
      participants: 1247,
      endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Monthly Goal Master',
      description: 'Complete 3 savings goals this month',
      type: 'monthly' as const,
      target: 3,
      current: 1,
      reward: '+500 XP and Premium Badge',
      participants: 892,
      endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    }
  ];

  // Pull to refresh handler
  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['connected_accounts'] }),
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['pots'] }),
      queryClient.invalidateQueries({ queryKey: ['achievements'] }),
    ]);
    toast.success('Dashboard refreshed!');
  };

  // Handler for smart action chips with optimistic UI
  const handleSmartAction = async (actionId: string) => {
    const actionMessages: Record<string, string> = {
      'setup-autosave': 'Opening Auto-Save settings...',
      'complete-goal': 'Opening Goals...',
      'review-portfolio': 'Opening Portfolio...',
      'review-budget': 'Opening Budgets...',
      'move-to-savings': 'Opening Transfer...'
    };

    const message = actionMessages[actionId] || 'Processing action...';
    toast.success(message);

    try {
      switch (actionId) {
        case 'setup-autosave':
          document.getElementById('auto-save')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'complete-goal':
          document.getElementById('goals')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'review-portfolio':
          announce('Navigating to portfolio', 'polite');
          break;
        case 'review-budget':
          announce('Navigating to budgets', 'polite');
          break;
        case 'move-to-savings':
          document.getElementById('manual-transfer')?.scrollIntoView({ behavior: 'smooth' });
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Action failed. Please try again.');
      console.error('Smart action failed:', error);
    }
  };

  // Core 10 Generative Widgets
  const coreWidgets: Record<string, React.ReactNode> = {
    'balance': (
      <DashboardErrorBoundary key="balance" sectionName="Account Balance">
        <EnhancedBalanceCard 
          balance={totalBalance} 
          monthlyGrowth={monthlyChange}
          savingsVelocity={savingsVelocity}
          weeklyTrend={weeklyTrend}
          onDragToGoal={async (goalId: string, amount: number) => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('Not authenticated');

              const { error } = await supabase.rpc('contribute_to_goal', {
                p_goal_id: goalId,
                p_amount: amount,
                p_user_id: user.id,
                p_note: 'Drag-to-save contribution'
              });

              if (error) throw error;

              queryClient.invalidateQueries({ queryKey: ['goals'] });
              toast.success(`Added $${amount} to goal!`);
            } catch (error: any) {
              toast.error('Failed to contribute', {
                description: error.message
              });
            }
          }}
        />
      </DashboardErrorBoundary>
    ),
    'connect-account': <ConnectAccountCard key="connect-account" />,
    'goals': (
      <DashboardErrorBoundary key="goals" sectionName="Savings Goals">
        <GoalsSection />
      </DashboardErrorBoundary>
    ),
    'credit': dashboardData?.creditScore ? (
      <CreditWidget
        score={dashboardData.creditScore.score}
        change={dashboardData.creditScore.change}
        goal={dashboardData.creditGoal}
      />
    ) : null,
    'portfolio': dashboardData?.investments && dashboardData.investments.length > 0 ? (
      <PortfolioWidget
        totalValue={dashboardData.investments.reduce((sum, inv) => sum + inv.total_value, 0)}
        costBasis={dashboardData.investments.reduce((sum, inv) => sum + inv.cost_basis, 0)}
        marketChange={
          dashboardData.investments.length > 0
            ? dashboardData.investments.reduce((sum, inv) => {
                const change = inv.total_value > 0 ? ((inv.total_value - inv.cost_basis) / inv.cost_basis) * 100 : 0;
                return sum + change;
              }, 0) / dashboardData.investments.length
            : 0
        }
      />
    ) : null,
    'budgets': dashboardData?.budgets && dashboardData.budgets.length > 0 ? (
      <BudgetsWidget
        budgets={dashboardData.budgets.map(b => ({
          category: b.name,
          spent: b.budget_spending?.[0]?.spent_amount || 0,
          limit: b.total_limit
        }))}
      />
    ) : null,
    'ai-insights': userId ? (
      <DashboardErrorBoundary key="ai-insights" sectionName="AI Insights">
        <UnifiedAIInsights userId={userId} />
      </DashboardErrorBoundary>
    ) : null,
    'milestones': (
      <JourneyMilestones />
    ),
    'cashflow': userId ? (
      <CashFlowForecast userId={userId} />
    ) : null,
    'challenges': (
      <div className="space-y-4">
        {mockChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onJoin={() => toast.info(`Joined ${challenge.name}!`)}
          />
        ))}
      </div>
    ),
    'manual-transfer': (
      <DashboardErrorBoundary key="manual-transfer" sectionName="Manual Transfer">
        <ManualTransferCard />
      </DashboardErrorBoundary>
    ),
    'upcoming-bills': (
      <UpcomingBillsWidget 
        onPayBill={(billId) => {
          // Optimistic UI - celebrate payment
          setCelebrationType('success');
          setShowCelebration(true);
          toast.success('Payment initiated!');
        }}
      />
    ),
  };

  // Show skeleton while loading
  if (accountsLoading || dashboardDataLoading) return <DashboardSkeleton />;

  return (
    <AppLayout>
      {/* Dashboard Tour */}
      <DashboardTour />
      
      {/* Essential Effects */}
      <div data-tour="aurora-background">
        <AuroraMeshBackground netWorthChangePercent={netWorthChangePercent} />
      </div>
      <MilestoneCelebration milestone={milestone} onDismiss={dismissMilestone} />
      <LottieCelebrations 
        type={celebrationType} 
        isVisible={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
      />
      
      {/* Accessibility */}
      <SkipLinks />
      <LiveRegionAnnouncer message={balanceAnnouncement} priority="polite" />
      
      <PullToRefresh onRefresh={handleRefresh}>
        <div className={cn(
          "max-w-7xl mx-auto space-y-6 pb-20 px-4 sm:px-6 lg:px-8",
          "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isChatOpen && "lg:pr-[420px]"
        )}>
          {/* Critical Banners */}
          <EmailVerificationBanner />
          <SmartBanner />

          {/* Anomaly Alerts */}
          <AnomalyAlertCenter />

          {/* Header */}
          <div className="flex items-center justify-between mb-6 [&_svg]:drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            <SentimentIndicator netWorthChangePercent={netWorthChangePercent} />
            <SyncIndicator 
              status={syncStatus}
              lastSynced={lastSynced}
              onRefresh={forceRefresh}
            />
          </div>

          {/* Mobile Quick Actions */}
          {isMobile && <QuickActionsWidget />}

          {/* Generative Dashboard Layout */}
          <div className="space-y-6">
            <div data-tour="daily-briefing">
              <DailyBriefingAgent
                totalBalance={totalBalance}
                monthlyChange={monthlyChange}
                topPriorities={layoutPriorities.slice(0, 3)}
              />
            </div>
            
            <div data-tour="smart-actions">
              <SmartActionChips
                priorities={layoutPriorities}
                onAction={handleSmartAction}
              />
            </div>
            
            <div data-tour="widget-grid">
              <GenerativeWidgetGrid
                priorities={layoutPriorities}
                widgets={coreWidgets}
                onReorder={(newOrder) => {
                  announce('Dashboard layout updated', 'polite');
                  toast.success('Widget order saved!', { duration: 2000 });
                  console.log('New widget order:', newOrder.map(p => p.id));
                }}
              />
            </div>
          </div>
          
          {/* Footer Disclaimer */}
          <div className="text-center text-xs text-muted-foreground pt-4 pb-2">
            <p>
              Your $ave+ account is FDIC insured up to $250,000 through our banking partners.
              Funds are held securely and are accessible anytime.
            </p>
          </div>
        </div>

        {/* Persistent UI */}
        <div data-tour="unified-fab">
          <UnifiedFAB />
        </div>
        <CommandPalette />
        <KeyboardHints />
        <ChatSidebar isOpen={isChatOpen} onToggle={toggleChat} />
      </PullToRefresh>

      {/* Natural Language Commander */}
      <div data-tour="nlq-commander" className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30">
        <NaturalLanguageCommander 
          onQuery={handleNLQuery}
          isProcessing={isNlqProcessing}
        />
      </div>

      {/* Ad-Hoc Chart Panel */}
      <div className="fixed bottom-40 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4">
        <AdHocChartPanel
          isOpen={showAdHocChart}
          onClose={() => setShowAdHocChart(false)}
          query={nlqQuery}
          isLoading={isNlqProcessing}
          chartType="bar"
          data={adHocChartData}
          insight={adHocInsight}
        />
      </div>
    </AppLayout>
  );
}
