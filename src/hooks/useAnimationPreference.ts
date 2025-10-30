import { useState, useEffect } from 'react';

const STORAGE_KEY = 'animatedIcons';

/**
 * Hook that returns whether animations should be enabled based on:
 * 1. System preference (prefers-reduced-motion)
 * 2. User preference (localStorage)
 * 
 * Animations are enabled if:
 * - System does NOT prefer reduced motion AND
 * - User has NOT explicitly disabled animations
 * 
 * @returns boolean - true if animations should be enabled
 */
export function useAnimationPreference(): boolean {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check system preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const systemPrefersReduced = mediaQuery.matches;

    // Check user preference from localStorage
    const getUserPreference = (): boolean => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          return JSON.parse(stored) === true;
        }
      } catch (e) {
        console.warn('Failed to read animation preference:', e);
      }
      return true; // Default to enabled
    };

    const updatePreference = () => {
      const userWantsAnimation = getUserPreference();
      const systemPrefersReduced = mediaQuery.matches;
      setIsAnimationEnabled(!systemPrefersReduced && userWantsAnimation);
    };

    // Initial update
    updatePreference();

    // Listen for system preference changes
    const handleMediaChange = () => updatePreference();
    mediaQuery.addEventListener('change', handleMediaChange);

    // Listen for localStorage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        updatePreference();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Return true during SSR/initial render to avoid hydration mismatch
  return isMounted ? isAnimationEnabled : true;
}

/**
 * Utility to set user animation preference
 */
export function setAnimationPreference(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(enabled),
      storageArea: localStorage
    }));
  } catch (e) {
    console.warn('Failed to save animation preference:', e);
  }
}

/**
 * Utility to get current user animation preference
 */
export function getAnimationPreference(): boolean {
  if (typeof window === 'undefined') return true;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return JSON.parse(stored) === true;
    }
  } catch (e) {
    console.warn('Failed to read animation preference:', e);
  }
  return true; // Default to enabled
}
