import { useQuery } from "@tanstack/react-query";
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

export default function Dashboard() {
  const { newAchievements, dismissAchievements } = useAchievementNotifications();
  
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const userId = session?.user?.id;
  
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

  if (accountsLoading) return <LoadingState />;

  return (
    <AppLayout>
      <AchievementNotification 
        achievements={newAchievements}
        onDismiss={dismissAchievements}
      />
      
      <div className="space-y-6">
        <EmailVerificationBanner />
        <StreakRecoveryBanner />

        <div className="bg-card rounded-lg p-8 shadow-[var(--shadow-card)]">
          <DynamicWelcome />
        </div>
        
        <BalanceCard balance={totalBalance} monthlyGrowth={Math.abs(monthlyChange)} />
        
        <ConnectAccountCard />
        
        <AutoSaveBanner />
        
        <OnboardingProgress />
        
        <JourneyMilestones />

        {userId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProactiveRecommendations userId={userId} />
            <SkillTreeProgress userId={userId} />
          </div>
        )}

        {userId && <CashFlowForecast userId={userId} />}

        {userId && <PeerInsights userId={userId} />}

        {userId && <GoalTimeline userId={userId} />}
        
        <GoalsSection />
        
        <div className="bg-card rounded-lg p-8 shadow-[var(--shadow-card)]">
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
        </div>

        <ScheduledTransfersList />
        
        <ManualTransferCard />

        <TransferHistory />
        
        <div className="text-center text-xs text-muted-foreground pt-4 pb-2">
          <p>
            Your $ave+ account is FDIC insured up to $250,000 through our banking partners.
            Funds are held securely and are accessible anytime.
          </p>
        </div>
      </div>

      {/* Quick Actions FAB */}
      <QuickActionsFAB />
    </AppLayout>
  );
}
