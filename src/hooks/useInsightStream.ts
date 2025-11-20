import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ProactiveInsight {
  id: string;
  user_id: string;
  insight_type: string;
  severity: 'info' | 'warning' | 'urgent';
  title: string;
  message: string;
  resolution_action?: string;
  resolution_data?: Record<string, any>;
  is_resolved: boolean;
  created_at: string;
  viewed_at?: string;
}

export function useInsightStream(userId: string | undefined) {
  const [newInsight, setNewInsight] = useState<ProactiveInsight | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('proactive_insights_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'proactive_insights',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New insight received:', payload.new);
          const insight = payload.new as ProactiveInsight;
          
          // Set new insight for animation
          setNewInsight(insight);
          
          // Show notification based on severity
          const toastFn = insight.severity === 'urgent' ? toast.error 
                         : insight.severity === 'warning' ? toast.warning 
                         : toast.info;
          
          toastFn(insight.title, {
            description: insight.message.slice(0, 100) + '...',
            duration: 5000,
          });

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['proactive_insights', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return { newInsight, clearNewInsight: () => setNewInsight(null) };
}
