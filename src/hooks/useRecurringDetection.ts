import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Background hook to monitor recurring detection queue
 * Polls for pending detections and triggers processing
 */
export function useRecurringDetection(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to queue changes
    const channel = supabase
      .channel('recurring-detection-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'recurring_detection_queue',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.processed_at) {
            // Detection completed, invalidate transactions
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}