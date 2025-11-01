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
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system'
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
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark)
  const root = document.documentElement
  root.classList.toggle('dark', isDark)
  root.dataset.theme = mode
  root.style.colorScheme = isDark ? 'dark' : 'light'
}

/** Re-apply system when OS theme flips */
export function listenOSChange(onChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => {
    if (getTheme() === 'system') {
      applyTheme('system')
      onChange?.()
    }
  }
  mq.addEventListener?.('change', handler)
  return () => mq.removeEventListener?.('change', handler)
}

/**
 * Hook for components to read and set theme
 * Re-renders when theme changes
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => getTheme())

  useEffect(() => {
    applyTheme(theme)
    const cleanup = listenOSChange(() => setThemeState(getTheme()))
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setThemeState(getTheme())
    }
    window.addEventListener('storage', onStorage)
    return () => {
      cleanup()
      window.removeEventListener('storage', onStorage)
    }
  }, [theme])

  const change = (next: ThemeMode) => {
    setTheme(next)
    setThemeState(next)
  }
  
  return { theme, setTheme: change }
}

/**
 * Hook to get resolved theme (light or dark)
 */
export function useResolvedTheme(): 'light' | 'dark' {
  const { theme } = useTheme();
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
