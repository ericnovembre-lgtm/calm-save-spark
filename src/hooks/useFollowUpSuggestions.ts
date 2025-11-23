import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFollowUpSuggestions(query: string, filters: any, resultCount: number) {
  const { data, isLoading } = useQuery({
    queryKey: ['follow-up-suggestions', query, filters, resultCount],
    queryFn: async () => {
      if (!query) return [];

      const { data, error } = await supabase.functions.invoke('generate-follow-ups', {
        body: { 
          query, 
          filters,
          resultCount 
        }
      });

      if (error) {
        console.error('Error generating follow-ups:', error);
        return [];
      }

      return data?.suggestions || [];
    },
    enabled: !!query && query.length > 0,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    suggestions: (data || []) as string[],
    isLoading,
  };
}
