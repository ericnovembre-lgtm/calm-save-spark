import { useState, useEffect, useCallback } from 'react';
import { haptics, HapticIntensity } from '@/lib/haptics';

interface HapticPreferences {
  enabled: boolean;
  intensity: HapticIntensity;
}

const STORAGE_KEY = 'haptic-preferences';

const DEFAULT_PREFERENCES: HapticPreferences = {
  enabled: true,
  intensity: 'medium',
};

export function useHapticSettings() {
  const [preferences, setPreferences] = useState<HapticPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.debug('Failed to load haptic preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  });

  // Sync with haptics singleton on mount and preference changes
  useEffect(() => {
    haptics.setEnabled(preferences.enabled);
    haptics.setIntensity(preferences.intensity);
  }, [preferences.enabled, preferences.intensity]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.debug('Failed to save haptic preferences:', error);
    }
  }, [preferences]);

  const updatePreference = useCallback(<K extends keyof HapticPreferences>(
    key: K,
    value: HapticPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isAvailable = haptics.isAvailable();

  return {
    preferences,
    updatePreference,
    isAvailable,
  };
}
