import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Nudge {
  id: string;
  agent_type: string;
  nudge_type: string;
  message: string;
  priority: number;
  action_url: string | null;
  trigger_data: any;
  sent_at: string | null;
  dismissed_at: string | null;
  acted_on_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export function useProactiveNudges() {
  const queryClient = useQueryClient();

  const { data: nudges = [], isLoading } = useQuery({
    queryKey: ['proactive-nudges'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('agent_nudges')
        .select('*')
        .eq('user_id', user.id)
        .is('dismissed_at', null)
        .is('acted_on_at', null)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching nudges:', error);
        return [];
      }

      // Mark as sent if not already
      const unseenIds = data?.filter(n => !n.sent_at).map(n => n.id) || [];
      if (unseenIds.length > 0) {
        await supabase
          .from('agent_nudges')
          .update({ sent_at: new Date().toISOString() })
          .in('id', unseenIds);
      }

      return data as Nudge[];
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const dismissNudge = useMutation({
    mutationFn: async (nudgeId: string) => {
      const { error } = await supabase
        .from('agent_nudges')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', nudgeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proactive-nudges'] });
    },
  });

  const actOnNudge = useMutation({
    mutationFn: async (nudgeId: string) => {
      const { error } = await supabase
        .from('agent_nudges')
        .update({ acted_on_at: new Date().toISOString() })
        .eq('id', nudgeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proactive-nudges'] });
      toast.success('Action completed!');
    },
  });

  return {
    nudges,
    isLoading,
    dismissNudge: dismissNudge.mutate,
    actOnNudge: actOnNudge.mutate,
  };
}
