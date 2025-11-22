import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SmartAction {
  id: string;
  label: string;
  icon: string;
  color: 'warning' | 'destructive' | 'success' | 'default';
  savings?: number;
  action: {
    type: 'transfer' | 'navigate' | 'external';
    params?: any;
    to?: string;
  };
}

export function useSmartActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['smart-actions'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-smart-actions');
      if (error) throw error;
      return data as { actions: SmartAction[]; metadata: any };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  const dismissAction = useMutation({
    mutationFn: async (actionId: string) => {
      // Store dismissed actions in localStorage for session
      const dismissed = JSON.parse(localStorage.getItem('dismissed-actions') || '[]');
      dismissed.push(actionId);
      localStorage.setItem('dismissed-actions', JSON.stringify(dismissed));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-actions'] });
      toast({
        title: 'Action dismissed',
        description: 'This suggestion has been removed',
      });
    }
  });

  const refreshActions = () => {
    queryClient.invalidateQueries({ queryKey: ['smart-actions'] });
  };

  return {
    actions: data?.actions || [],
    metadata: data?.metadata,
    isLoading,
    error,
    dismissAction: dismissAction.mutate,
    refreshActions
  };
}
