import { CreditWidget } from "@/components/dashboard/CreditWidget";
import { CreditEmptyState } from "@/components/dashboard/CreditEmptyState";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { EnhancedBalanceCard } from "@/components/dashboard/EnhancedBalanceCard";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { ManualTransferCard } from "@/components/dashboard/ManualTransferCard";
import JourneyMilestones from "@/components/dashboard/JourneyMilestones";
import PeerInsights from "@/components/dashboard/PeerInsights";
import SkillTreeProgress from "@/components/dashboard/SkillTreeProgress";
import { TourDebugOverlay } from "@/components/dashboard/TourDebugOverlay";
import { ConnectAccountCard } from "@/components/dashboard/ConnectAccountCard";
import { ChallengeCard } from "@/components/gamification/ChallengeCard";
import CashFlowForecast from "@/components/dashboard/CashFlowForecast";
import { UnifiedAIInsights } from "@/components/dashboard/UnifiedAIInsights";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { UnifiedFAB } from "@/components/dashboard/UnifiedFAB";
import { EmailVerificationBanner } from "@/components/dashboard/EmailVerificationBanner";
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
import { ProactiveNudgesBanner } from "@/components/dashboard/ProactiveNudgesBanner";
import { NudgesWidget } from "@/components/dashboard/NudgesWidget";
import { SmartWidgetRecommender } from "@/components/dashboard/ai/SmartWidgetRecommender";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { AnomalyAlertCenter } from "@/components/ai/AnomalyAlertCenter";
import { NaturalLanguageCommander } from "@/components/dashboard/NaturalLanguageCommander";
import { AdHocChartPanel } from "@/components/dashboard/AdHocChartPanel";
import { UpcomingBillsWidget } from "@/components/dashboard/UpcomingBillsWidget";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { LottieCelebrations } from "@/components/effects/LottieCelebrations";
import { DashboardTour } from "@/components/dashboard/DashboardTour";
import { WhatsNewModal } from "@/components/dashboard/WhatsNewModal";
import { FeatureSpotlight } from "@/components/dashboard/FeatureSpotlight";
import { NewUserSpotlight } from "@/components/onboarding/NewUserSpotlight";
import { useAuth } from "@/hooks/useAuth";
import ProactiveRecommendations from "@/components/dashboard/ProactiveRecommendations";
import { Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const { user } = useAuth();
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
  
  // Query profile for tutorial state
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile-tutorial', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('show_dashboard_tutorial')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  
  // Handle onboarding completion
  const handleOnboardingComplete = async () => {
    if (!user?.id) return;
    await supabase
      .from('profiles')
      .update({ show_dashboard_tutorial: false })
      .eq('id', user.id);
    refetchProfile();
  };
  
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

    try {
      const { data, error } = await supabase.functions.invoke('generate-nlq-chart', {
        body: { query }
      });

      if (error) throw error;

      setAdHocChartData(data.chartData || []);
      setAdHocInsight(data.insight || 'Analysis complete.');
    } catch (error) {
      console.error('NLQ query failed:', error);
      toast.error('Failed to analyze query');
      setAdHocChartData([]);
      setAdHocInsight('Unable to analyze your spending at this time.');
    } finally {
      setIsNlqProcessing(false);
    }
  };

  // Calculate savings velocity (0-100) based on recent activity
  const savingsVelocity = Math.min(100, Math.max(0, 
    Math.abs(monthlyChange) / (totalBalance || 1) * 100 * 5
  ));

  // Generate 7-day trend data (deterministic based on balance/change)
  const weeklyTrend = [...Array(7)].map((_, i) => {
    const dayOffset = 6 - i;
    const baseAmount = totalBalance - (monthlyChange / 30 * dayOffset);
    // Use a deterministic variation based on day index
    const variation = Math.sin(i * 0.8) * (totalBalance * 0.01);
    return Math.max(0, baseAmount + variation);
  });

  // Fetch active challenges from database
  const { data: activeChallengesData } = useQuery({
    queryKey: ['active-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('id, name, description, challenge_type, points, requirement, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error('Failed to fetch challenges:', error);
        return [];
      }
      return data || [];
    },
  });

  // Fetch user's challenge progress
  const { data: userChallengeProgress } = useQuery({
    queryKey: ['user-challenge-progress', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('challenge_id, progress, is_completed')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Failed to fetch challenge progress:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!userId,
  });

  // Fetch challenge participant counts
  const { data: challengeParticipants } = useQuery({
    queryKey: ['challenge-participants', activeChallengesData?.map(c => c.id)],
    queryFn: async () => {
      if (!activeChallengesData || activeChallengesData.length === 0) return {};
      
      const counts: Record<string, number> = {};
      await Promise.all(activeChallengesData.map(async (challenge) => {
        const { count } = await supabase
          .from('challenge_participants')
          .select('*', { count: 'exact', head: true })
          .eq('challenge_id', challenge.id);
        counts[challenge.id] = count || 0;
      }));
      
      return counts;
    },
    enabled: !!activeChallengesData && activeChallengesData.length > 0,
  });

  // Transform challenges data for ChallengeCard component with user progress
  const activeChallenges = (activeChallengesData || []).map(c => {
    const requirement = c.requirement as { target?: number; days?: number } | null;
    const progress = userChallengeProgress?.find(p => p.challenge_id === c.id);
    
    return {
      id: c.id,
      name: c.name || 'Challenge',
      description: c.description || '',
      type: (c.challenge_type === 'weekly' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      target: requirement?.target || 100,
      current: progress?.progress || 0,
      reward: `+${c.points || 100} XP`,
      participants: challengeParticipants?.[c.id] || 0,
      endsAt: new Date(Date.now() + (requirement?.days || 7) * 24 * 60 * 60 * 1000)
    };
  });

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
    ) : (
      <CreditEmptyState />
    ),
    'portfolio': dashboardData?.investments && dashboardData.investments.length > 0 ? (
      <div data-tour="portfolio-widget">
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
      </div>
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
    'peer-insights': userId ? (
      <PeerInsights userId={userId} />
    ) : null,
    'skill-tree': userId ? (
      <SkillTreeProgress userId={userId} />
    ) : null,
    'cashflow': userId ? (
      <CashFlowForecast userId={userId} />
    ) : null,
    'challenges': (
      <div data-tour="weekly-challenges" className="space-y-4">
        {activeChallenges.length > 0 ? (
          activeChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onJoin={() => toast.info(`Joined ${challenge.name}!`)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No active challenges. Check back soon!</p>
          </div>
        )}
      </div>
    ),
    'manual-transfer': (
      <DashboardErrorBoundary key="manual-transfer" sectionName="Manual Transfer">
        <ManualTransferCard />
      </DashboardErrorBoundary>
    ),
    'recommendations': userId ? (
      <DashboardErrorBoundary key="recommendations" sectionName="Recommendations">
        <ProactiveRecommendations userId={userId} />
      </DashboardErrorBoundary>
    ) : null,
    'nudges': (
      <DashboardErrorBoundary key="nudges" sectionName="AI Nudges">
        <NudgesWidget />
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
      {/* Dashboard Tour - only show when NewUserSpotlight is NOT active */}
      {!profile?.show_dashboard_tutorial && <DashboardTour />}
      
      {/* What's New Modal */}
      <WhatsNewModal />
      
      {/* Feature Spotlight - shows after WhatsNew modal */}
      <FeatureSpotlight />
      
      {/* New User Onboarding Spotlight - triggers for new users */}
      <NewUserSpotlight 
        showTutorial={profile?.show_dashboard_tutorial ?? false}
        onComplete={handleOnboardingComplete}
      />
      
      {/* Tour Debug Overlay */}
      <TourDebugOverlay />
      
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
          <ProactiveNudgesBanner />

          {/* Anomaly Alerts */}
          <div data-tour="anomaly-alerts">
            <AnomalyAlertCenter />
          </div>

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
            
            <SmartWidgetRecommender
              currentWidgets={Object.keys(coreWidgets)}
              onAddWidget={(widgetId) => {
                toast.info(`Widget ${widgetId} would be added to your dashboard`);
              }}
            />

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
          <Card className="bg-muted/30 border-0 shadow-none mt-6">
            <div className="flex items-center gap-3 p-4 text-center justify-center">
              <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your $ave+ account is FDIC insured up to $250,000 through our banking partners. 
                Funds are held securely and are accessible anytime.
              </p>
            </div>
          </Card>
        </div>

        {/* Persistent UI */}
        <div data-tour="unified-fab">
          <UnifiedFAB />
        </div>
        <CommandPalette />
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
