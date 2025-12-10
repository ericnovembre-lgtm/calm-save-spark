import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Couple {
  id: string;
  partner_a_id: string;
  partner_b_id: string | null;
  invite_code: string;
  invite_email: string | null;
  status: 'pending' | 'active' | 'disconnected';
  linked_at: string | null;
  visibility_settings: {
    balances: 'full' | 'hidden';
    transactions: 'full' | 'shared_only' | 'hidden';
    debts: 'full' | 'hidden';
    goals: 'full' | 'hidden';
  };
  created_at: string;
  updated_at: string;
}

export interface SharedGoal {
  id: string;
  couple_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  partner_a_contribution: number;
  partner_b_contribution: number;
  target_date: string | null;
  icon: string;
  color: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SharedBudget {
  id: string;
  couple_id: string;
  category: string;
  budget_limit: number;
  current_spent: number;
  period: 'weekly' | 'monthly';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCouple() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: couple, isLoading, error } = useQuery({
    queryKey: ['couple', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .or(`partner_a_id.eq.${user.id},partner_b_id.eq.${user.id}`)
        .maybeSingle();

      if (error) throw error;
      return data as Couple | null;
    },
    enabled: !!user,
  });

  const createCouple = useMutation({
    mutationFn: async (inviteEmail?: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('couples')
        .insert([{
          partner_a_id: user.id,
          invite_email: inviteEmail,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Couple;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] });
      toast.success('Partner invite created!');
    },
    onError: (error) => {
      console.error('Error creating couple:', error);
      toast.error('Failed to create invite');
    },
  });

  const joinCouple = useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error('Not authenticated');

      // Find the couple with this invite code
      const { data: existingCouple, error: findError } = await supabase
        .from('couples')
        .select('*')
        .eq('invite_code', inviteCode)
        .eq('status', 'pending')
        .maybeSingle();

      if (findError) throw findError;
      if (!existingCouple) throw new Error('Invalid or expired invite code');
      if (existingCouple.partner_a_id === user.id) throw new Error('Cannot join your own invite');

      const { data, error } = await supabase
        .from('couples')
        .update({
          partner_b_id: user.id,
          status: 'active',
          linked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCouple.id)
        .select()
        .single();

      if (error) throw error;
      return data as Couple;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] });
      toast.success('Successfully joined partner!');
    },
    onError: (error) => {
      console.error('Error joining couple:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to join');
    },
  });

  const updateVisibility = useMutation({
    mutationFn: async (settings: Partial<Couple['visibility_settings']>) => {
      if (!couple) throw new Error('No couple found');

      const { data, error } = await supabase
        .from('couples')
        .update({
          visibility_settings: { ...couple.visibility_settings, ...settings },
          updated_at: new Date().toISOString(),
        })
        .eq('id', couple.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] });
      toast.success('Settings updated');
    },
    onError: (error) => {
      console.error('Error updating visibility:', error);
      toast.error('Failed to update settings');
    },
  });

  const disconnect = useMutation({
    mutationFn: async () => {
      if (!couple) throw new Error('No couple found');

      const { error } = await supabase
        .from('couples')
        .update({
          status: 'disconnected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', couple.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] });
      toast.success('Disconnected from partner');
    },
    onError: (error) => {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect');
    },
  });

  const isPartnerA = couple?.partner_a_id === user?.id;
  const partnerId = isPartnerA ? couple?.partner_b_id : couple?.partner_a_id;

  return {
    couple,
    isLinked: couple?.status === 'active',
    isPending: couple?.status === 'pending',
    isPartnerA,
    partnerId,
    inviteCode: couple?.invite_code,
    isLoading,
    error,
    createCouple: createCouple.mutate,
    isCreating: createCouple.isPending,
    joinCouple: joinCouple.mutate,
    isJoining: joinCouple.isPending,
    updateVisibility: updateVisibility.mutate,
    isUpdatingVisibility: updateVisibility.isPending,
    disconnect: disconnect.mutate,
    isDisconnecting: disconnect.isPending,
  };
}

export function useSharedGoals() {
  const { user } = useAuth();
  const { couple } = useCouple();
  const queryClient = useQueryClient();

  const { data: goals, isLoading, error } = useQuery({
    queryKey: ['shared_goals', couple?.id],
    queryFn: async () => {
      if (!couple) return [];

      const { data, error } = await supabase
        .from('couple_shared_goals')
        .select('*')
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SharedGoal[];
    },
    enabled: !!couple,
  });

  const createGoal = useMutation({
    mutationFn: async (input: { goal_name: string; target_amount: number; target_date?: string; icon?: string; color?: string }) => {
      if (!couple) throw new Error('No couple found');

      const { data, error } = await supabase
        .from('couple_shared_goals')
        .insert([{ ...input, couple_id: couple.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_goals'] });
      toast.success('Shared goal created!');
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    },
  });

  const contribute = useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: string; amount: number }) => {
      if (!couple || !user) throw new Error('Not authenticated');

      const goal = goals?.find(g => g.id === goalId);
      if (!goal) throw new Error('Goal not found');

      const isPartnerA = couple.partner_a_id === user.id;
      const updateField = isPartnerA ? 'partner_a_contribution' : 'partner_b_contribution';
      const currentContribution = isPartnerA ? goal.partner_a_contribution : goal.partner_b_contribution;

      const { data, error } = await supabase
        .from('couple_shared_goals')
        .update({
          [updateField]: currentContribution + amount,
          current_amount: goal.current_amount + amount,
          is_completed: (goal.current_amount + amount) >= goal.target_amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_goals'] });
      toast.success('Contribution added!');
    },
    onError: (error) => {
      console.error('Error contributing:', error);
      toast.error('Failed to contribute');
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('couple_shared_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_goals'] });
      toast.success('Goal deleted');
    },
    onError: (error) => {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    },
  });

  return {
    goals: goals || [],
    isLoading,
    error,
    createGoal: createGoal.mutate,
    isCreating: createGoal.isPending,
    contribute: contribute.mutate,
    isContributing: contribute.isPending,
    deleteGoal: deleteGoal.mutate,
    isDeleting: deleteGoal.isPending,
  };
}

export function useSharedBudgets() {
  const { couple } = useCouple();
  const queryClient = useQueryClient();

  const { data: budgets, isLoading, error } = useQuery({
    queryKey: ['shared_budgets', couple?.id],
    queryFn: async () => {
      if (!couple) return [];

      const { data, error } = await supabase
        .from('couple_shared_budgets')
        .select('*')
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SharedBudget[];
    },
    enabled: !!couple,
  });

  const createBudget = useMutation({
    mutationFn: async (input: { category: string; budget_limit: number; period?: 'weekly' | 'monthly' }) => {
      if (!couple) throw new Error('No couple found');

      const { data, error } = await supabase
        .from('couple_shared_budgets')
        .insert([{ ...input, couple_id: couple.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_budgets'] });
      toast.success('Shared budget created!');
    },
    onError: (error) => {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    },
  });

  const updateSpending = useMutation({
    mutationFn: async ({ budgetId, amount }: { budgetId: string; amount: number }) => {
      const budget = budgets?.find(b => b.id === budgetId);
      if (!budget) throw new Error('Budget not found');

      const { data, error } = await supabase
        .from('couple_shared_budgets')
        .update({
          current_spent: budget.current_spent + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', budgetId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_budgets'] });
    },
    onError: (error) => {
      console.error('Error updating spending:', error);
      toast.error('Failed to update spending');
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (budgetId: string) => {
      const { error } = await supabase
        .from('couple_shared_budgets')
        .delete()
        .eq('id', budgetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared_budgets'] });
      toast.success('Budget deleted');
    },
    onError: (error) => {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    },
  });

  return {
    budgets: budgets || [],
    isLoading,
    error,
    createBudget: createBudget.mutate,
    isCreating: createBudget.isPending,
    updateSpending: updateSpending.mutate,
    isUpdating: updateSpending.isPending,
    deleteBudget: deleteBudget.mutate,
    isDeleting: deleteBudget.isPending,
  };
}
