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
import JourneyMilestones from "@/components/dashboard/JourneyMilestones";
import { OnboardingProgress } from "@/components/dashboard/OnboardingProgress";
import { LoadingState } from "@/components/LoadingState";

export default function Dashboard() {
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
      <div className="space-y-6">
        <EmailVerificationBanner />
        
        <BalanceCard balance={totalBalance} monthlyGrowth={Math.abs(monthlyChange)} />
        
        <AutoSaveBanner />
        
        <OnboardingProgress />
        
        <JourneyMilestones />
        
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
    </AppLayout>
  );
}
