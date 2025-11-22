import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChartContext {
  type: string;
  timeframe: string;
  data: any[];
  metrics?: Record<string, number>;
}

export function useChartExplanation() {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateExplanation = async (context: ChartContext) => {
    setIsLoading(true);
    setExplanation(null);

    try {
      const { data, error } = await supabase.functions.invoke('explain-chart', {
        body: { context }
      });

      if (error) throw error;

      setExplanation(data.explanation);
    } catch (error) {
      console.error('Failed to generate explanation:', error);
      toast.error('Failed to generate chart explanation');
    } finally {
      setIsLoading(false);
    }
  };

  const clearExplanation = () => {
    setExplanation(null);
  };

  return {
    explanation,
    isLoading,
    generateExplanation,
    clearExplanation,
  };
}
