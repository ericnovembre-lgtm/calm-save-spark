import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAlgoliaSync } from './useAlgoliaSync';
import { toast } from 'sonner';

interface CreateGoalParams {
  name: string;
  target_amount: number;
  deadline?: string | null;
}

interface UpdateGoalParams {
  id: string;
  data: Partial<{
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string | null;
    icon: string;
  }>;
}

export function useGoalMutations() {
  const queryClient = useQueryClient();
  const { indexRecords, deleteRecords } = useAlgoliaSync();

  const createGoal = useMutation({
    mutationFn: async (goal: CreateGoalParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .insert([{
          user_id: user.id,
          name: goal.name,
          target_amount: goal.target_amount,
          deadline: goal.deadline || null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created successfully!');
      
      // Sync to Algolia
      if (data) {
        indexRecords.mutate({
          indexName: 'goals',
          records: [{
            objectID: data.id,
            name: data.name,
            target_amount: data.target_amount,
            current_amount: data.current_amount || 0,
            deadline: data.deadline,
            user_id: data.user_id,
            created_at: data.created_at,
          }]
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to create goal', { description: error.message });
    }
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, data }: UpdateGoalParams) => {
      const { data: updated, error } = await supabase
        .from('goals')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal updated successfully!');
      
      // Sync to Algolia
      if (data) {
        indexRecords.mutate({
          indexName: 'goals',
          records: [{
            objectID: data.id,
            name: data.name,
            target_amount: data.target_amount,
            current_amount: data.current_amount || 0,
            deadline: data.deadline,
            user_id: data.user_id,
            created_at: data.created_at,
          }]
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to update goal', { description: error.message });
    }
  });

  const deleteGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);
      if (error) throw error;
      return goalId;
    },
    onSuccess: (goalId) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted successfully');
      
      // Remove from Algolia
      deleteRecords.mutate({
        indexName: 'goals',
        objectIDs: [goalId]
      });
    },
    onError: (error) => {
      toast.error('Failed to delete goal', { description: error.message });
    }
  });

  return {
    createGoal,
    updateGoal,
    deleteGoal,
    isCreating: createGoal.isPending,
    isUpdating: updateGoal.isPending,
    isDeleting: deleteGoal.isPending,
  };
}
