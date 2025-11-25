import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CardTransaction = Database['public']['Tables']['card_transactions']['Row'];

interface CategorySpending {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface MerchantSpending {
  merchant: string;
  amount: number;
  count: number;
  category: string;
}

interface SpendingInsights {
  categoryBreakdown: CategorySpending[];
  topMerchants: MerchantSpending[];
  totalSpent: number;
  transactionCount: number;
  avgTransactionAmount: number;
  periodComparison?: {
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export function useCardSpendingInsights(cardId?: string, dateRange: { start: Date; end: Date } = {
  start: new Date(new Date().setDate(1)), // Start of current month
  end: new Date()
}) {
  return useQuery({
    queryKey: ['card-spending-insights', cardId, dateRange],
    queryFn: async (): Promise<SpendingInsights> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('card_transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', dateRange.start.toISOString())
        .lte('transaction_date', dateRange.end.toISOString());

      if (cardId && cardId !== 'demo') {
        query = query.eq('card_id', cardId);
      }

      const { data: transactions, error } = await query;
      if (error) throw error;

      const txs = transactions as CardTransaction[];

      // Calculate category breakdown
      const categoryMap = new Map<string, { amount: number; count: number }>();
      const merchantMap = new Map<string, { amount: number; count: number; category: string }>();
      let totalSpent = 0;

      txs.forEach(tx => {
        const amount = Math.abs(tx.amount_cents) / 100;
        totalSpent += amount;

        const category = tx.ai_category || 'Other';
        const merchant = tx.ai_merchant_name || tx.merchant_name || 'Unknown';

        // Category aggregation
        const catData = categoryMap.get(category) || { amount: 0, count: 0 };
        categoryMap.set(category, {
          amount: catData.amount + amount,
          count: catData.count + 1,
        });

        // Merchant aggregation
        const merchData = merchantMap.get(merchant) || { amount: 0, count: 0, category };
        merchantMap.set(merchant, {
          amount: merchData.amount + amount,
          count: merchData.count + 1,
          category,
        });
      });

      const categoryBreakdown: CategorySpending[] = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count,
          percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      const topMerchants: MerchantSpending[] = Array.from(merchantMap.entries())
        .map(([merchant, data]) => ({
          merchant,
          amount: data.amount,
          count: data.count,
          category: data.category,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      return {
        categoryBreakdown,
        topMerchants,
        totalSpent,
        transactionCount: txs.length,
        avgTransactionAmount: txs.length > 0 ? totalSpent / txs.length : 0,
      };
    },
    enabled: !!cardId,
  });
}
