import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserFeatures {
  max_goals: number;
  max_pots: number;
  max_automation_rules: number;
  apy_rate: number;
  has_advanced_automation: boolean;
  has_ai_insights: boolean;
  has_saveplus_card: boolean;
  has_priority_support: boolean;
  has_analytics: boolean;
  has_export: boolean;
  cashback_rate: number;
  ai_chat_limit: number;
  has_physical_card: boolean;
  has_phone_support: boolean;
  has_api_access: boolean;
}

const DEFAULT_FREE_FEATURES: UserFeatures = {
  max_goals: 3,
  max_pots: 5,
  max_automation_rules: 0,
  apy_rate: 3.5,
  has_advanced_automation: false,
  has_ai_insights: false,
  has_saveplus_card: false,
  has_priority_support: false,
  has_analytics: false,
  has_export: false,
  cashback_rate: 0,
  ai_chat_limit: 0,
  has_physical_card: false,
  has_phone_support: false,
  has_api_access: false,
};

export function useFeatureAccess() {
  const [features, setFeatures] = useState<UserFeatures>(DEFAULT_FREE_FEATURES);
  const [loading, setLoading] = useState(true);
  const [subscriptionAmount, setSubscriptionAmount] = useState(0);

  useEffect(() => {
    const fetchFeatures = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFeatures(DEFAULT_FREE_FEATURES);
        setSubscriptionAmount(0);
        setLoading(false);
        return;
      }

      // Fetch subscription amount
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('subscription_amount')
        .eq('user_id', user.id)
        .single();

      if (subData) {
        setSubscriptionAmount(subData.subscription_amount);
      }

      // Fetch computed features
      const { data, error } = await supabase
        .from('feature_access')
        .select('features')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setFeatures(data.features as unknown as UserFeatures);
      } else {
        setFeatures(DEFAULT_FREE_FEATURES);
      }
      setLoading(false);
    };

    fetchFeatures();

    // Subscribe to feature access changes
    const channel = supabase
      .channel('feature_access_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'feature_access'
      }, () => {
        fetchFeatures();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { features, loading, subscriptionAmount };
}
