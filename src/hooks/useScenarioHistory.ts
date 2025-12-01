import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SavedScenario {
  id: string;
  user_id: string;
  twin_id: string;
  scenario_name: string | null;
  scenario_type: string;
  parameters: any;
  projected_outcomes: any;
  success_probability: number | null;
  monte_carlo_runs: number | null;
  created_at: string | null;
}

export interface SaveScenarioInput {
  name: string;
  type: string;
  parameters: any;
  outcomes: any;
  successProbability: number;
  monteCarloRuns: number;
}

export function useScenarioHistory() {
  const queryClient = useQueryClient();

  // Fetch all saved scenarios
  const { data: scenarios, isLoading } = useQuery({
    queryKey: ['scenario-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('twin_scenarios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavedScenario[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Save current scenario
  const saveMutation = useMutation({
    mutationFn: async ({ name, type, parameters, outcomes, successProbability, monteCarloRuns }: SaveScenarioInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get or create digital twin profile
      let { data: profile } = await supabase
        .from('digital_twin_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        const { data: newProfile, error: profileError } = await supabase
          .from('digital_twin_profiles')
          .insert({
            user_id: user.id,
            current_state: { netWorth: 0 },
            life_stage: 'growth',
            risk_tolerance: 'moderate',
          })
          .select('id')
          .single();

        if (profileError) throw profileError;
        profile = newProfile;
      }

      const { data, error } = await supabase
        .from('twin_scenarios')
        .insert({
          user_id: user.id,
          twin_id: profile.id,
          scenario_name: name,
          scenario_type: type,
          parameters,
          projected_outcomes: outcomes,
          success_probability: successProbability,
          monte_carlo_runs: monteCarloRuns,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Scenario saved successfully');
      queryClient.invalidateQueries({ queryKey: ['scenario-history'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to save scenario: ${error.message}`);
    },
  });

  // Rename scenario
  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('twin_scenarios')
        .update({ scenario_name: name })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Scenario renamed');
      queryClient.invalidateQueries({ queryKey: ['scenario-history'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to rename: ${error.message}`);
    },
  });

  // Delete scenario
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('twin_scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Scenario deleted');
      queryClient.invalidateQueries({ queryKey: ['scenario-history'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  return {
    scenarios: scenarios || [],
    isLoading,
    saveScenario: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    renameScenario: renameMutation.mutate,
    deleteScenario: deleteMutation.mutate,
  };
}
