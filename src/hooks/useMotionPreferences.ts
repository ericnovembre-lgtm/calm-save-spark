import { useState, useEffect } from 'react';

export interface MotionPreferences {
  animations: boolean;
  particles: boolean;
  gradients: boolean;
  haptics: boolean;
}

const DEFAULT_PREFERENCES: MotionPreferences = {
  animations: true,
  particles: true,
  gradients: true,
  haptics: true,
};

const STORAGE_KEY = 'motion-preferences';

/**
 * Hook to manage motion and animation preferences for accessibility
 */
export function useMotionPreferences() {
  const [preferences, setPreferences] = useState<MotionPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading motion preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving motion preferences:', error);
    }
  }, [preferences]);

  const updatePreference = <K extends keyof MotionPreferences>(
    key: K,
    value: MotionPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const disableAll = () => {
    setPreferences({
      animations: false,
      particles: false,
      gradients: false,
      haptics: false,
    });
  };

  return {
    preferences,
    updatePreference,
    resetToDefaults,
    disableAll,
  };
}
