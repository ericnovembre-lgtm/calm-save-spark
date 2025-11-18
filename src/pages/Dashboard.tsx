import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { BalanceCard } from "@/components/BalanceCard";
import { EnhancedBalanceCard } from "@/components/dashboard/EnhancedBalanceCard";
import { SwipeableGoalCard } from "@/components/dashboard/SwipeableGoalCard";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { UnifiedFAB } from "@/components/dashboard/UnifiedFAB";
import { AIInsightsCard } from "@/components/dashboard/AIInsightsCard";
import { PredictiveAnalytics } from "@/components/dashboard/PredictiveAnalytics";
import { KeyboardHints } from "@/components/dashboard/KeyboardHints";
import { AutoSaveBanner } from "@/components/dashboard/AutoSaveBanner";
import { EmailVerificationBanner } from "@/components/dashboard/EmailVerificationBanner";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { ManualTransferCard } from "@/components/dashboard/ManualTransferCard";
import { ScheduledTransferDialog } from "@/components/dashboard/ScheduledTransferDialog";
import { ScheduledTransfersList } from "@/components/dashboard/ScheduledTransfersList";
import { TransferHistory } from "@/components/dashboard/TransferHistory";
import JourneyMilestones from "@/components/dashboard/JourneyMilestones";
import { OnboardingProgress } from "@/components/dashboard/OnboardingProgress";
import { ConnectAccountCard } from "@/components/dashboard/ConnectAccountCard";
import { LoadingState } from "@/components/LoadingState";
import { AchievementNotification } from "@/components/gamification/AchievementNotification";
import { useAchievementNotifications } from "@/hooks/useAchievementNotifications";
import ProactiveRecommendations from "@/components/dashboard/ProactiveRecommendations";
import CashFlowForecast from "@/components/dashboard/CashFlowForecast";
import SkillTreeProgress from "@/components/dashboard/SkillTreeProgress";
import PeerInsights from "@/components/dashboard/PeerInsights";
import { DynamicWelcome } from "@/components/dashboard/DynamicWelcome";
import { GoalTimeline } from "@/components/dashboard/GoalTimeline";
import { StreakRecoveryBanner } from "@/components/dashboard/StreakRecoveryBanner";
import { StreakTrackerHeader } from "@/components/gamification/StreakTrackerHeader";
import { LevelSystem } from "@/components/gamification/LevelSystem";
import { EnhancedAchievementToast } from "@/components/gamification/EnhancedAchievementToast";
import { GoalCompletionCelebration } from "@/components/gamification/GoalCompletionCelebration";
import { ChallengeCard } from "@/components/gamification/ChallengeCard";
import { useEnhancedAchievements } from "@/hooks/useEnhancedAchievements";
import { SkipLinks } from "@/components/accessibility/SkipLinks";
import { LiveRegionAnnouncer, useAnnounce } from "@/components/accessibility/LiveRegionAnnouncer";
import { useProgressiveSections } from "@/hooks/useProgressiveLoad";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { useKeyboardShortcuts, defaultDashboardShortcuts, useShortcutsHelp } from "@/hooks/useKeyboardShortcuts";
import { SyncIndicator } from "@/components/ui/sync-indicator";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { LayoutManager } from "@/components/dashboard/LayoutManager";
import { AdvancedAnalyticsDashboard } from "@/components/analytics/AdvancedAnalyticsDashboard";
import { ThemeCustomizer } from "@/components/dashboard/ThemeCustomizer";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { BudgetWidget } from "@/components/mobile/BudgetWidget";
import { QuickActionsWidget } from "@/components/mobile/QuickActionsWidget";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDashboardOrder } from "@/hooks/useDashboardOrder";
import { Reorder, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { staggerContainer } from "@/lib/motion-variants";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { SaveplusCoachWidget } from "@/components/coach/SaveplusCoachWidget";
import { ChatSidebar } from "@/components/dashboard/ChatSidebar";
import { useChatSidebar } from "@/hooks/useChatSidebar";
import { cn } from "@/lib/utils";
import { InteractiveWizard, hasCompletedWizard } from "@/components/onboarding/InteractiveWizard";
import { NextGenFeaturesCard } from "@/components/dashboard/NextGenFeaturesCard";
import { DASHBOARD_WIZARD_STEPS, type WizardStepWithIcon } from "@/lib/wizard-steps";
import type { WizardStep } from "@/components/onboarding/InteractiveWizard";
import { createElement } from "react";
import { DashboardTutorialOverlay } from "@/components/onboarding/DashboardTutorialOverlay";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import { DashboardErrorBoundary } from "@/components/error/DashboardErrorBoundary";
import { PersonalImpactCard } from "@/components/dashboard/PersonalImpactCard";
import { AIAgentsCard } from "@/components/dashboard/AIAgentsCard";
import { HelpButton } from "@/components/dashboard/HelpButton";
import { SecretTheme } from "@/components/effects/SecretTheme";
import { HolidayEffect } from "@/components/effects/HolidayEffect";
import { WelcomeBackBanner } from "@/components/auth/WelcomeBackBanner";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { MilestoneCelebration } from "@/components/effects/MilestoneCelebration";
import { useMilestoneDetector } from "@/hooks/useMilestoneDetector";
import { FloatingCoins } from "@/components/effects/FloatingCoins";
import { CursorSpotlight } from "@/components/effects/CursorSpotlight";
import { TimeOfDayTheme } from "@/components/effects/TimeOfDayTheme";

export default function Dashboard() {
  const { newAchievements, dismissAchievements } = useAchievementNotifications();
  const { currentAchievement, handleDismiss: handleAchievementDismiss } = useEnhancedAchievements();
  const [completedGoal, setCompletedGoal] = useState<any>(null);
  const queryClient = useQueryClient();
  const [isReordering, setIsReordering] = useState(false);
  const { isOpen: isChatOpen, toggle: toggleChat } = useChatSidebar();
  const [showWizard, setShowWizard] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Easter eggs
  const [easterEggsEnabled] = useState(() => localStorage.getItem('easter-eggs-enabled') !== 'false');
  const { success: konamiActive, reset: resetKonami } = useKonamiCode(() => {
    if (easterEggsEnabled) toast.success("🎮 Developer Mode Activated!", { duration: 3000 });
  });
  
  // Progressive loading
  const { isSectionLoaded } = useProgressiveSections();
  
  // Accessibility
  const { announce } = useAnnounce();
  const [balanceAnnouncement, setBalanceAnnouncement] = useState('');
  
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
  
  // Check onboarding status and redirect if not completed
  useOnboardingStatus(true);
  
  const { cardOrder, updateOrder, collapsedSections, toggleCollapsed } = useDashboardOrder(userId);
  
  // Check if wizard should be shown to first-time users
  useEffect(() => {
    const checkWizardStatus = async () => {
      if (!userId) return;
      
      // Check if wizard has been completed
      if (hasCompletedWizard()) {
        setShowWizard(false);
        return;
      }
      
      // Check if user has completed onboarding and should see tutorial
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, show_dashboard_tutorial')
        .eq('id', userId)
        .single();
      
      // Show tutorial if flag is set (from post-onboarding)
      if (profile?.show_dashboard_tutorial) {
        setShowTutorial(true);
        // Clear the flag so it doesn't show again
        await supabase
          .from('profiles')
          .update({ show_dashboard_tutorial: false })
          .eq('id', userId);
      }
      // Otherwise show wizard after initial onboarding
      else if (profile?.onboarding_completed) {
        setShowWizard(true);
      }
    };
    
    checkWizardStatus();
  }, [userId]);
  
  // Convert icon components to React elements
  const wizardSteps: WizardStep[] = DASHBOARD_WIZARD_STEPS.map(step => ({
    ...step,
    icon: step.iconComponent ? createElement(step.iconComponent, { className: "w-5 h-5" }) : undefined
  }));
  
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

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const totalBalance = accounts?.reduce((sum, acc) => sum + parseFloat(String(acc.balance)), 0) || 0;
  
  const { milestone, dismissMilestone } = useMilestoneDetector(totalBalance);
  
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

  // Calculate savings velocity (0-100) based on recent activity
  const savingsVelocity = Math.min(100, Math.max(0, 
    Math.abs(monthlyChange) / (totalBalance || 1) * 100 * 5 // Scale up for visibility
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

  // Card mapping for reorderable sections
  const cardComponents: Record<string, React.ReactNode> = {
    'personal-impact': userId ? (
      <DashboardErrorBoundary key="personal-impact" sectionName="Personal Impact">
        <PersonalImpactCard userId={userId} />
      </DashboardErrorBoundary>
    ) : null,
    'ai-agents': (
      <DashboardErrorBoundary key="ai-agents" sectionName="AI Agents">
        <AIAgentsCard />
      </DashboardErrorBoundary>
    ),
    'coach-widget': (
      <CollapsibleSection
        key="coach-widget"
        id="coach-widget"
        title="AI Coach Insights"
        description="Personalized financial guidance and tips"
        defaultOpen={!collapsedSections['coach-widget']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <SaveplusCoachWidget />
      </CollapsibleSection>
    ),
    'balance': (
      <DashboardErrorBoundary key="balance" sectionName="Account Balance">
        <CollapsibleSection
          key="balance"
          id="balance"
          title="Account Balance"
          description="Your total savings across all accounts"
          defaultOpen={!collapsedSections['balance']}
          onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
        >
          <div data-wizard="balance-card">
            <EnhancedBalanceCard 
              balance={totalBalance} 
              monthlyGrowth={monthlyChange}
              savingsVelocity={savingsVelocity}
              weeklyTrend={weeklyTrend}
            />
          </div>
        </CollapsibleSection>
      </DashboardErrorBoundary>
    ),
    'connect-account': <ConnectAccountCard key="connect-account" />,
    'auto-save': <AutoSaveBanner key="auto-save" />,
    'onboarding': <OnboardingProgress key="onboarding" />,
    'milestones': (
      <CollapsibleSection
        key="milestones"
        id="milestones"
        title="Journey Milestones"
        description="Track your savings journey"
        defaultOpen={!collapsedSections['milestones']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <div data-wizard="milestones">
          <JourneyMilestones />
        </div>
      </CollapsibleSection>
    ),
    'ai-insights': (
      <DashboardErrorBoundary key="ai-insights" sectionName="AI-Powered Insights">
        <CollapsibleSection
          key="ai-insights"
          id="ai-insights"
          title="AI-Powered Insights"
          description="Smart recommendations just for you"
          defaultOpen={!collapsedSections['ai-insights']}
          onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
        >
          <AIInsightsCard />
        </CollapsibleSection>
      </DashboardErrorBoundary>
    ),
    'recommendations': userId ? (
      <CollapsibleSection
        key="recommendations"
        id="recommendations"
        title="Smart Recommendations"
        description="Personalized insights for your goals"
        defaultOpen={!collapsedSections['recommendations']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <div data-wizard="insights">
          <ProactiveRecommendations userId={userId} />
        </div>
      </CollapsibleSection>
    ) : null,
    'skill-tree': userId ? (
      <CollapsibleSection
        key="skill-tree"
        id="skill-tree"
        title="Skill Progress"
        description="Level up your financial skills"
        defaultOpen={!collapsedSections['skill-tree']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <SkillTreeProgress userId={userId} />
      </CollapsibleSection>
    ) : null,
    'cashflow': userId ? (
      <CollapsibleSection
        key="cashflow"
        id="cashflow"
        title="Cash Flow Forecast"
        description="Predict your future balance"
        defaultOpen={!collapsedSections['cashflow']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <CashFlowForecast userId={userId} />
      </CollapsibleSection>
    ) : null,
    'challenges': (
      <CollapsibleSection
        key="challenges"
        id="challenges"
        title="Active Challenges"
        description="Join community challenges and earn rewards"
        defaultOpen={!collapsedSections['challenges']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <div className="space-y-4">
          {mockChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onJoin={() => toast.info(`Joined ${challenge.name}!`)}
            />
          ))}
        </div>
      </CollapsibleSection>
    ),
    'peer-insights': userId ? (
      <CollapsibleSection
        key="peer-insights"
        id="peer-insights"
        title="Peer Insights"
        description="Compare with similar savers"
        defaultOpen={!collapsedSections['peer-insights']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <PeerInsights userId={userId} />
      </CollapsibleSection>
    ) : null,
    'timeline': userId ? (
      <CollapsibleSection
        key="timeline"
        id="timeline"
        title="Goal Timeline"
        description="Visualize your progress"
        defaultOpen={!collapsedSections['timeline']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <GoalTimeline userId={userId} />
      </CollapsibleSection>
    ) : null,
    'predictive': (
      <CollapsibleSection
        key="predictive"
        id="predictive"
        title="Predictive Analytics"
        description="Explore different savings scenarios"
        defaultOpen={!collapsedSections['predictive']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <PredictiveAnalytics
          currentSavingsRate={250}
          goalAmount={10000}
          currentAmount={2500}
        />
      </CollapsibleSection>
    ),
    'goals': (
      <DashboardErrorBoundary key="goals" sectionName="Savings Goals">
        <CollapsibleSection
          key="goals"
          id="goals"
          title="Savings Goals"
          description="Your active savings targets"
          defaultOpen={!collapsedSections['goals']}
          onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
        >
          <div data-wizard="goals-section">
            <GoalsSection />
          </div>
        </CollapsibleSection>
      </DashboardErrorBoundary>
    ),
    'scheduled': (
      <CollapsibleSection
        key="scheduled"
        id="scheduled"
        title="Transfer Options"
        description="Move money to your savings goals"
        defaultOpen={!collapsedSections['scheduled']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <div className="flex items-center justify-between mb-4">
          <ScheduledTransferDialog />
        </div>
        <ScheduledTransfersList />
      </CollapsibleSection>
    ),
    'manual-transfer': (
      <DashboardErrorBoundary key="manual-transfer" sectionName="Manual Transfer">
        <div data-wizard="manual-transfer" key="manual-transfer">
          <ManualTransferCard />
        </div>
      </DashboardErrorBoundary>
    ),
    'history': (
      <CollapsibleSection
        key="history"
        id="history"
        title="Transfer History"
        description="Recent transactions"
        defaultOpen={!collapsedSections['history']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <TransferHistory />
      </CollapsibleSection>
    ),
    'analytics-dashboard': (
      <DashboardErrorBoundary key="analytics-dashboard" sectionName="Analytics Dashboard">
        <CollapsibleSection
          key="analytics-dashboard"
          id="analytics-dashboard"
          title="Analytics Dashboard"
          description="Key performance metrics"
          defaultOpen={!collapsedSections['analytics-dashboard']}
          onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
        >
          <AdvancedAnalyticsDashboard />
        </CollapsibleSection>
      </DashboardErrorBoundary>
    ),
    'layout-manager': (
      <CollapsibleSection
        key="layout-manager"
        id="layout-manager"
        title="Layout Manager"
        description="Save and manage custom layouts"
        defaultOpen={!collapsedSections['layout-manager']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <LayoutManager 
          currentLayout={cardOrder}
          onLayoutChange={updateOrder}
        />
      </CollapsibleSection>
    ),
    'theme-customizer': (
      <CollapsibleSection
        key="theme-customizer"
        id="theme-customizer"
        title="Theme Customizer"
        description="Personalize your experience"
        defaultOpen={!collapsedSections['theme-customizer']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
      <ThemeCustomizer />
      </CollapsibleSection>
    ),
    'next-gen-features': (
      <DashboardErrorBoundary key="next-gen-features" sectionName="Next-Gen Features">
        <CollapsibleSection
          key="next-gen-features"
          id="next-gen-features"
          title="Next-Gen Features"
          description="Explore cutting-edge tools"
          defaultOpen={!collapsedSections['next-gen-features']}
          onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
        >
          <NextGenFeaturesCard />
        </CollapsibleSection>
      </DashboardErrorBoundary>
    ),
  };

  if (accountsLoading) return <LoadingState />;

  const isMobile = useIsMobile();

  return (
    <AppLayout>
      <WelcomeBackBanner />
      <SkipLinks />
      {easterEggsEnabled && (
        <>
          <SecretTheme active={konamiActive} onExit={resetKonami} />
          <HolidayEffect />
          <MilestoneCelebration milestone={milestone} onDismiss={dismissMilestone} />
          {totalBalance > 1000 && <FloatingCoins density="low" elements="coins" />}
          <CursorSpotlight />
          <TimeOfDayTheme enabled />
        </>
      )}
      <LiveRegionAnnouncer message={balanceAnnouncement} priority="polite" />
      
      <PullToRefresh onRefresh={handleRefresh}>
        <AchievementNotification 
          achievements={newAchievements}
          onDismiss={dismissAchievements}
        />
        
        <div className={cn(
          "max-w-7xl mx-auto space-y-6 pb-20 transition-all duration-300 px-4 sm:px-6 lg:px-8",
          isChatOpen && "lg:pr-[420px]"
        )}>
          <EmailVerificationBanner />
      <EnhancedAchievementToast 
        achievement={currentAchievement} 
        onDismiss={handleAchievementDismiss} 
      />
      
      <GoalCompletionCelebration 
        goal={completedGoal}
        onDismiss={() => setCompletedGoal(null)}
        onNextGoal={() => {
          setCompletedGoal(null);
          // Navigate to goals or open goal creation
        }}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <StreakTrackerHeader />
          <LevelSystem />
          <SyncIndicator 
            status={syncStatus}
            lastSynced={lastSynced}
            onRefresh={forceRefresh}
          />
        </div>
      </div>

      <StreakRecoveryBanner />

          <div className="bg-card rounded-lg p-8 shadow-[var(--shadow-card)]">
            <DynamicWelcome />
          </div>

          {/* Mobile Widgets */}
          {isMobile && (
            <div className="space-y-4">
              <QuickActionsWidget />
              <BudgetWidget />
            </div>
          )}

          {/* Reorderable Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <Reorder.Group
              axis="y"
              values={cardOrder}
              onReorder={(newOrder) => {
                updateOrder(newOrder);
                if (!isReordering) {
                  setIsReordering(true);
                  toast.info('Dashboard layout saved!');
                  setTimeout(() => setIsReordering(false), 300);
                }
              }}
              className="space-y-6"
            >
              {cardOrder.map((cardId) => {
                const component = cardComponents[cardId];
                if (!component) return null;

                return (
                  <Reorder.Item
                    key={cardId}
                    value={cardId}
                    className="cursor-grab active:cursor-grabbing"
                    drag="y"
                  >
                    {component}
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </motion.div>
          
          <div className="text-center text-xs text-muted-foreground pt-4 pb-2">
            <p>
              Your $ave+ account is FDIC insured up to $250,000 through our banking partners.
              Funds are held securely and are accessible anytime.
            </p>
          </div>
        </div>

        {/* Unified FAB, Command Palette, and Keyboard Hints */}
        <UnifiedFAB />
        <CommandPalette />
        <KeyboardHints />
        <ChatSidebar isOpen={isChatOpen} onToggle={toggleChat} />
      </PullToRefresh>
      
      {/* Interactive Wizard */}
      {showWizard && (
        <InteractiveWizard
          steps={wizardSteps}
          onComplete={() => {
            setShowWizard(false);
            toast.success("Welcome to $ave+! You're all set to start saving.");
          }}
          onSkip={() => {
            setShowWizard(false);
            toast.info("You can restart the tour anytime from Settings.");
          }}
        />
      )}
      
      {/* Dashboard Tutorial Overlay (post-onboarding) */}
      <DashboardTutorialOverlay
        show={showTutorial}
        onComplete={() => {
          setShowTutorial(false);
          toast.success("Tutorial completed! You're all set to start saving.");
        }}
        onSkip={() => {
          setShowTutorial(false);
          toast.info("You can always access help from the menu.");
        }}
      />
    </AppLayout>
  );
}
