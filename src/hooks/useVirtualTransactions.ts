import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transactionKeys } from "@/lib/query-keys";

interface TransactionFilters {
  category?: string;
  merchant?: string;
  amountMin?: number;
  amountMax?: number;
  dateRange?: { start: string; end: string };
  searchQuery?: string;
}

const TRANSACTIONS_PER_PAGE = 100;

export function useVirtualTransactions(filters: TransactionFilters = {}) {
  return useInfiniteQuery({
    queryKey: transactionKeys.infinite(filters),
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('transactions')
        .select('*, connected_accounts(institution_name)', { count: 'exact' })
        .order('transaction_date', { ascending: false })
        .range(pageParam, pageParam + TRANSACTIONS_PER_PAGE - 1);

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.merchant) {
        query = query.ilike('merchant', `%${filters.merchant}%`);
      }
      if (filters.amountMin !== undefined) {
        query = query.gte('amount', filters.amountMin);
      }
      if (filters.amountMax !== undefined) {
        query = query.lte('amount', filters.amountMax);
      }
      if (filters.dateRange) {
        query = query.gte('transaction_date', filters.dateRange.start)
          .lte('transaction_date', filters.dateRange.end);
      }
      if (filters.searchQuery) {
        query = query.or(
          `merchant.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        transactions: data || [],
        nextCursor: data && data.length === TRANSACTIONS_PER_PAGE ? pageParam + TRANSACTIONS_PER_PAGE : undefined,
        totalCount: count || 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes for current data
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
