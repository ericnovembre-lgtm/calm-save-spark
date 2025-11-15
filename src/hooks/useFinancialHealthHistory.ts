import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFinancialHealthHistory = () => {
  return useQuery({
    queryKey: ['financial_health_history'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('financial_health_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('calculated_at', { ascending: true })
        .limit(180); // Last 6 months (assuming daily tracking)

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useFinancialHealthTrend = () => {
  return useQuery({
    queryKey: ['financial_health_trend'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .rpc('calculate_health_trend', { p_user_id: session.user.id });

      if (error) throw error;
      return data || 0;
    },
    staleTime: 1000 * 60 * 5,
  });
};
