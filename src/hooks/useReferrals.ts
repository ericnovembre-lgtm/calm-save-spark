import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Referral {
  id: string;
  referrer_user_id: string;
  referred_email: string | null;
  referred_user_id: string | null;
  referral_code: string;
  status: string;
  reward_amount: number | null;
  reward_points: number | null;
  signed_up_at: string | null;
  rewarded_at: string | null;
  created_at: string;
}

export function useReferrals() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const { data: referrals, isLoading } = useQuery({
    queryKey: ['referrals', userId],
    queryFn: async (): Promise<Referral[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Referral[];
    },
    enabled: !!userId,
  });

  const { data: referralCode } = useQuery({
    queryKey: ['my-referral-code', userId],
    queryFn: async () => {
      if (!userId) return null;
      // Generate a code based on user ID
      const code = `SAVE${userId.substring(0, 8).toUpperCase()}`;
      return code;
    },
    enabled: !!userId,
  });

  const createReferral = useMutation({
    mutationFn: async (email: string) => {
      if (!userId) throw new Error('Not authenticated');

      const code = referralCode || `SAVE${userId.substring(0, 8).toUpperCase()}`;

      const { data, error } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: userId,
          referred_email: email,
          referral_code: code,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      toast.success('Referral invitation sent!');
    },
    onError: () => {
      toast.error('Failed to create referral');
    },
  });

  return {
    referrals: referrals || [],
    referralCode,
    isLoading,
    createReferral,
  };
}

export function useReferralRewards() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: stats } = useQuery({
    queryKey: ['referral-stats', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data: referrals } = await supabase
        .from('referrals')
        .select('status, reward_amount, rewarded_at')
        .eq('referrer_user_id', userId);

      const allReferrals = referrals || [];
      const pending = allReferrals.filter(r => r.status === 'pending').length;
      const completed = allReferrals.filter(r => r.status === 'completed').length;
      const totalEarned = allReferrals
        .filter(r => r.rewarded_at)
        .reduce((sum, r) => sum + (r.reward_amount || 0), 0);
      const pendingRewards = allReferrals
        .filter(r => r.status === 'completed' && !r.rewarded_at)
        .reduce((sum, r) => sum + (r.reward_amount || 0), 0);

      return {
        totalReferrals: allReferrals.length,
        pending,
        completed,
        totalEarned,
        pendingRewards,
      };
    },
    enabled: !!userId,
  });

  return {
    rewards: [],
    stats,
    isLoading: false,
    claimReward: { mutate: () => {}, isPending: false },
  };
}