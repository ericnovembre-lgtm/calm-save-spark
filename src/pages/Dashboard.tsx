import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { BalanceCard } from "@/components/BalanceCard";
import { AutoSaveBanner } from "@/components/dashboard/AutoSaveBanner";
import { EmailVerificationBanner } from "@/components/dashboard/EmailVerificationBanner";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { ManualTransferCard } from "@/components/dashboard/ManualTransferCard";
import { ScheduledTransferDialog } from "@/components/dashboard/ScheduledTransferDialog";
import { ScheduledTransfersList } from "@/components/dashboard/ScheduledTransfersList";
import { TransferHistory } from "@/components/dashboard/TransferHistory";
import { QuickActionsFAB } from "@/components/dashboard/QuickActionsFAB";
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
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useDashboardOrder } from "@/hooks/useDashboardOrder";
import { Reorder } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { SaveplusCoachWidget } from "@/components/coach/SaveplusCoachWidget";
import { ChatFAB } from "@/components/dashboard/ChatFAB";
import { ChatSidebar } from "@/components/dashboard/ChatSidebar";
import { useChatSidebar } from "@/hooks/useChatSidebar";
import { cn } from "@/lib/utils";
import { InteractiveWizard, hasCompletedWizard } from "@/components/onboarding/InteractiveWizard";
import { DASHBOARD_WIZARD_STEPS, type WizardStepWithIcon } from "@/lib/wizard-steps";
import type { WizardStep } from "@/components/onboarding/InteractiveWizard";
import { createElement } from "react";

export default function Dashboard() {
  const { newAchievements, dismissAchievements } = useAchievementNotifications();
  const queryClient = useQueryClient();
  const [isReordering, setIsReordering] = useState(false);
  const { isOpen: isChatOpen, toggle: toggleChat } = useChatSidebar();
  const [showWizard, setShowWizard] = useState(false);
  
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const userId = session?.user?.id;
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
      
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();
      
      // Show wizard after initial onboarding
      if (profile?.onboarding_completed) {
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
  
  // Calculate this month's change
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  
  const monthlyChange = transactions
    ?.filter(tx => new Date(tx.transaction_date) >= thisMonth)
    .reduce((sum, tx) => sum + parseFloat(String(tx.amount)), 0) || 0;

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
      <CollapsibleSection
        key="balance"
        id="balance"
        title="Account Balance"
        description="Your total savings across all accounts"
        defaultOpen={!collapsedSections['balance']}
        onToggle={(id, isOpen) => toggleCollapsed(id, !isOpen)}
      >
        <div data-wizard="balance-card">
          <BalanceCard balance={totalBalance} monthlyGrowth={Math.abs(monthlyChange)} />
        </div>
      </CollapsibleSection>
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
    'goals': (
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
      <div data-wizard="manual-transfer" key="manual-transfer">
        <ManualTransferCard />
      </div>
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
  };

  if (accountsLoading) return <LoadingState />;

  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <AchievementNotification 
          achievements={newAchievements}
          onDismiss={dismissAchievements}
        />
        
        <div className={cn(
          "space-y-6 pb-20 transition-all duration-300",
          isChatOpen && "lg:pr-[420px]"
        )}>
          <EmailVerificationBanner />
          <StreakRecoveryBanner />

          <div className="bg-card rounded-lg p-8 shadow-[var(--shadow-card)]">
            <DynamicWelcome />
          </div>

          {/* Reorderable Cards */}
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
          
          <div className="text-center text-xs text-muted-foreground pt-4 pb-2">
            <p>
              Your $ave+ account is FDIC insured up to $250,000 through our banking partners.
              Funds are held securely and are accessible anytime.
            </p>
          </div>
        </div>

        {/* Quick Actions FAB */}
        <div data-wizard="quick-actions">
          <QuickActionsFAB />
        </div>
        <ChatFAB />
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
    </AppLayout>
  );
}
