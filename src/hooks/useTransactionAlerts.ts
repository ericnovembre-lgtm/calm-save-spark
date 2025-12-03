import { useEffect, useState, useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TransactionAlert {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  metadata: {
    transaction_id?: string;
    merchant?: string;
    amount?: number;
    category?: string;
    alert_type?: string;
    risk_level?: string;
    latency_ms?: number;
    model?: string;
  };
  created_at: string;
}

export function useTransactionAlerts() {
  const queryClient = useQueryClient();
  const [realtimeAlerts, setRealtimeAlerts] = useState<TransactionAlert[]>([]);

  // Fetch existing unread transaction alerts
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['transaction-alerts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('wallet_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('notification_type', 'transaction_alert')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[TransactionAlerts] Fetch error:', error);
        return [];
      }

      return data as TransactionAlert[];
    },
  });

  // Subscribe to real-time transaction alerts
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('transaction-alerts-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'wallet_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newAlert = payload.new as TransactionAlert;
            
            // Only handle transaction alerts
            if (newAlert.notification_type !== 'transaction_alert') return;

            console.log('[TransactionAlerts] New alert received:', newAlert);

            // Add to realtime alerts
            setRealtimeAlerts(prev => [newAlert, ...prev]);

            // Invalidate query to refresh list
            queryClient.invalidateQueries({ queryKey: ['transaction-alerts'] });

            // Show toast notification
            const metadata = newAlert.metadata || {};
            const riskLevel = metadata.risk_level || 'medium';
            const latencyMs = metadata.latency_ms || 0;
            const description = `${newAlert.message} | Groq LPU • ${latencyMs}ms`;

            if (riskLevel === 'high') {
              toast.error(newAlert.title, { description, duration: 10000 });
            } else if (riskLevel === 'medium') {
              toast.warning(newAlert.title, { description, duration: 8000 });
            } else {
              toast.info(newAlert.title, { description, duration: 5000 });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [queryClient]);

  // Mark alert as read
  const markAsRead = useCallback(async (alertId: string) => {
    const { error } = await supabase
      .from('wallet_notifications')
      .update({ read: true })
      .eq('id', alertId);

    if (error) {
      console.error('[TransactionAlerts] Mark read error:', error);
      return;
    }

    setRealtimeAlerts(prev => prev.filter(a => a.id !== alertId));
    queryClient.invalidateQueries({ queryKey: ['transaction-alerts'] });
  }, [queryClient]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('wallet_notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('notification_type', 'transaction_alert')
      .eq('read', false);

    if (error) {
      console.error('[TransactionAlerts] Mark all read error:', error);
      return;
    }

    setRealtimeAlerts([]);
    queryClient.invalidateQueries({ queryKey: ['transaction-alerts'] });
  }, [queryClient]);

  // Combine stored alerts with realtime alerts
  const allAlerts = [...realtimeAlerts, ...alerts.filter(
    a => !realtimeAlerts.some(ra => ra.id === a.id)
  )];

  const unreadCount = allAlerts.filter(a => !a.read).length;
  const highRiskAlerts = allAlerts.filter(
    a => !a.read && a.metadata?.risk_level === 'high'
  );

  return {
    alerts: allAlerts,
    unreadCount,
    highRiskAlerts,
    isLoading,
    markAsRead,
    markAllAsRead,
  };
}
