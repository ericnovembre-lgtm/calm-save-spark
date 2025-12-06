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

// $ave+ Brand-aligned accent colors (warm, neutral palette)
const accentColors = {
  gold: { hue: 42, sat: 50, light: 65 },      // Primary brand beige
  amber: { hue: 38, sat: 60, light: 58 },     // Warm warning
  cream: { hue: 40, sat: 30, light: 75 },     // Soft neutral
  rose: { hue: 0, sat: 40, light: 65 },       // Muted caution
  emerald: { hue: 155, sat: 50, light: 45 },  // Softer success
  cyan: { hue: 190, sat: 50, light: 55 }      // Legacy compatibility
};

// $ave+ Brand-aligned mood backgrounds (off-white, beige tones)
const moodBackgrounds = {
  calm: 'from-background via-secondary/10 to-background',
  energetic: 'from-background via-accent/15 to-background',
  cautionary: 'from-background via-warning/10 to-background',
  celebratory: 'from-background via-accent/20 to-background'
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
        {/* Celebratory - subtle gold sparkles (brand-aligned) */}
        {theme.mood === 'celebratory' && theme.animationLevel !== 'subtle' && (
          <div className="fixed inset-0 pointer-events-none -z-5 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-accent/40 rounded-full"
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
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear'
                }}
              />
            ))}
          </div>
        )}

        {/* Energetic - warm accent glow (brand-aligned) */}
        {theme.mood === 'energetic' && theme.animationLevel === 'prominent' && (
          <div className="fixed inset-0 pointer-events-none -z-5">
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-accent/5 to-transparent"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>
        )}

        {/* Cautionary - subtle warm amber (brand-aligned) */}
        {theme.mood === 'cautionary' && (
          <div className="fixed inset-0 pointer-events-none -z-5">
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-warning/5 to-transparent"
              animate={{
                opacity: theme.animationLevel === 'prominent' ? [0.05, 0.1, 0.05] : 0.05
              }}
              transition={{
                duration: 3,
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
