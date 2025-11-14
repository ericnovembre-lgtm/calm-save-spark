import { useState, useEffect } from 'react';

export interface MotionPreferences {
  animations: boolean;
  particles: boolean;
  gradients: boolean;
  haptics: boolean;
  batteryAware: boolean;
}

const DEFAULT_PREFERENCES: MotionPreferences = {
  animations: true,
  particles: true,
  gradients: true,
  haptics: true,
  batteryAware: true,
};

const STORAGE_KEY = 'motion-preferences';

// Battery-aware mode thresholds
const LOW_BATTERY_THRESHOLD = 0.20; // 20%
const CRITICAL_BATTERY_THRESHOLD = 0.10; // 10%

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

  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);

  // Monitor battery level
  useEffect(() => {
    if (!preferences.batteryAware) return;
    if (!('getBattery' in navigator)) return;

    let battery: any;

    const updateBatteryStatus = (b: any) => {
      const level = b.level;
      setBatteryLevel(level);

      // Enable low power mode if battery is low and not charging
      if (!b.charging && level <= LOW_BATTERY_THRESHOLD) {
        setIsLowPowerMode(true);
      } else if (level > LOW_BATTERY_THRESHOLD || b.charging) {
        setIsLowPowerMode(false);
      }
    };

    (navigator as any).getBattery().then((b: any) => {
      battery = b;
      updateBatteryStatus(b);

      b.addEventListener('levelchange', () => updateBatteryStatus(b));
      b.addEventListener('chargingchange', () => updateBatteryStatus(b));
    });

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', updateBatteryStatus);
        battery.removeEventListener('chargingchange', updateBatteryStatus);
      }
    };
  }, [preferences.batteryAware]);

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
      batteryAware: preferences.batteryAware, // Preserve battery-aware setting
    });
  };

  // Return effective preferences considering battery mode
  const effectivePreferences = isLowPowerMode ? {
    ...preferences,
    animations: false,
    particles: false,
    gradients: false,
  } : preferences;

  return {
    preferences: effectivePreferences,
    updatePreference,
    resetToDefaults,
    disableAll,
    batteryLevel,
    isLowPowerMode,
    rawPreferences: preferences, // Original preferences without battery override
  };
}
