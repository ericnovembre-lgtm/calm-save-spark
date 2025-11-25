import { useState, useCallback } from 'react';
import { useCelebrationSounds } from './useCelebrationSounds';
import { useHapticFeedback } from './useHapticFeedback';

export interface QuestlineCelebrationData {
  stepTitle: string;
  stepPoints: number;
  questlineName: string;
  category: string;
  isQuestlineComplete: boolean;
}

/**
 * Hook to manage questline celebration state and effects
 * Coordinates confetti, sound, and haptic feedback
 */
export function useQuestlineCelebration() {
  const [celebrationData, setCelebrationData] = useState<QuestlineCelebrationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { playSuccessChime, playConfettiPop } = useCelebrationSounds();
  const { triggerHaptic } = useHapticFeedback();

  const triggerCelebration = useCallback((data: QuestlineCelebrationData) => {
    setCelebrationData(data);
    setIsVisible(true);

    // Sound effects
    if (data.isQuestlineComplete) {
      playSuccessChime();
      setTimeout(() => playConfettiPop(), 200);
      setTimeout(() => playConfettiPop(), 400);
    } else {
      playSuccessChime();
      setTimeout(() => playConfettiPop(), 150);
    }

    // Haptic feedback
    triggerHaptic(data.isQuestlineComplete ? 'success' : 'medium');

    // Auto-hide after animation
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setCelebrationData(null), 500);
    }, data.isQuestlineComplete ? 4000 : 3000);
  }, [playSuccessChime, playConfettiPop, triggerHaptic]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setCelebrationData(null), 500);
  }, []);

  return {
    celebrationData,
    isVisible,
    triggerCelebration,
    dismiss,
  };
}
