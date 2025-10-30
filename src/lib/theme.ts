'use client'

import { useEffect, useState } from 'react'

/**
 * Theme utilities for $ave+
 */

export type ThemeMode = 'light' | 'dark' | 'system'
const KEY = 'saveplus_theme'

export function getTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const raw = localStorage.getItem(KEY)
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  return 'system'
}

export function setTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, mode)
  applyTheme(mode)
  
  // Trigger storage event for cross-tab sync
  window.dispatchEvent(new StorageEvent('storage', {
    key: KEY,
    newValue: mode,
    storageArea: localStorage
  }))
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark)
  root.classList.toggle('dark', !!isDark)
  root.dataset.theme = mode
}

export function listenOSChange(onChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => onChange()
  mq.addEventListener?.('change', handler)
  return () => mq.removeEventListener?.('change', handler)
}

/**
 * Hook to reactively access current theme
 * Re-renders when theme changes
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => 
    typeof window !== 'undefined' ? getTheme() : 'system'
  );

  useEffect(() => {
    // Sync with actual theme
    setThemeState(getTheme());

    // Listen to storage events (cross-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        setThemeState(getTheme());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return theme;
}

/**
 * Hook to get resolved theme (light or dark)
 */
export function useResolvedTheme(): 'light' | 'dark' {
  const theme = useTheme();
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateResolved = () => {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
      setResolved(isDark ? 'dark' : 'light');
    };

    updateResolved();

    // Listen to OS theme changes
    if (theme === 'system') {
      const cleanup = listenOSChange(updateResolved);
      return cleanup;
    }
  }, [theme]);

  return resolved;
}
