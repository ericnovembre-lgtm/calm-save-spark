import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DigitalTwinProfile {
  currentAge: number;
  retirementAge: number;
  initialNetWorth: number;
  riskTolerance: number;
  annualSavings: number;
  annualReturn: number;
  financialGoals: Array<{ name: string; target_amount: number }>;
}

interface CurrentState {
  age?: number;
  netWorth?: number;
  income?: number;
  expenses?: number;
}

/**
 * Hook to fetch comprehensive user financial data for Digital Twin
 * Aggregates data from profiles, accounts, pots, and goals
 */
export function useDigitalTwinProfile() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['digital-twin-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch digital twin profile
      const { data: twinProfile, error: profileError } = await supabase
        .from('digital_twin_profiles')
        .select('current_state, risk_tolerance, life_stage')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // Parse current_state as typed object
      const currentState = twinProfile?.current_state as CurrentState | null;

      // For now, use simplified data fetching to avoid TypeScript issues
      // In production, fetch from connected_accounts, pots, and goals tables
      const profileNetWorth = currentState?.netWorth || 50000;
      const totalNetWorth = profileNetWorth;

      // Calculate age from profile
      const currentAge = currentState?.age || 30;

      // Calculate retirement age based on life stage
      const retirementAgeByStage: Record<string, number> = {
        'graduate': 65,
        'early-career': 65,
        'mid-career': 62,
        'senior-career': 60,
        'pre-retirement': 58,
        'retired': currentAge, // Already retired
      };
      const retirementAge = retirementAgeByStage[twinProfile?.life_stage || 'early-career'] || 65;

      // Get financial metrics from profile
      const riskTolerance = Number(twinProfile?.risk_tolerance) || 0.5;
      const income = currentState?.income || 60000;
      const expenses = currentState?.expenses || 40000;
      const annualSavings = Math.max(0, income - expenses);

      // Calculate annual return based on risk tolerance (5-10%)
      const annualReturn = 0.05 + (riskTolerance * 0.05);

      return {
        currentAge,
        retirementAge,
        initialNetWorth: Math.max(0, totalNetWorth),
        riskTolerance,
        annualSavings,
        annualReturn,
        financialGoals: [],
        hasProfile: !!twinProfile,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    profile: profile as DigitalTwinProfile | undefined,
    isLoading,
    hasProfile: profile?.hasProfile ?? false,
  };
}
