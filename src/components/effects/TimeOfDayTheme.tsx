import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimeOfDay, getTimeTheme, type TimeOfDay } from '@/lib/time-themes';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TimeOfDayThemeProps {
  enabled?: boolean;
}

export function TimeOfDayTheme({ enabled = true }: TimeOfDayThemeProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getTimeOfDay());
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!enabled) return;

    // Update time of day every 15 minutes
    const updateTime = () => {
      setTimeOfDay(getTimeOfDay());
    };

    const interval = setInterval(updateTime, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const theme = getTimeTheme(timeOfDay);
    const root = document.documentElement;

    // Apply CSS variables
    Object.entries(theme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    return () => {
      // Clean up CSS variables
      Object.keys(theme.cssVars).forEach(key => {
        root.style.removeProperty(key);
      });
    };
  }, [timeOfDay, enabled]);

  if (!enabled || prefersReducedMotion) return null;

  const theme = getTimeTheme(timeOfDay);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={timeOfDay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          background: theme.gradientOverlay
        }}
        aria-hidden="true"
      />
    </AnimatePresence>
  );
}
