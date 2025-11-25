import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CoachMode = 'approval-power' | 'forensic-scan' | 'limit-lift' | 'inquiry-detective' | 'dispute-wizard' | 'azeo-strategist' | 'goodwill-ghostwriter' | 'closure-simulator';

interface CoachRequest {
  mode: CoachMode;
  data: {
    score?: number;
    goalType?: string;
    utilization?: number;
    accountAge?: number;
    currentLimit?: number;
    paymentHistory?: string;
    inquiryCode?: string;
    disputeType?: string;
    accountName?: string;
    cardLimits?: number[];
    creditorName?: string;
    circumstanceType?: string;
    lateDays?: string;
    additionalContext?: string;
    cardAge?: number;
    cardLimit?: number;
    totalCreditLimit?: number;
    avgAccountAge?: number;
    numAccounts?: number;
  };
}

interface CoachResponse {
  result: string;
  metadata?: Record<string, any>;
}

export const useCreditCoach = () => {
  return useMutation({
    mutationFn: async (request: CoachRequest): Promise<CoachResponse> => {
      const { data, error } = await supabase.functions.invoke('credit-coach', {
        body: request,
      });

      if (error) throw error;
      return data;
    },
  });
};
