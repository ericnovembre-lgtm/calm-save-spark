import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLatestCreditScore() {
  return useQuery({
    queryKey: ['latest_credit_score'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('credit_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('score_date', { ascending: false })
        .limit(2);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return null;
      }

      const latest = data[0];
      const previous = data[1];
      
      return {
        score: latest.score,
        change: previous ? latest.score - previous.score : 0,
        provider: latest.provider || 'Credit Bureau',
        date: latest.score_date,
        factors: latest.factors as any[] || [],
      };
    },
  });
}
