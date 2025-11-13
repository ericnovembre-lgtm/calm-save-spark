import { useState, useEffect } from 'react';
import { NeutralConfetti } from './NeutralConfetti';
import { useCelebrationSounds } from '@/hooks/useCelebrationSounds';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

type CelebrationType = 'achievement' | 'goal' | 'milestone' | 'streak';

interface CelebrationManagerProps {
  trigger: boolean;
  type?: CelebrationType;
  onComplete?: () => void;
}

/**
 * CelebrationManager - Orchestrates multi-sensory celebration effects
 * Combines visual (confetti), audio (sounds), and haptic feedback
 */
export function CelebrationManager({ 
  trigger, 
  type = 'achievement',
  onComplete 
}: CelebrationManagerProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { playSuccessChime, playConfettiPop } = useCelebrationSounds();
  const { triggerHaptic } = useHapticFeedback();

  useEffect(() => {
    if (trigger) {
      setShowConfetti(true);
      
      // Play sounds based on celebration type
      if (type === 'goal' || type === 'achievement') {
        playSuccessChime();
        setTimeout(() => playConfettiPop(), 200);
      } else {
        playConfettiPop();
      }

      // Haptic feedback pattern based on type
      const hapticPattern = type === 'goal' ? 'success' : 'medium';
      triggerHaptic(hapticPattern);

      // Hide confetti after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger, type, playSuccessChime, playConfettiPop, triggerHaptic, onComplete]);

  return (
    <NeutralConfetti 
      show={showConfetti} 
      duration={type === 'goal' ? 3000 : 2000}
      count={type === 'goal' ? 40 : 28}
    />
  );
}
