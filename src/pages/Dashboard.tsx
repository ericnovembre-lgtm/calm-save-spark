import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { BalanceCard } from "@/components/BalanceCard";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AccountCard } from "@/components/accounts/AccountCard";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { LoadingState } from "@/components/LoadingState";

export default function Dashboard() {
  const { data: accounts, isLoading: accountsLoading, refetch: refetchAccounts } = useQuery({
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

  const handleSyncAccount = async (accountId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-accounts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Sync failed');
      
      toast.success('Account synced successfully');
      refetchAccounts();
    } catch (error) {
      toast.error('Failed to sync account');
    }
  };

  const handleConnectAccount = () => {
    toast.info('Bank connection coming soon! This will integrate with Plaid.');
  };

  if (accountsLoading) return <LoadingState />;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Your financial overview</p>
        </div>

        <BalanceCard balance={totalBalance} monthlyGrowth={Math.abs(monthlyChange)} />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">Connected Accounts</h2>
            <Button onClick={handleConnectAccount}>
              <Plus className="w-4 h-4 mr-2" />
              Connect Account
            </Button>
          </div>

          {accounts?.length === 0 ? (
            <div className="bg-card rounded-lg p-12 text-center shadow-[var(--shadow-card)]">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No accounts connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect your bank accounts to track expenses automatically
              </p>
              <Button onClick={handleConnectAccount}>
                <Plus className="w-4 h-4 mr-2" />
                Connect Your First Account
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts?.map((account) => (
                <AccountCard
                  key={account.id}
                  id={account.id}
                  institutionName={account.institution_name}
                  accountType={account.account_type}
                  accountMask={account.account_mask}
                  balance={parseFloat(String(account.balance))}
                  currency={account.currency}
                  lastSynced={account.last_synced}
                  onSync={handleSyncAccount}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Recent Transactions</h2>
          <TransactionList />
        </div>
      </div>
    </AppLayout>
  );
}
