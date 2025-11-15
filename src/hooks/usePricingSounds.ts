import { useCallback } from 'react';
import { useSoundEffects } from './useSoundEffects';

/**
 * Pricing-specific sound effects hook
 * Extends base sound effects with pricing page interactions
 */
export function usePricingSounds() {
  const baseEffects = useSoundEffects();

  // Tier change sound (level up)
  const playTierChangeSound = useCallback(() => {
    // Use achievement sound for tier upgrades
    baseEffects.playAchievementSound();
  }, [baseEffects]);

  // Feature unlock sound
  const playFeatureUnlockSound = useCallback(() => {
    // Use achievement sound for feature unlocks
    baseEffects.playAchievementSound();
  }, [baseEffects]);

  // Checkout start sound
  const playCheckoutStartSound = useCallback(() => {
    // Use click sound for checkout
    baseEffects.playClickSound();
  }, [baseEffects]);

  // Success sound (enhanced)
  const playSuccessSound = useCallback(() => {
    // Use goal complete sound for plan activation
    baseEffects.playGoalCompleteSound();
  }, [baseEffects]);

  // Slider drag sound
  const playSliderSound = useCallback(() => {
    // Use coin sound for slider interactions
    baseEffects.playCoinSound();
  }, [baseEffects]);

  // Hover sound
  const playHoverSound = useCallback(() => {
    // Use click sound for hover feedback
    baseEffects.playClickSound();
  }, [baseEffects]);

  return {
    ...baseEffects,
    playTierChangeSound,
    playFeatureUnlockSound,
    playCheckoutStartSound,
    playSuccessSound,
    playSliderSound,
    playHoverSound,
  };
}
