import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFeatureAccess } from './useFeatureAccess';

interface LimitStatus {
  current: number;
  max: number;
  reached: boolean;
  remaining: number;
}

interface FeatureLimits {
  goals: LimitStatus;
  pots: LimitStatus;
  automationRules: LimitStatus;
  loading: boolean;
}

export function useFeatureLimits() {
  const { features, loading: featuresLoading } = useFeatureAccess();
  const [limits, setLimits] = useState<FeatureLimits>({
    goals: { current: 0, max: 3, reached: false, remaining: 3 },
    pots: { current: 0, max: 5, reached: false, remaining: 5 },
    automationRules: { current: 0, max: 0, reached: true, remaining: 0 },
    loading: true,
  });

  useEffect(() => {
    if (featuresLoading || !features) return;
    
    fetchCurrentUsage();
  }, [features, featuresLoading]);

  const fetchCurrentUsage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !features) {
      setLimits(prev => ({ ...prev, loading: false }));
      return;
    }

    // Fetch current goals count
    const { count: goalsCount } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Fetch current automation settings count
    const { count: automationCount } = await supabase
      .from('automation_settings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // For now, pots is a placeholder (add pots table later)
    const potsCount = 0;

    const goalsLimit: LimitStatus = {
      current: goalsCount || 0,
      max: features.max_goals,
      reached: (goalsCount || 0) >= features.max_goals,
      remaining: Math.max(0, features.max_goals - (goalsCount || 0)),
    };

    const potsLimit: LimitStatus = {
      current: potsCount,
      max: features.max_pots,
      reached: potsCount >= features.max_pots,
      remaining: Math.max(0, features.max_pots - potsCount),
    };

    const automationLimit: LimitStatus = {
      current: automationCount || 0,
      max: features.max_automation_rules,
      reached: (automationCount || 0) >= features.max_automation_rules,
      remaining: Math.max(0, features.max_automation_rules - (automationCount || 0)),
    };

    setLimits({
      goals: goalsLimit,
      pots: potsLimit,
      automationRules: automationLimit,
      loading: false,
    });
  };

  const canCreate = (type: 'goals' | 'pots' | 'automationRules'): boolean => {
    return !limits[type].reached;
  };

  const getUpgradeMessage = (type: 'goals' | 'pots' | 'automationRules'): string => {
    const limit = limits[type];
    const featureName = type === 'goals' ? 'savings goals' : type === 'pots' ? 'smart pots' : 'automation rules';
    
    if (limit.max === 999) return '';
    
    if (type === 'goals') {
      if (limit.max < 5) return `Upgrade to $1/month for 5 ${featureName}`;
      if (limit.max < 10) return `Upgrade to $5/month for 10 ${featureName}`;
      return `Upgrade to $9/month for unlimited ${featureName}`;
    }
    
    if (type === 'pots') {
      if (limit.max < 10) return `Upgrade to $2/month for 10 ${featureName}`;
      if (limit.max < 15) return `Upgrade to $6/month for 15 ${featureName}`;
      return `Upgrade to $10/month for unlimited ${featureName}`;
    }
    
    if (type === 'automationRules') {
      if (limit.max === 0) return `Upgrade to $3/month for 2 ${featureName}`;
      if (limit.max < 5) return `Upgrade to $7/month for 5 ${featureName}`;
      return '';
    }
    
    return `Upgrade your plan to unlock more ${featureName}`;
  };

  return {
    ...limits,
    canCreate,
    getUpgradeMessage,
    refresh: fetchCurrentUsage,
  };
}
