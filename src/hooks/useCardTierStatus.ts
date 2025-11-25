import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TierStatus = Database['public']['Tables']['card_tier_status']['Row'];

const TIER_BENEFITS = {
  basic: {
    name: 'Basic',
    pointsMultiplier: 1.0,
    color: 'from-gray-400 to-gray-600',
    benefits: ['1x Base Points', 'Standard APR', 'Basic Support']
  },
  growth: {
    name: 'Growth',
    pointsMultiplier: 1.25,
    color: 'from-emerald-400 to-emerald-600',
    benefits: ['1.25x Points', 'Reduced APR', 'Priority Support', 'Quarterly Bonuses']
  },
  prestige: {
    name: 'Prestige',
    pointsMultiplier: 1.5,
    color: 'from-violet-400 to-violet-600',
    benefits: ['1.5x Points', 'Lower APR', '24/7 Support', 'Travel Perks', 'Partner Discounts']
  },
  elite_legacy: {
    name: 'Elite Legacy',
    pointsMultiplier: 2.0,
    color: 'from-amber-400 to-amber-600',
    benefits: ['2x Points', 'Lowest APR', 'Dedicated Support', 'Premium Perks', 'VIP Access', 'Annual Bonuses']
  }
};

export function useCardTierStatus() {
  const { data: tierStatus, isLoading, error } = useQuery({
    queryKey: ['card-tier-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('card_tier_status')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no tier status exists, create one
      if (!data) {
        const { data: newTier, error: createError } = await supabase
          .from('card_tier_status')
          .insert({
            user_id: user.id,
            current_tier: 'basic',
            total_points: 0,
            lifetime_points: 0,
            points_to_next_tier: 1000,
          })
          .select()
          .single();

        if (createError) throw createError;
        return newTier as TierStatus;
      }

      return data as TierStatus;
    },
  });

  const currentTier = tierStatus?.current_tier || 'basic';
  const tierInfo = TIER_BENEFITS[currentTier];

  return {
    tierStatus,
    tierInfo,
    currentTier,
    isLoading,
    error,
  };
}
