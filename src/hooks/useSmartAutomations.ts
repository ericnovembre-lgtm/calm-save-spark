import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AutomationSuggestion {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  automationConfig: any;
}

export function useSmartAutomations() {
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['smart-automations'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('suggest-automations');
      if (error) throw error;
      return data.suggestions as AutomationSuggestion[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const acceptSuggestion = useMutation({
    mutationFn: async (suggestion: AutomationSuggestion) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('automation_rules')
        .insert({
          user_id: user.id,
          rule_name: suggestion.title,
          rule_type: suggestion.automationConfig.rule_type,
          trigger_condition: suggestion.automationConfig.trigger_condition,
          action_config: suggestion.automationConfig.action_config,
          frequency: suggestion.automationConfig.frequency,
          is_active: true,
          metadata: { suggestion_id: suggestion.id }
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Automation created successfully!');
      queryClient.invalidateQueries({ queryKey: ['smart-automations'] });
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to create automation: ${error.message}`);
    }
  });

  const dismissSuggestion = useMutation({
    mutationFn: async (suggestionId: string) => {
      // Store dismissed suggestions in localStorage
      const dismissed = JSON.parse(localStorage.getItem('dismissed-automations') || '[]');
      dismissed.push(suggestionId);
      localStorage.setItem('dismissed-automations', JSON.stringify(dismissed));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-automations'] });
    }
  });

  // Filter out dismissed suggestions
  const filteredSuggestions = suggestions?.filter(s => {
    const dismissed = JSON.parse(localStorage.getItem('dismissed-automations') || '[]');
    return !dismissed.includes(s.id);
  });

  return {
    suggestions: filteredSuggestions,
    isLoading,
    acceptSuggestion,
    dismissSuggestion
  };
}