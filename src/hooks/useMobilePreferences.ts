import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MobilePreferences {
  id: string;
  user_id: string;
  quick_glance_widgets: string[];
  default_camera_mode: string;
  haptic_enabled: boolean;
  haptic_intensity: 'light' | 'medium' | 'heavy';
  voice_enabled: boolean;
  biometric_required_for_transactions: boolean;
  home_widget_order: string[];
  created_at: string;
  updated_at: string;
}

const defaultPreferences: Omit<MobilePreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  quick_glance_widgets: ['balance', 'budget', 'goals'],
  default_camera_mode: 'auto',
  haptic_enabled: true,
  haptic_intensity: 'medium',
  voice_enabled: true,
  biometric_required_for_transactions: false,
  home_widget_order: []
};

export function useMobilePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<MobilePreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('mobile_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // No preferences exist, create default
      const { data: newData } = await supabase
        .from('mobile_preferences')
        .insert({ user_id: user.id, ...defaultPreferences })
        .select()
        .single();

      if (newData) {
        setPreferences(newData as MobilePreferences);
      }
    } else if (data) {
      setPreferences(data as MobilePreferences);
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<MobilePreferences>) => {
    if (!user || !preferences) return false;

    const { data, error } = await supabase
      .from('mobile_preferences')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }

    if (data) {
      setPreferences(data as MobilePreferences);
    }
    return true;
  }, [user, preferences]);

  // Toggle haptic feedback
  const toggleHaptic = useCallback(async () => {
    return updatePreferences({ haptic_enabled: !preferences?.haptic_enabled });
  }, [preferences, updatePreferences]);

  // Toggle voice
  const toggleVoice = useCallback(async () => {
    return updatePreferences({ voice_enabled: !preferences?.voice_enabled });
  }, [preferences, updatePreferences]);

  // Set haptic intensity
  const setHapticIntensity = useCallback(async (intensity: 'light' | 'medium' | 'heavy') => {
    return updatePreferences({ haptic_intensity: intensity });
  }, [updatePreferences]);

  // Update widget order
  const setWidgetOrder = useCallback(async (order: string[]) => {
    return updatePreferences({ home_widget_order: order });
  }, [updatePreferences]);

  // Update quick glance widgets
  const setQuickGlanceWidgets = useCallback(async (widgets: string[]) => {
    return updatePreferences({ quick_glance_widgets: widgets });
  }, [updatePreferences]);

  return {
    preferences,
    isLoading,
    updatePreferences,
    toggleHaptic,
    toggleVoice,
    setHapticIntensity,
    setWidgetOrder,
    setQuickGlanceWidgets,
    refetch: fetchPreferences
  };
}
