import { useEffect, useRef } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from './use-theme';

export function useSettingsSync() {
  const store = useSettingsStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const debounceTimer = useRef<NodeJS.Timeout>();
  const previousSettings = useRef(store);

  // Sync to database with debounce
  const syncToDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_preferences')
        .update({
          theme: store.theme,
          accent_color: store.accentColor,
          natural_language_rules: store.notificationRules as any,
          spending_persona: store.spendingPersona as any,
          security_score: store.securityScore,
          security_settings: store.securitySettings as any,
          last_security_check: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to sync settings:', error);
      toast({
        title: 'Sync failed',
        description: 'Could not save your settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Listen to theme changes and apply to DOM immediately
  useEffect(() => {
    if (store.theme !== previousSettings.current.theme) {
      setTheme(store.theme);
      
      // Update document for real-time preview
      const root = document.documentElement;
      if (store.theme === 'dark') {
        root.classList.add('dark');
      } else if (store.theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }
  }, [store.theme, setTheme]);

  // Listen to accent color changes
  useEffect(() => {
    if (store.accentColor !== previousSettings.current.accentColor) {
      const root = document.documentElement;
      root.style.setProperty('--orbital-accent', store.accentColor);
    }
  }, [store.accentColor]);

  // Debounced database sync on any settings change
  useEffect(() => {
    // Check if any settings have changed
    const hasChanges = 
      store.theme !== previousSettings.current.theme ||
      store.accentColor !== previousSettings.current.accentColor ||
      store.fontSize !== previousSettings.current.fontSize ||
      JSON.stringify(store.notificationRules) !== JSON.stringify(previousSettings.current.notificationRules) ||
      store.securityScore !== previousSettings.current.securityScore;

    if (hasChanges) {
      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer for debounced save
      debounceTimer.current = setTimeout(() => {
        syncToDatabase();
      }, 500);

      // Update previous settings
      previousSettings.current = { ...store };
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [store]);

  // Invalidate React Query cache when certain settings change
  useEffect(() => {
    // Invalidate transactions/budgets when currency changes
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
  }, [store.theme, queryClient]);

  // Cross-tab synchronization via localStorage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'settings-storage' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          
          // Update Zustand store from other tab
          if (newSettings.state) {
            store.setTheme(newSettings.state.theme);
            store.setAccentColor(newSettings.state.accentColor);
            store.setFontSize(newSettings.state.fontSize);
            store.updateNotificationRules(newSettings.state.notificationRules);
          }
        } catch (error) {
          console.error('Failed to parse storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [store]);

  // Show toast when security score improves
  useEffect(() => {
    if (store.securityScore > previousSettings.current.securityScore) {
      toast({
        title: 'Security improved! 🎉',
        description: `Your security score increased to ${store.securityScore}%`,
      });
    }
  }, [store.securityScore, toast]);
}
