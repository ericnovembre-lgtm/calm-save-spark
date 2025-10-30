import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  ThemeMode,
  getTheme,
  setTheme as setThemeUtil,
  applyTheme,
  listenOSChange
} from '@/lib/theme';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

interface ThemeProviderState {
  /** Current theme setting: 'light', 'dark', or 'system' */
  theme: ThemeMode;
  /** Resolved theme (actual applied theme): 'light' or 'dark' */
  resolvedTheme: 'light' | 'dark';
  /** Set the theme */
  setTheme: (theme: ThemeMode) => void;
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
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [isMounted, setIsMounted] = useState(false);

  // Get resolved theme
  const getResolvedTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return theme === 'dark' || (theme === 'system' && prefersDark) ? 'dark' : 'light';
  };

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme on mount (client-side only)
  useEffect(() => {
    const initialTheme = getTheme();
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setResolvedTheme(getResolvedTheme());
    setIsMounted(true);
  }, []);

  // Listen to OS theme changes when theme is "system"
  useEffect(() => {
    if (theme !== 'system') return;

    const cleanup = listenOSChange(() => {
      applyTheme(theme);
      setResolvedTheme(getResolvedTheme());
    });

    return cleanup;
  }, [theme]);

  // Handle theme changes
  const handleSetTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    setThemeUtil(newTheme);
    setResolvedTheme(getResolvedTheme());
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
