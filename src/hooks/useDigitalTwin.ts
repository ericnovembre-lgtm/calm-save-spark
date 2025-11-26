import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DigitalTwinState {
  id: string;
  user_id: string;
  twin_version: number;
  personality_profile: any;
  risk_tolerance: number;
  savings_propensity: number;
  impulse_factor: number;
  financial_goals_alignment: number;
  last_calibrated_at: string;
  calibration_accuracy: number;
}

export function useDigitalTwin() {
  const queryClient = useQueryClient();

  const { data: twinState, isLoading } = useQuery({
    queryKey: ['digital-twin-state'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('digital_twin_state')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as DigitalTwinState | null;
    },
    staleTime: 10 * 60 * 1000,
  });

  const syncTwin = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('digital-twin-sync');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Digital twin synchronized successfully');
      queryClient.invalidateQueries({ queryKey: ['digital-twin-state'] });
      return data;
    },
    onError: (error: any) => {
      toast.error(`Failed to sync digital twin: ${error.message}`);
    }
  });

  const needsSync = !twinState || 
    (new Date().getTime() - new Date(twinState.last_calibrated_at).getTime()) > 24 * 60 * 60 * 1000;

  return {
    twinState,
    isLoading,
    syncTwin,
    needsSync,
    metrics: twinState ? {
      riskTolerance: Math.round(twinState.risk_tolerance * 100),
      savingsPropensity: Math.round(twinState.savings_propensity * 100),
      impulseFactor: Math.round(twinState.impulse_factor * 100),
      goalsAlignment: Math.round(twinState.financial_goals_alignment * 100),
      calibrationAccuracy: Math.round(twinState.calibration_accuracy * 100)
    } : null
  };
}