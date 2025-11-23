import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Insight {
  id: string;
  type: 'trend' | 'alert' | 'upcoming' | 'tip';
  icon?: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  actionLabel?: string;
  actionLink?: string;
}

export function useGenerativeInsights(userId: string) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['generative-insights', userId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { userId }
      });

      if (error) {
        console.error('Error generating insights:', error);
        return [];
      }

      return data?.insights || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!userId,
  });

  return {
    insights: (data || []) as Insight[],
    isLoading,
    refetch,
  };
}
