import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WalletNotification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  action_url: string | null;
  metadata: any;
  created_at: string;
}

export function useWalletNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['wallet-notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('wallet_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as WalletNotification[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('wallet-notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_notifications',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['wallet-notifications'] });
          
          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            const notif = payload.new as WalletNotification;
            new Notification(notif.title, {
              body: notif.message,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('wallet_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('wallet_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-notifications'] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  };
}