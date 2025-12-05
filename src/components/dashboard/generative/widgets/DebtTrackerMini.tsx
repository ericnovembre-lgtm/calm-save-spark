import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CreditCard, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DebtTrackerMiniProps {
  userId?: string;
}

const DebtTrackerMini = ({ userId }: DebtTrackerMiniProps) => {
  const { data: debts } = useQuery({
    queryKey: ['debts-summary', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('debts')
        .select('id, debt_name, current_balance, minimum_payment')
        .eq('user_id', userId)
        .eq('is_active', true);
      return data || [];
    },
    enabled: !!userId
  });

  const totalDebt = debts?.reduce((sum, d) => sum + Number(d.current_balance || 0), 0) || 0;
  // Estimate progress based on minimum payments made (rough approximation)
  const monthlyPayments = debts?.reduce((sum, d) => sum + Number(d.minimum_payment || 0), 0) || 0;
  const estimatedPaid = monthlyPayments * 3; // Estimate 3 months of payments
  const progress = totalDebt > 0 ? Math.min(100, (estimatedPaid / (totalDebt + estimatedPaid)) * 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Debt Payoff
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold text-rose-500">
            ${totalDebt.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">remaining balance</p>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Payoff Progress</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {monthlyPayments > 0 && (
          <div className="flex items-center gap-1 text-xs text-emerald-500">
            <TrendingDown className="h-3 w-3" />
            ${monthlyPayments.toLocaleString()}/mo payments
          </div>
        )}

        {debts && debts.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {debts.length} active {debts.length === 1 ? 'debt' : 'debts'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtTrackerMini;
