import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AccountInsight {
  type: string;
  title: string;
  description: string;
  insight: string;
  recommendation: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  accountId?: string;
  data?: any;
}

export interface CrossAccountData {
  insights: AccountInsight[];
  summary: {
    totalAccounts: number;
    totalBalance: number;
    activeAccounts: number;
    insightCount: number;
  };
}

export function useCrossAccountInsights() {
  return useQuery<CrossAccountData>({
    queryKey: ['cross-account-insights'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('cross-account-analysis');
      if (error) throw error;
      return data as CrossAccountData;
    },
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}