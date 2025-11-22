/**
 * Optimized Transactions Hook
 * Phase 6: Performance Optimizations
 * 
 * Features:
 * - Request coalescing for duplicate queries
 * - Optimized caching with staleTime
 * - Batch fetching for better performance
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { coalescer, createCacheKey } from '@/lib/request-coalescer';
import { queryKeys } from '@/lib/query-config';

interface TransactionFilters {
  category?: string;
  merchant?: string;
  amountMin?: number;
  amountMax?: number;
  dateRange?: { start: string; end: string };
  searchQuery?: string;
}

const ITEMS_PER_PAGE = 50; // Reduced from 100 for faster initial load

export function useOptimizedTransactions(filters: TransactionFilters = {}) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.transactions(filters), 'optimized'],
    queryFn: async ({ pageParam = 0 }) => {
      const start = pageParam * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      // Create cache key for request coalescing
      const cacheKey = createCacheKey(
        'GET',
        'transactions',
        { start, end },
        filters
      );

      // Use request coalescer to deduplicate concurrent requests
      const result = await coalescer.fetch(cacheKey, async () => {
        let query = supabase
          .from('transactions')
          .select('*, connected_accounts(institution_name)', { count: 'exact' })
          .order('transaction_date', { ascending: false })
          .range(start, end);

        // Apply filters efficiently
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
          query = query
            .gte('transaction_date', filters.dateRange.start)
            .lte('transaction_date', filters.dateRange.end);
        }
        if (filters.searchQuery) {
          query = query.or(
            `merchant.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
          );
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return { transactions: data || [], total: count || 0 };
      });

      return result;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.length * ITEMS_PER_PAGE;
      return loadedCount < lastPage.total ? allPages.length : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - aggressive caching
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
