import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BenefitMatch {
  id: string;
  transaction_id: string | null;
  match_confidence: number;
  status: 'pending' | 'activated' | 'expired' | 'dismissed';
  expires_at: string | null;
  activated_at: string | null;
  dismissed_at: string | null;
  created_at: string;
  benefit: {
    id: string;
    benefit_name: string;
    description: string;
    benefit_category: string;
    icon: string;
    activation_required: boolean;
    activation_url: string | null;
    fine_print: string | null;
    validity_days: number;
  };
  transaction: {
    merchant_name: string;
    amount_cents: number;
    transaction_date: string;
    merchant_category: string | null;
  } | null;
}

export function useBenefitHunter() {
  const queryClient = useQueryClient();

  // Fetch pending benefit matches
  const { data: matches = [], isLoading, refetch } = useQuery({
    queryKey: ['benefit-matches'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('benefit_matches')
        .select(`
          *,
          benefit:card_benefits(*),
          transaction:card_transactions(merchant_name, amount_cents, transaction_date, merchant_category)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching benefit matches:', error);
        throw error;
      }

      return (data || []) as BenefitMatch[];
    },
  });

  // Scan for new benefits (trigger edge function)
  const scanForBenefits = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('benefit-hunter');

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['benefit-matches'] });
      queryClient.invalidateQueries({ queryKey: ['proactive-nudges'] });
      
      if (data.newMatches > 0) {
        toast.success(`Found ${data.newMatches} new benefit${data.newMatches > 1 ? 's' : ''}!`);
      } else {
        toast.info('No new benefits found. Keep spending to unlock more perks!');
      }
    },
    onError: (error) => {
      console.error('Error scanning for benefits:', error);
      toast.error('Failed to scan for benefits. Please try again.');
    },
  });

  // Activate a benefit
  const activateBenefit = useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase
        .from('benefit_matches')
        .update({
          status: 'activated',
          activated_at: new Date().toISOString(),
        })
        .eq('id', matchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefit-matches'] });
      toast.success('Benefit activated successfully!');
    },
    onError: (error) => {
      console.error('Error activating benefit:', error);
      toast.error('Failed to activate benefit');
    },
  });

  // Dismiss a benefit
  const dismissBenefit = useMutation({
    mutationFn: async (matchId: string) => {
      const { error } = await supabase
        .from('benefit_matches')
        .update({
          status: 'dismissed',
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', matchId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefit-matches'] });
      toast.success('Benefit dismissed');
    },
    onError: (error) => {
      console.error('Error dismissing benefit:', error);
      toast.error('Failed to dismiss benefit');
    },
  });

  return {
    matches,
    isLoading,
    scanForBenefits: scanForBenefits.mutate,
    isScanning: scanForBenefits.isPending,
    activateBenefit: activateBenefit.mutate,
    dismissBenefit: dismissBenefit.mutate,
    refetch,
  };
}
