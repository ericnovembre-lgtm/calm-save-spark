import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AICoachResponse {
  advice: string;
  utilization: number;
  totalSpent: number;
  totalBudget: number;
}

export function useBudgetAICoach() {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const getAdvice = async (
    budgets: any[],
    spending: Record<string, any>,
    type: 'general' | 'overspending' | 'savings' | 'optimization' = 'general'
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('budget-ai-coach', {
        body: { budgets, spending, type }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Rate limit reached. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits depleted. Please add credits to continue.');
        } else {
          toast.error('Failed to get AI advice');
        }
        throw error;
      }

      const response = data as AICoachResponse;
      setAdvice(response.advice);
      return response;
    } catch (error) {
      console.error('Error getting AI advice:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    advice,
    getAdvice,
    clearAdvice: () => setAdvice(null)
  };
}
