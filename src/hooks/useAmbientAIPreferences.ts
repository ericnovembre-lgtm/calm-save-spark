/**
 * @fileoverview Ambient AI Preferences Hook
 * Persists and loads user preferences for the Ambient AI Agent
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AmbientAIPreferences {
  isMuted: boolean;
  voiceEnabled: boolean;
  deliveryFrequency: 'aggressive' | 'normal' | 'minimal' | 'quiet';
  quietHoursStart: string; // HH:MM format
  quietHoursEnd: string;
  quietHoursEnabled: boolean;
}

const DEFAULT_PREFERENCES: AmbientAIPreferences = {
  isMuted: false,
  voiceEnabled: true,
  deliveryFrequency: 'normal',
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  quietHoursEnabled: false,
};

export function useAmbientAIPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AmbientAIPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from database
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('ambient_ai_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPreferences({
            isMuted: data.is_muted ?? false,
            voiceEnabled: data.voice_enabled ?? true,
            deliveryFrequency: (data.delivery_frequency as AmbientAIPreferences['deliveryFrequency']) ?? 'normal',
            quietHoursStart: data.quiet_hours_start ?? '22:00',
            quietHoursEnd: data.quiet_hours_end ?? '08:00',
            quietHoursEnabled: data.quiet_hours_enabled ?? false,
          });
        }
      } catch (err) {
        console.error('Failed to load ambient AI preferences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

  // Save preferences to database
  const updatePreferences = useCallback(async (updates: Partial<AmbientAIPreferences>) => {
    if (!user?.id) return;

    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    try {
      const { error } = await supabase
        .from('ambient_ai_preferences')
        .upsert({
          user_id: user.id,
          is_muted: newPreferences.isMuted,
          voice_enabled: newPreferences.voiceEnabled,
          delivery_frequency: newPreferences.deliveryFrequency,
          quiet_hours_start: newPreferences.quietHoursStart,
          quiet_hours_end: newPreferences.quietHoursEnd,
          quiet_hours_enabled: newPreferences.quietHoursEnabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to save ambient AI preferences:', err);
    }
  }, [user?.id, preferences]);

  // Check if currently in quiet hours
  const isInQuietHours = useCallback((): boolean => {
    if (!preferences.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
      return currentTime >= startMinutes || currentTime < endMinutes;
    }

    return currentTime >= startMinutes && currentTime < endMinutes;
  }, [preferences.quietHoursEnabled, preferences.quietHoursStart, preferences.quietHoursEnd]);

  // Track feedback for learning
  const trackFeedback = useCallback(async (insightType: string, action: 'dismissed' | 'acted' | 'muted') => {
    if (!user?.id) return;

    try {
      await supabase
        .from('ambient_ai_feedback')
        .insert({
          user_id: user.id,
          insight_type: insightType,
          action,
        });
    } catch (err) {
      console.error('Failed to track ambient AI feedback:', err);
    }
  }, [user?.id]);

  // Get delivery interval based on frequency setting
  const getDeliveryIntervalMs = useCallback((): number => {
    switch (preferences.deliveryFrequency) {
      case 'aggressive': return 30000;  // 30 seconds
      case 'normal': return 60000;      // 1 minute
      case 'minimal': return 180000;    // 3 minutes
      case 'quiet': return 300000;      // 5 minutes
      default: return 60000;
    }
  }, [preferences.deliveryFrequency]);

  return {
    preferences,
    isLoading,
    updatePreferences,
    isInQuietHours,
    trackFeedback,
    getDeliveryIntervalMs,
  };
}
