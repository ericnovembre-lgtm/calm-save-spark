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
import { useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { newAchievements, dismissAchievements } = useAchievementNotifications();
  const queryClient = useQueryClient();
  const [isReordering, setIsReordering] = useState(false);
  
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const userId = session?.user?.id;
  const { cardOrder, updateOrder } = useDashboardOrder(userId);
  
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
    'balance': <BalanceCard key="balance" balance={totalBalance} monthlyGrowth={Math.abs(monthlyChange)} />,
    'connect-account': <ConnectAccountCard key="connect-account" />,
    'auto-save': <AutoSaveBanner key="auto-save" />,
    'onboarding': <OnboardingProgress key="onboarding" />,
    'milestones': <JourneyMilestones key="milestones" />,
    'recommendations': userId ? <ProactiveRecommendations key="recommendations" userId={userId} /> : null,
    'skill-tree': userId ? <SkillTreeProgress key="skill-tree" userId={userId} /> : null,
    'cashflow': userId ? <CashFlowForecast key="cashflow" userId={userId} /> : null,
    'peer-insights': userId ? <PeerInsights key="peer-insights" userId={userId} /> : null,
    'timeline': userId ? <GoalTimeline key="timeline" userId={userId} /> : null,
    'goals': <GoalsSection key="goals" />,
    'scheduled': (
      <div key="scheduled" className="bg-card rounded-lg p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-display font-semibold text-foreground mb-2">
              Transfer Options
            </h3>
            <p className="text-muted-foreground">
              Move money to your savings goals
            </p>
          </div>
          <ScheduledTransferDialog />
        </div>
        <ScheduledTransfersList />
      </div>
    ),
    'manual-transfer': <ManualTransferCard key="manual-transfer" />,
    'history': <TransferHistory key="history" />,
  };

  if (accountsLoading) return <LoadingState />;

  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <AchievementNotification 
          achievements={newAchievements}
          onDismiss={dismissAchievements}
        />
        
        <div className="space-y-6 pb-20">
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
        <QuickActionsFAB />
      </PullToRefresh>
    </AppLayout>
  );
}
