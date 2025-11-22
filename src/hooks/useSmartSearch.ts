import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SearchFilters {
  searchQuery?: string;
  category?: string;
  merchant?: string;
  amountMin?: number;
  amountMax?: number;
  dateRange?: { start: string; end: string };
}

interface SearchHistoryItem {
  id: string;
  query: string;
  parsed_filters: SearchFilters;
  searched_at: string;
}

export function useSmartSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  // Fetch search history
  const { data: searchHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['search-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transaction_search_history')
        .select('*')
        .order('searched_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as SearchHistoryItem[];
    },
  });

  // Get smart suggestions based on transaction patterns
  const { data: suggestions = [] } = useQuery({
    queryKey: ['search-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('category, merchant')
        .order('transaction_date', { ascending: false })
        .limit(200);
      
      if (error) throw error;

      // Generate suggestions from frequent patterns
      const categoryCount = new Map<string, number>();
      const merchantCount = new Map<string, number>();

      data?.forEach(t => {
        if (t.category) categoryCount.set(t.category, (categoryCount.get(t.category) || 0) + 1);
        if (t.merchant) merchantCount.set(t.merchant, (merchantCount.get(t.merchant) || 0) + 1);
      });

      const topCategories = Array.from(categoryCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat]) => `All ${cat} expenses`);

      const topMerchants = Array.from(merchantCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([merch]) => `Spending at ${merch}`);

      return [
        'Last month\'s expenses',
        'Transactions over $100',
        ...topCategories,
        ...topMerchants,
        'This week\'s spending',
      ];
    },
  });

  // Parse natural language query
  const parseQuery = useMutation({
    mutationFn: async (query: string): Promise<SearchFilters> => {
      const { data, error } = await supabase.functions.invoke('parse-search-query', {
        body: { query },
      });

      if (error) throw error;
      return data.filters;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-history'] });
    },
    onError: (error: Error) => {
      console.error('Search parsing error:', error);
      toast.error('Failed to parse search query');
    },
  });

  // Clear search history
  const clearHistory = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('transaction_search_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-history'] });
      toast.success('Search history cleared');
    },
  });

  const executeSearch = async (query: string): Promise<SearchFilters | null> => {
    setIsSearching(true);
    try {
      const result = await parseQuery.mutateAsync(query);
      return result;
    } catch (error) {
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchHistory,
    suggestions,
    isSearching,
    isLoadingHistory,
    executeSearch,
    clearHistory: clearHistory.mutate,
  };
}
