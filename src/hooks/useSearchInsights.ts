import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SearchInsightsParams {
  query: string;
  transactions: any[];
  filters: any;
}

interface SearchInsight {
  insight: string;
  totalAmount: number;
  transactionCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export function useSearchInsights(params: SearchInsightsParams | null) {
  return useQuery({
    queryKey: ['search-insights', params?.query, params?.transactions?.length],
    queryFn: async () => {
      if (!params || !params.query || !params.transactions.length) {
        return null;
      }

      const { data, error } = await supabase.functions.invoke('generate-search-insight', {
        body: {
          query: params.query,
          transactions: params.transactions,
          filters: params.filters,
        }
      });

      if (error) throw error;
      return data as SearchInsight;
    },
    enabled: !!params && !!params.query && params.transactions.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
