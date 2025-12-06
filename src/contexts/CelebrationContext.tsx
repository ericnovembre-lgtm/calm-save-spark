import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useGlobalAchievementListener } from '@/hooks/useGlobalAchievementListener';

export type CelebrationType = 'achievement' | 'milestone' | 'challenge' | 'streak' | 'rank_up';

export interface CelebrationData {
  type: CelebrationType;
  title: string;
  description?: string;
  points?: number;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  color?: string;
}

interface CelebrationContextType {
  isActive: boolean;
  celebration: CelebrationData | null;
  triggerCelebration: (data: CelebrationData) => void;
  dismissCelebration: () => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);

  // Enable app-wide real-time achievement detection
  useGlobalAchievementListener();

  const triggerCelebration = useCallback((data: CelebrationData) => {
    setCelebration(data);
    setIsActive(true);
  }, []);

  const dismissCelebration = useCallback(() => {
    setIsActive(false);
    setTimeout(() => setCelebration(null), 300);
  }, []);

  return (
    <CelebrationContext.Provider value={{ isActive, celebration, triggerCelebration, dismissCelebration }}>
      {children}
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within CelebrationProvider');
  }
  return context;
}
