import { useCallback } from 'react';
import { soundEffects } from '@/lib/sound-effects';

export function useAutomationSounds() {
  const playToggle = useCallback((isActive: boolean) => {
    if (isActive) {
      soundEffects.success();
    } else {
      soundEffects.click();
    }
  }, []);

  const playEmergencyBrake = useCallback(() => {
    soundEffects.warning();
  }, []);

  const playRecipeActivated = useCallback(() => {
    soundEffects.milestone();
  }, []);

  const playBlockConnected = useCallback(() => {
    soundEffects.click();
  }, []);

  const playBlockDrag = useCallback(() => {
    soundEffects.swipe();
  }, []);

  const playAutomationExecuted = useCallback(() => {
    soundEffects.coinDrop();
  }, []);

  const playDelete = useCallback(() => {
    soundEffects.error();
  }, []);

  const playSwipe = useCallback(() => {
    soundEffects.swipe();
  }, []);

  return {
    playToggle,
    playEmergencyBrake,
    playRecipeActivated,
    playBlockConnected,
    playBlockDrag,
    playAutomationExecuted,
    playDelete,
    playSwipe,
  };
}
