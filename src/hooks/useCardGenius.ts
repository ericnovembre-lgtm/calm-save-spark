import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type GeniusMode = 'purchase' | 'travel' | 'dispute' | 'benefits';

interface GeniusRequest {
  mode: GeniusMode;
  query: string;
  context?: {
    cardId?: string;
    amount?: number;
    merchant?: string;
    destination?: string;
  };
}

interface GeniusResponse {
  mode: GeniusMode;
  result: string;
  structured?: {
    points?: number;
    protections?: string[];
    tips?: string[];
    amount?: number;
    letter?: string;
    coverage?: string;
  };
}

/**
 * Hook for Card Genius AI assistant
 * Multi-modal intelligence for credit card management
 */
export const useCardGenius = () => {
  return useMutation({
    mutationFn: async (request: GeniusRequest): Promise<GeniusResponse> => {
      const { data, error } = await supabase.functions.invoke('card-genius', {
        body: request,
      });

      if (error) throw error;
      return data;
    },
  });
};
