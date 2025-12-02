import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSettingsStore } from '@/stores/settingsStore';
import { useEffect } from 'react';
import { logLockdownActivated, logLockdownDeactivated } from '@/lib/security-logger';

export interface LockdownStatus {
  id: string;
  user_id: string;
  is_active: boolean;
  activated_at: string | null;
  deactivated_at: string | null;
  reason: string | null;
}

export function useLockdownStatus() {
  const { setLockdownActive, isLockdownActive } = useSettingsStore();
  
  const query = useQuery({
    queryKey: ['lockdown-status'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('user_lockdown_status')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as LockdownStatus | null;
    },
    staleTime: 10_000, // 10 seconds
  });

  // Sync database state to store
  useEffect(() => {
    if (query.data) {
      setLockdownActive(query.data.is_active);
    }
  }, [query.data, setLockdownActive]);

  return query;
}

export function useActivateLockdown() {
  const queryClient = useQueryClient();
  const { setLockdownActive, setLockdownActivatedAt } = useSettingsStore();
  
  return useMutation({
    mutationFn: async (reason?: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('user_lockdown_status')
        .upsert({
          user_id: session.user.id,
          is_active: true,
          activated_at: now,
          deactivated_at: null,
          reason: reason || 'Manual emergency lockdown',
          updated_at: now,
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setLockdownActive(true);
      setLockdownActivatedAt(data.activated_at);
      queryClient.invalidateQueries({ queryKey: ['lockdown-status'] });
      
      // Log security event
      logLockdownActivated(data.reason);
      
      // Broadcast to other tabs
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('lockdown-sync');
        channel.postMessage({ type: 'LOCKDOWN_ACTIVATED', timestamp: data.activated_at });
        channel.close();
      }
    },
  });
}

export function useDeactivateLockdown() {
  const queryClient = useQueryClient();
  const { setLockdownActive, setLockdownActivatedAt } = useSettingsStore();
  
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('user_lockdown_status')
        .update({
          is_active: false,
          deactivated_at: now,
          updated_at: now,
        })
        .eq('user_id', session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      setLockdownActive(false);
      setLockdownActivatedAt(null);
      queryClient.invalidateQueries({ queryKey: ['lockdown-status'] });
      
      // Log security event
      logLockdownDeactivated();
      
      // Broadcast to other tabs
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('lockdown-sync');
        channel.postMessage({ type: 'LOCKDOWN_DEACTIVATED' });
        channel.close();
      }
    },
  });
}
