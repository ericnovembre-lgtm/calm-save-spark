import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_ORDER = [
  'balance',
  'goals',
  'connect-account',
  'auto-save',
  'onboarding',
  'milestones',
  'recommendations',
  'skill-tree',
  'cashflow',
  'peer-insights',
  'timeline',
  'scheduled',
  'manual-transfer',
  'history',
];

/**
 * Hook for managing dashboard card order with persistent storage
 */
export function useDashboardOrder(userId?: string) {
  const [cardOrder, setCardOrder] = useState<string[]>(DEFAULT_ORDER);
  const queryClient = useQueryClient();

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ['user-preferences', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('dashboard_card_order')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Update local state when preferences load
  useEffect(() => {
    if (preferences?.dashboard_card_order) {
      setCardOrder(preferences.dashboard_card_order);
    }
  }, [preferences]);

  // Save preferences mutation
  const saveMutation = useMutation({
    mutationFn: async (newOrder: string[]) => {
      if (!userId) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('user_preferences')
          .update({ dashboard_card_order: newOrder })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            dashboard_card_order: newOrder,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', userId] });
    },
  });

  const updateOrder = (newOrder: string[]) => {
    setCardOrder(newOrder);
    if (userId) {
      saveMutation.mutate(newOrder);
    }
  };

  const resetOrder = () => {
    updateOrder(DEFAULT_ORDER);
  };

  return {
    cardOrder,
    updateOrder,
    resetOrder,
    isLoading: saveMutation.isPending,
  };
}
