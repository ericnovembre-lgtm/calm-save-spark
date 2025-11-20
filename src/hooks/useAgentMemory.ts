import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Memory {
  id: string;
  user_id: string;
  agent_type: string;
  memory_type: 'preference' | 'fact' | 'goal' | 'style';
  key: string;
  value: any;
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

interface UseAgentMemoryOptions {
  agentType: string;
  memoryType?: Memory['memory_type'];
}

export function useAgentMemory({ agentType, memoryType }: UseAgentMemoryOptions) {
  const queryClient = useQueryClient();

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['agent-memory', agentType, memoryType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('agent_memory')
        .select('*')
        .eq('user_id', user.id)
        .eq('agent_type', agentType);

      if (memoryType) {
        query = query.eq('memory_type', memoryType);
      }

      const { data, error } = await query
        .order('confidence_score', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Memory[];
    },
  });

  const storeMemory = useMutation({
    mutationFn: async ({
      key,
      value,
      memoryType,
      confidence = 1.0
    }: {
      key: string;
      value: any;
      memoryType: Memory['memory_type'];
      confidence?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('agent_memory')
        .upsert({
          user_id: user.id,
          agent_type: agentType,
          memory_type: memoryType,
          key,
          value,
          confidence_score: confidence,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,agent_type,key'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-memory', agentType] });
      toast.success('Preference saved');
    },
    onError: (error) => {
      console.error('Error storing memory:', error);
      toast.error('Failed to save preference');
    },
  });

  const deleteMemory = useMutation({
    mutationFn: async (memoryId: string) => {
      const { error } = await supabase
        .from('agent_memory')
        .delete()
        .eq('id', memoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-memory', agentType] });
      toast.success('Memory deleted');
    },
    onError: (error) => {
      console.error('Error deleting memory:', error);
      toast.error('Failed to delete memory');
    },
  });

  return {
    memories,
    isLoading,
    storeMemory: storeMemory.mutate,
    deleteMemory: deleteMemory.mutate,
    isStoring: storeMemory.isPending,
  };
}
