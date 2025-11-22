import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AutomationAnalytics {
  successRate: number;
  totalSavings: number;
  topRules: Array<{
    automation_rule_id: string;
    rule_name: string;
    execution_count: number;
  }>;
  dailyTrend: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
  averageTransfer: number;
  totalExecutions: number;
  failureRate: number;
}

export function useAutomationAnalytics() {
  return useQuery<AutomationAnalytics>({
    queryKey: ['automation-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-automation-analytics');
      
      if (error) throw error;
      return data as AutomationAnalytics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
