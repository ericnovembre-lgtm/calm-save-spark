import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type AlertType = 'sentiment_shift' | 'state_change' | 'volume_spike' | 'confidence_drop';

export interface SentimentAlert {
  id: string;
  user_id: string;
  ticker: string;
  alert_type: AlertType;
  threshold_value: number | null;
  from_state: string | null;
  to_state: string | null;
  is_active: boolean;
  created_at: string;
  last_triggered_at: string | null;
}

export interface CreateAlertInput {
  ticker: string;
  alert_type: AlertType;
  threshold_value?: number;
  from_state?: string;
  to_state?: string;
}

export interface SentimentMetadata {
  ticker: string;
  alert_id: string;
  previous: {
    score: number;
    label: string;
    confidence: number;
    volume: string;
  } | null;
  current: {
    score: number;
    label: string;
    confidence: number;
    volume: string;
  };
}

export interface TriggeredAlert {
  id: string;
  user_id: string;
  alert_type: string;
  title: string;
  message: string;
  severity: string;
  data: unknown;
  created_at: string;
  read_at: string | null;
}

export const useSentimentAlerts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [realtimeAlerts, setRealtimeAlerts] = useState<TriggeredAlert[]>([]);

  // Fetch user's configured alerts
  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: ['sentiment-alerts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('sentiment_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as SentimentAlert[];
    },
    enabled: !!user?.id,
  });

  // Fetch triggered sentiment alerts (from smart_alerts)
  const { data: triggeredAlerts = [] } = useQuery({
    queryKey: ['triggered-sentiment-alerts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('smart_alerts')
        .select('*')
        .eq('user_id', user.id)
        .like('alert_type', 'sentiment_%')
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      // Map data field to metadata for component compatibility
      return (data || []).map(item => ({
        ...item,
        severity: item.severity || 'medium',
      })) as TriggeredAlert[];
    },
    enabled: !!user?.id,
  });

  // Real-time subscription for new alerts
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('sentiment-alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'smart_alerts',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newAlert = payload.new as TriggeredAlert;
          if (newAlert.alert_type?.startsWith('sentiment_')) {
            setRealtimeAlerts(prev => [newAlert, ...prev]);
            queryClient.invalidateQueries({ queryKey: ['triggered-sentiment-alerts'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (input: CreateAlertInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sentiment_alerts')
        .insert({
          user_id: user.id,
          ticker: input.ticker.toUpperCase(),
          alert_type: input.alert_type,
          threshold_value: input.threshold_value,
          from_state: input.from_state,
          to_state: input.to_state,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentiment-alerts'] });
      toast.success('Sentiment alert created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create alert: ${error.message}`);
    },
  });

  // Update alert mutation
  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SentimentAlert> & { id: string }) => {
      const { data, error } = await supabase
        .from('sentiment_alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentiment-alerts'] });
    },
  });

  // Delete alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sentiment_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentiment-alerts'] });
      toast.success('Alert deleted');
    },
  });

  // Dismiss triggered alert
  const dismissAlert = useCallback(async (alertId: string) => {
    await supabase
      .from('smart_alerts')
      .update({ read_at: new Date().toISOString() })
      .eq('id', alertId);

    setRealtimeAlerts(prev => prev.filter(a => a.id !== alertId));
    queryClient.invalidateQueries({ queryKey: ['triggered-sentiment-alerts'] });
  }, [queryClient]);

  // Clear realtime alert from local state
  const clearRealtimeAlert = useCallback((alertId: string) => {
    setRealtimeAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  return {
    alerts,
    triggeredAlerts: [...realtimeAlerts, ...triggeredAlerts.filter(
      t => !realtimeAlerts.some(r => r.id === t.id)
    )],
    isLoading,
    error,
    createAlert: createAlertMutation.mutateAsync,
    updateAlert: updateAlertMutation.mutateAsync,
    deleteAlert: deleteAlertMutation.mutateAsync,
    toggleAlert: (id: string, isActive: boolean) => 
      updateAlertMutation.mutateAsync({ id, is_active: isActive }),
    dismissAlert,
    clearRealtimeAlert,
    isCreating: createAlertMutation.isPending,
  };
};
