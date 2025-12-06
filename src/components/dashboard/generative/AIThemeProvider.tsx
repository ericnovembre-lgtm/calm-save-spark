import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DashboardTheme } from '@/hooks/useClaudeGenerativeDashboard';

interface AIThemeContextType {
  theme: DashboardTheme;
  cssVars: Record<string, string>;
}

const AIThemeContext = createContext<AIThemeContextType | null>(null);

export const useAITheme = () => {
  const context = useContext(AIThemeContext);
  if (!context) {
    throw new Error('useAITheme must be used within AIThemeProvider');
  }
  return context;
};

interface AIThemeProviderProps {
  theme: DashboardTheme;
  children: React.ReactNode;
}

const accentColors = {
  cyan: { hue: 190, sat: 95, light: 70 },
  amber: { hue: 38, sat: 92, light: 60 },
  emerald: { hue: 155, sat: 70, light: 55 },
  rose: { hue: 350, sat: 85, light: 65 },
  violet: { hue: 270, sat: 75, light: 65 },
  gold: { hue: 45, sat: 90, light: 58 }
};

const moodBackgrounds = {
  calm: 'from-slate-950 via-slate-900 to-slate-950',
  energetic: 'from-slate-950 via-cyan-950/30 to-slate-950',
  cautionary: 'from-slate-950 via-amber-950/30 to-slate-950',
  celebratory: 'from-slate-950 via-yellow-950/30 to-slate-950'
};

export function AIThemeProvider({ theme, children }: AIThemeProviderProps) {
  const accent = accentColors[theme.accentColor] || accentColors.cyan;
  
  const cssVars = useMemo(() => ({
    '--ai-accent': `${accent.hue} ${accent.sat}% ${accent.light}%`,
    '--ai-accent-muted': `${accent.hue} ${accent.sat * 0.6}% ${accent.light * 0.7}%`,
    '--ai-glow': `${accent.hue} ${accent.sat}% ${accent.light + 10}%`,
    '--ai-bg-intensity': `${theme.backgroundIntensity}`,
  }), [accent, theme.backgroundIntensity]);

  // Apply CSS variables to document
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    return () => {
      Object.keys(cssVars).forEach((key) => {
        root.style.removeProperty(key);
      });
    };
  }, [cssVars]);

  const contextValue = useMemo(() => ({
    theme,
    cssVars
  }), [theme, cssVars]);

  return (
    <AIThemeContext.Provider value={contextValue}>
      <div className="relative min-h-screen">
        {/* Animated background based on mood */}
        <AnimatePresence mode="wait">
          <motion.div
            key={theme.mood}
            initial={{ opacity: 0 }}
            animate={{ opacity: theme.backgroundIntensity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className={cn(
              "fixed inset-0 bg-gradient-to-br pointer-events-none -z-10",
              moodBackgrounds[theme.mood]
            )}
          />
        </AnimatePresence>

        {/* Mood-specific ambient effects */}
        {theme.mood === 'celebratory' && theme.animationLevel !== 'subtle' && (
          <div className="fixed inset-0 pointer-events-none -z-5 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400/30 rounded-full"
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: -10,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  y: typeof window !== 'undefined' ? window.innerHeight + 10 : 1000,
                  rotate: 360
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear'
                }}
              />
            ))}
          </div>
        )}

        {theme.mood === 'energetic' && theme.animationLevel === 'prominent' && (
          <div className="fixed inset-0 pointer-events-none -z-5">
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-cyan-500/5 to-transparent"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>
        )}

        {theme.mood === 'cautionary' && (
          <div className="fixed inset-0 pointer-events-none -z-5">
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent"
              animate={{
                opacity: theme.animationLevel === 'prominent' ? [0.1, 0.2, 0.1] : 0.1
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>
        )}

        {/* Main content */}
        <div className="relative z-0">
          {children}
        </div>
      </div>
    </AIThemeContext.Provider>
  );
}
