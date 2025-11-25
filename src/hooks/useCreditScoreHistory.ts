import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DateRange = '30d' | '90d' | '6m' | '1y' | 'all';

export const useCreditScoreHistory = (dateRange: DateRange = '6m') => {
  return useQuery({
    queryKey: ['credit_score_history', dateRange],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Calculate the start date based on the range
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90d':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case '6m':
          startDate = new Date(now.setMonth(now.getMonth() - 6));
          break;
        case '1y':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        case 'all':
          startDate = new Date('2000-01-01'); // Effectively no limit
          break;
      }

      const { data, error } = await supabase
        .from('credit_scores')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('score_date', startDate.toISOString())
        .order('score_date', { ascending: true });

      if (error) throw error;
      
      // Transform data for chart
      return data.map(score => ({
        date: new Date(score.score_date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: dateRange === '1y' || dateRange === 'all' ? 'numeric' : undefined
        }),
        score: score.score,
        change: score.change_from_previous || 0,
        fullDate: score.score_date,
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useCreditScoreSync = () => {
  return async () => {
    const { data, error } = await supabase.functions.invoke('credit-score-sync');
    
    if (error) throw error;
    return data;
  };
};
