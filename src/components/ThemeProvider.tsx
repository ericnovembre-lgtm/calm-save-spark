import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  Theme,
  getInitialTheme,
  resolveTheme,
  applyTheme,
  setPersistedTheme,
  listenOSChange
} from '@/lib/theme';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  /** Current theme setting: 'light', 'dark', or 'system' */
  theme: Theme;
  /** Resolved theme (actual applied theme): 'light' or 'dark' */
  resolvedTheme: 'light' | 'dark';
  /** Set the theme */
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

/**
 * $ave+ Theme Provider
 * 
 * Features:
 * - Persists theme to localStorage
 * - Honors system theme when "system" is selected
 * - Reacts to OS theme changes in real-time
 * - SSR-safe (no flash of unstyled content)
 * - Applies theme class to <html> element
 * 
 * @example
 * ```tsx
 * <ThemeProvider defaultTheme="system">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "saveplus_theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  // Initialize theme on mount (client-side only)
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);
    
    const resolved = resolveTheme(initialTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    
    setIsMounted(true);
  }, []);

  // Listen to OS theme changes when theme is "system"
  useEffect(() => {
    if (theme !== 'system') return;

    const cleanup = listenOSChange((isDark) => {
      const newResolved = isDark ? 'dark' : 'light';
      setResolvedTheme(newResolved);
      applyTheme(newResolved);
    });

    return cleanup;
  }, [theme]);

  // Handle theme changes
  const handleSetTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setPersistedTheme(newTheme);
    
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  };

  const value: ThemeProviderState = {
    theme,
    resolvedTheme,
    setTheme: handleSetTheme
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

/**
 * Script to inject theme early (prevents flash of unstyled content)
 * Place this in your index.html <head>
 * 
 * @example
 * ```tsx
 * // In index.html
 * <ThemeScript />
 * ```
 */
export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const stored = localStorage.getItem('saveplus_theme');
        const theme = stored === 'light' || stored === 'dark' || stored === 'system' 
          ? stored 
          : 'system';
        
        let resolved = theme;
        if (theme === 'system') {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          resolved = isDark ? 'dark' : 'light';
        }
        
        if (resolved === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}
