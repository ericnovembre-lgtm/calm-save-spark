import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AssetBreakdown {
  name: string;
  value: number;
  type: string;
  color: string;
}

interface LiabilityBreakdown {
  name: string;
  value: number;
  type: string;
  color: string;
}

export function useNetWorthBreakdown() {
  return useQuery({
    queryKey: ['net-worth-breakdown'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch accounts grouped by type
      const { data: accounts } = await supabase
        .from('connected_accounts')
        .select('institution_name, account_type, current_balance')
        .eq('user_id', user.id);

      // Fetch pots (savings)
      const { data: pots } = await supabase
        .from('pots')
        .select('name, current_amount')
        .eq('user_id', user.id);

      // Fetch debts
      const { data: debts } = await supabase
        .from('debts')
        .select('debt_name, debt_type, current_balance')
        .eq('user_id', user.id);

      // Asset colors based on type
      const assetColors: Record<string, string> = {
        checking: 'hsl(var(--chart-1))',
        savings: 'hsl(var(--chart-2))',
        investment: 'hsl(var(--chart-3))',
        retirement: 'hsl(var(--chart-4))',
        pot: 'hsl(var(--chart-5))',
      };

      // Liability colors
      const liabilityColors: Record<string, string> = {
        credit_card: 'hsl(var(--destructive))',
        student_loan: 'hsl(var(--warning))',
        mortgage: 'hsl(var(--muted))',
        personal_loan: 'hsl(var(--secondary))',
        auto_loan: 'hsl(var(--accent))',
      };

      // Build assets array
      const assets: AssetBreakdown[] = [
        ...(accounts || []).map(acc => ({
          name: acc.institution_name || 'Account',
          value: acc.current_balance || 0,
          type: acc.account_type || 'checking',
          color: assetColors[acc.account_type || 'checking'] || assetColors.checking,
        })),
        ...(pots || []).map(pot => ({
          name: pot.name,
          value: pot.current_amount || 0,
          type: 'pot',
          color: assetColors.pot,
        })),
      ];

      // Build liabilities array
      const liabilities: LiabilityBreakdown[] = (debts || []).map(debt => ({
        name: debt.debt_name,
        value: debt.current_balance || 0,
        type: debt.debt_type || 'personal_loan',
        color: liabilityColors[debt.debt_type || 'personal_loan'] || liabilityColors.personal_loan,
      }));

      const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
      const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
      const netWorth = totalAssets - totalLiabilities;

      return {
        assets,
        liabilities,
        totalAssets,
        totalLiabilities,
        netWorth,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
