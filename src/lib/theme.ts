/**
 * Theme utilities for $ave+
 * 
 * Manages theme persistence, system detection, and application
 */

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'saveplus_theme';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

/**
 * Get the persisted theme from localStorage
 * @returns Theme value or null if not set
 */
export function getPersistedTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (e) {
    console.warn('Failed to read theme from localStorage:', e);
  }
  
  return null;
}

/**
 * Set the theme in localStorage
 */
export function setPersistedTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (e) {
    console.warn('Failed to save theme to localStorage:', e);
  }
}

/**
 * Detect the system's preferred color scheme
 * @returns true if dark mode, false if light
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  const mediaQuery = window.matchMedia(MEDIA_QUERY);
  return mediaQuery.matches ? 'dark' : 'light';
}

/**
 * Resolve the actual theme to apply (light or dark)
 * Handles "system" by detecting OS preference
 */
export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Apply the theme to the document
 * Adds/removes 'dark' class on <html> element
 */
export function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Listen to OS theme changes
 * @param callback Function called when OS theme changes
 * @returns Cleanup function to remove listener
 */
export function listenOSChange(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia(MEDIA_QUERY);
  
  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    callback(e.matches);
  };
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
  
  // Legacy browsers
  if (mediaQuery.addListener) {
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }
  
  return () => {};
}

/**
 * Get the initial theme to use
 * Priority: persisted > system
 */
export function getInitialTheme(): Theme {
  const persisted = getPersistedTheme();
  if (persisted) return persisted;
  
  // Default to system
  return 'system';
}

/**
 * Set theme and apply it immediately
 */
export function setTheme(theme: Theme): void {
  setPersistedTheme(theme);
  const resolved = resolveTheme(theme);
  applyTheme(resolved);
}
