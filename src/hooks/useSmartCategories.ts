import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CategoryAnalytics {
  category: string;
  transactionCount: number;
  totalAmount: number;
  avgConfidence: number;
}

export function useSmartCategories() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: categoryAnalytics, isLoading, refetch } = useQuery({
    queryKey: ['smart-categories', userId],
    queryFn: async (): Promise<CategoryAnalytics[]> => {
      if (!userId) return [];

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('user_id', userId)
        .not('category', 'is', null);

      if (error) throw error;

      // Aggregate by category
      const categoryMap = new Map<string, { count: number; total: number }>();
      
      (transactions || []).forEach((tx) => {
        const cat = tx.category || 'Uncategorized';
        const existing = categoryMap.get(cat) || { count: 0, total: 0 };
        categoryMap.set(cat, {
          count: existing.count + 1,
          total: existing.total + Math.abs(tx.amount || 0),
        });
      });

      return Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        transactionCount: data.count,
        totalAmount: data.total,
        avgConfidence: 0.85, // Placeholder - would come from ML system
      }));
    },
    enabled: !!userId,
  });

  return {
    categoryAnalytics: categoryAnalytics || [],
    isLoading,
    refetch,
  };
}
