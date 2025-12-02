import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_message: string;
  metadata: Record<string, any>;
  severity: 'info' | 'success' | 'warning' | 'critical';
  created_at: string;
}

export function useSecurityAuditLog(limit = 20) {
  const queryClient = useQueryClient();
  const [realtimeEvents, setRealtimeEvents] = useState<SecurityEvent[]>([]);

  const query = useQuery({
    queryKey: ['security-audit-log', limit],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as SecurityEvent[];
    },
    staleTime: 30_000,
  });

  // Real-time subscription for new events
  useEffect(() => {
    const channel = supabase
      .channel('security-audit-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_audit_log',
        },
        (payload) => {
          const newEvent = payload.new as SecurityEvent;
          setRealtimeEvents(prev => [newEvent, ...prev].slice(0, 5));
          // Also invalidate the query to refresh full list
          queryClient.invalidateQueries({ queryKey: ['security-audit-log'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Combine realtime events with query data, deduplicate
  const allEvents = query.data || [];
  const combinedEvents = [...realtimeEvents, ...allEvents]
    .filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);

  return {
    ...query,
    data: combinedEvents,
    newEventIds: realtimeEvents.map(e => e.id),
  };
}

export function useLogSecurityEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: {
      event_type: string;
      event_message: string;
      metadata?: Record<string, any>;
      severity?: 'info' | 'success' | 'warning' | 'critical';
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('security_audit_log')
        .insert({
          user_id: session.user.id,
          event_type: event.event_type,
          event_message: event.event_message,
          metadata: event.metadata || {},
          severity: event.severity || 'info',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-audit-log'] });
    },
  });
}
