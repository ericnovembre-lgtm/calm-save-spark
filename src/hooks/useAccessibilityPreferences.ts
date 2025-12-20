import { useState, useEffect, useCallback } from 'react';

interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  focusStyle: 'ring' | 'glow' | 'outline' | 'both';
  fontSize: number;
  linkUnderlines: boolean;
  animationsDisabled: boolean;
  announcementVerbosity: 'minimal' | 'normal' | 'verbose';
  keyboardHints: boolean;
  autoReadAlerts: boolean;
  floatingOrbsEnabled: boolean;
  hoverSoundsEnabled: boolean;
}

const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  reducedMotion: false,
  focusStyle: 'ring',
  fontSize: 100,
  linkUnderlines: false,
  animationsDisabled: false,
  announcementVerbosity: 'normal',
  keyboardHints: false,
  autoReadAlerts: true,
  floatingOrbsEnabled: true,
  hoverSoundsEnabled: true,
};

const STORAGE_KEY = 'accessibility-preferences';

/**
 * Hook to access accessibility preferences from localStorage
 * Syncs across components via storage events
 */
export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    if (typeof window === 'undefined') return defaultPreferences;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
  });

  // Listen for storage changes (cross-tab sync and same-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(e.newValue) });
      }
    };

    // Custom event for same-tab sync
    const handleCustomUpdate = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(saved) });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('accessibility-preferences-updated', handleCustomUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('accessibility-preferences-updated', handleCustomUpdate);
    };
  }, []);

  return {
    preferences,
    floatingOrbsEnabled: preferences.floatingOrbsEnabled,
    hoverSoundsEnabled: preferences.hoverSoundsEnabled,
    reducedMotion: preferences.reducedMotion,
    animationsDisabled: preferences.animationsDisabled,
  };
}
