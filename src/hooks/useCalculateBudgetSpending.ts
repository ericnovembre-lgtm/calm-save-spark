import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CalculateSpendingParams {
  budget_id: string;
  period_start: string;
  period_end: string;
}

interface SpendingAnalytics {
  total_spent: number;
  total_budget: number;
  remaining: number;
  percentage: number;
  transaction_count: number;
  category_breakdown: Record<string, number>;
  is_over_budget: boolean;
  is_near_limit: boolean;
}

/**
 * Hook to calculate budget spending using the edge function
 * This triggers real-time calculation based on transactions
 */
export function useCalculateBudgetSpending() {
  return useMutation({
    mutationFn: async (params: CalculateSpendingParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-budget-spending`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to calculate spending');
      }

      const result = await response.json();
      return result as {
        success: boolean;
        spending: any;
        analytics: SpendingAnalytics;
      };
    },
    onError: (error) => {
      console.error('Calculate spending error:', error);
      toast.error('Failed to calculate budget spending');
    }
  });
}
