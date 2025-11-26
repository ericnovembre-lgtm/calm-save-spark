import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNetWorthData } from "./useNetWorthData";
import { useFinancialHealthMetrics } from "./useFinancialHealthMetrics";
import { format } from "date-fns";

export function useMonthlyReportData(month: Date) {
  const { data: netWorthData } = useNetWorthData();
  const { data: healthMetrics } = useFinancialHealthMetrics();

  return useQuery({
    queryKey: ['monthly-report-data', format(month, 'yyyy-MM')],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch accounts
      const { data: accounts } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id);

      // Fetch debts
      const { data: debts } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id);

      // Fetch pots
      const { data: pots } = await supabase
        .from('pots')
        .select('*')
        .eq('user_id', user.id);

      // Fetch goals (pots are used as savings goals)
      const goals = pots || [];

      return {
        reportMonth: format(month, 'MMMM yyyy'),
        generatedDate: format(new Date(), 'PPP'),
        netWorth: netWorthData,
        healthMetrics,
        accounts: accounts || [],
        debts: debts || [],
        pots: pots || [],
        goals: goals || [],
      };
    },
    enabled: !!netWorthData && !!healthMetrics,
    staleTime: 1000 * 60 * 5,
  });
}
