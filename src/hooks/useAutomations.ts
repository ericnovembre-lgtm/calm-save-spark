import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';

interface AutomationFormData {
  id?: string;
  rule_name: string;
  frequency: string;
  start_date: string;
  action_config: {
    amount: number;
  };
  notes?: string | null;
}

interface ParsedAutomationRule {
  rule_name: string;
  rule_type: 'transaction_match' | 'scheduled_transfer' | 'balance_threshold' | 'round_up';
  trigger_condition: any;
  action_config: any;
  notes?: string;
}

export function useAutomations() {
  const queryClient = useQueryClient();

  // Fetch automations
  const { data: automations, isLoading } = useQuery({
    queryKey: ['automations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (automation: Omit<AutomationFormData, 'id'> | ParsedAutomationRule) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if this is a parsed rule or legacy scheduled transfer
      const isParsedRule = 'trigger_condition' in automation;

      if (isParsedRule) {
        // New parsed rule format
        const { data, error } = await supabase
          .from('automation_rules')
          .insert({
            user_id: user.id,
            rule_name: automation.rule_name,
            rule_type: automation.rule_type,
            trigger_condition: automation.trigger_condition,
            action_config: automation.action_config,
            notes: automation.notes,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Legacy scheduled transfer format
        const { data, error } = await supabase
          .from('automation_rules')
          .insert({
            user_id: user.id,
            rule_name: automation.rule_name,
            rule_type: 'scheduled_transfer',
            frequency: automation.frequency,
            start_date: automation.start_date,
            next_run_date: automation.start_date,
            action_config: { amount: automation.action_config.amount } as any,
            notes: automation.notes,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Automation created successfully!');
      const actionConfig = data.action_config as { amount?: number } | null;
      trackEvent('automation_created', {
        frequency: data.frequency,
        amount: actionConfig?.amount,
      });
    },
    onError: (error) => {
      toast.error('Failed to create automation', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (automation: AutomationFormData) => {
      if (!automation.id) throw new Error('Automation ID is required');

      const { error } = await supabase
        .from('automation_rules')
        .update({
          rule_name: automation.rule_name,
          frequency: automation.frequency,
          start_date: automation.start_date,
          action_config: { amount: automation.action_config.amount },
          notes: automation.notes,
        })
        .eq('id', automation.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Automation updated successfully!');
      trackEvent('automation_updated', {});
    },
    onError: (error) => {
      toast.error('Failed to update automation', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Automation deleted successfully!');
      trackEvent('automation_deleted', {});
    },
    onError: (error) => {
      toast.error('Failed to delete automation', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      return { id, newStatus: !isActive };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success(data.newStatus ? 'Automation resumed' : 'Automation paused');
      trackEvent('automation_toggled', {
        new_status: data.newStatus ? 'active' : 'paused',
      });
    },
    onError: (error) => {
      toast.error('Failed to toggle automation', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Computed values
  const scheduledAutomations = automations?.filter(a => a.frequency || a.rule_type === 'scheduled_transfer') || [];
  const transactionMatchAutomations = automations?.filter(a => a.rule_type === 'transaction_match') || [];
  const balanceThresholdAutomations = automations?.filter(a => a.rule_type === 'balance_threshold') || [];
  const roundUpAutomations = automations?.filter(a => a.rule_type === 'round_up') || [];
  const activeCount = automations?.filter(a => a.is_active).length || 0;
  
  const totalMonthlyAmount = scheduledAutomations
    .filter(a => a.is_active && a.frequency === 'monthly')
    .reduce((sum, a) => sum + ((a.action_config as any)?.amount || 0), 0);

  const totalWeeklyAmount = scheduledAutomations
    .filter(a => a.is_active && a.frequency === 'weekly')
    .reduce((sum, a) => sum + ((a.action_config as any)?.amount || 0), 0) * 4; // Approximate monthly

  const totalBiWeeklyAmount = scheduledAutomations
    .filter(a => a.is_active && a.frequency === 'bi-weekly')
    .reduce((sum, a) => sum + ((a.action_config as any)?.amount || 0), 0) * 2; // Approximate monthly

  const estimatedMonthlyTotal = totalMonthlyAmount + totalWeeklyAmount + totalBiWeeklyAmount;

  return {
    automations: automations || [],
    scheduledAutomations,
    transactionMatchAutomations,
    balanceThresholdAutomations,
    roundUpAutomations,
    activeCount,
    totalMonthlyAmount,
    estimatedMonthlyTotal,
    isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    toggle: toggleMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending,
  };
}
