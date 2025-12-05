/**
 * Haptics Utility Library
 * Provides advanced haptic feedback patterns for mobile interactions
 */

export type HapticIntensity = 'light' | 'medium' | 'heavy';
export type HapticPattern = 'tap' | 'success' | 'error' | 'warning' | 'achievement' | 'notification';

// Base vibration durations (in milliseconds)
const VIBRATION_DURATIONS = {
  light: 10,
  medium: 20,
  heavy: 30,
} as const;

// Complex vibration patterns for different interactions
const HAPTIC_PATTERNS: Record<HapticPattern, number[]> = {
  // Single quick tap
  tap: [10],
  
  // Success: Quick double pulse
  success: [15, 50, 15],
  
  // Error: Long single vibration
  error: [50],
  
  // Warning: Three short pulses
  warning: [15, 40, 15, 40, 15],
  
  // Achievement: Celebratory pattern
  achievement: [20, 50, 20, 50, 30, 100, 40],
  
  // Notification: Gentle reminder
  notification: [10, 100, 10],
} as const;

class HapticsManager {
  private enabled: boolean = true;
  private prefersReducedMotion: boolean = false;
  private intensity: HapticIntensity = 'medium';
  private intensityMultiplier: Record<HapticIntensity, number> = {
    light: 0.5,
    medium: 1,
    heavy: 1.5,
  };

  constructor() {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Listen for changes to motion preference
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        this.prefersReducedMotion = e.matches;
      });

      // Load saved intensity preference
      try {
        const saved = localStorage.getItem('haptic-preferences');
        if (saved) {
          const prefs = JSON.parse(saved);
          if (prefs.intensity) this.intensity = prefs.intensity;
          if (typeof prefs.enabled === 'boolean') this.enabled = prefs.enabled;
        }
      } catch {
        // Ignore parse errors
      }
    }
  }

  /**
   * Check if haptic feedback is available on this device
   */
  isAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  /**
   * Enable or disable all haptic feedback
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Get current enabled state
   */
  isEnabled(): boolean {
    return this.enabled && !this.prefersReducedMotion;
  }

  /**
   * Set vibration intensity (affects all vibrations)
   */
  setIntensity(intensity: HapticIntensity): void {
    this.intensity = intensity;
  }

  /**
   * Get current intensity
   */
  getIntensity(): HapticIntensity {
    return this.intensity;
  }

  /**
   * Get scaled duration based on current intensity
   */
  private getScaledDuration(baseDuration: number): number {
    return Math.round(baseDuration * this.intensityMultiplier[this.intensity]);
  }

  /**
   * Get scaled pattern based on current intensity
   */
  private getScaledPattern(pattern: number[]): number[] {
    return pattern.map((duration, index) => {
      // Only scale vibration durations (even indices), not pauses (odd indices)
      if (index % 2 === 0) {
        return this.getScaledDuration(duration);
      }
      return duration;
    });
  }

  /**
   * Trigger a simple vibration with specified intensity
   */
  vibrate(intensityOverride?: HapticIntensity): void {
    if (!this.isEnabled() || !this.isAvailable()) {
      return;
    }

    try {
      const targetIntensity = intensityOverride || this.intensity;
      const baseDuration = VIBRATION_DURATIONS[targetIntensity];
      const scaledDuration = this.getScaledDuration(baseDuration);
      navigator.vibrate(scaledDuration);
    } catch (error) {
      console.debug('Haptic vibration failed:', error);
    }
  }

  /**
   * Trigger a predefined haptic pattern
   */
  pattern(pattern: HapticPattern): void {
    if (!this.isEnabled() || !this.isAvailable()) {
      return;
    }

    try {
      const vibrationPattern = HAPTIC_PATTERNS[pattern];
      const scaledPattern = this.getScaledPattern([...vibrationPattern]);
      navigator.vibrate(scaledPattern);
    } catch (error) {
      console.debug('Haptic pattern failed:', error);
    }
  }

  /**
   * Trigger a custom vibration pattern
   * @param pattern Array of vibration/pause durations in milliseconds
   */
  custom(pattern: number[]): void {
    if (!this.isEnabled() || !this.isAvailable()) {
      return;
    }

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.debug('Custom haptic pattern failed:', error);
    }
  }

  /**
   * Stop any ongoing vibration
   */
  stop(): void {
    if (!this.isAvailable()) {
      return;
    }

    try {
      navigator.vibrate(0);
    } catch (error) {
      console.debug('Failed to stop haptic:', error);
    }
  }

  /**
   * Convenience methods for common interactions
   */

  // Button press
  buttonPress(): void {
    this.vibrate('light');
  }

  // Toggle switch
  toggle(isOn: boolean): void {
    this.vibrate(isOn ? 'medium' : 'light');
  }

  // Selection change (e.g., radio button, dropdown)
  select(): void {
    this.vibrate('light');
  }

  // Drag start
  dragStart(): void {
    this.vibrate('medium');
  }

  // Drag end / drop
  dragEnd(): void {
    this.vibrate('light');
  }

  // Swipe gesture
  swipe(): void {
    this.vibrate('medium');
  }

  // Scroll to boundary (top or bottom)
  scrollBoundary(): void {
    this.custom([10, 30, 10]);
  }

  // Pull to refresh triggered
  refreshTriggered(): void {
    this.pattern('success');
  }

  // Item deleted
  itemDeleted(): void {
    this.custom([30, 50, 30]);
  }

  // Form validation error
  validationError(): void {
    this.pattern('error');
  }

  // Form submitted successfully
  formSuccess(): void {
    this.pattern('success');
  }

  // Achievement unlocked
  achievementUnlocked(): void {
    this.pattern('achievement');
  }

  // Notification received
  notificationReceived(): void {
    this.pattern('notification');
  }

  // Long press detected
  longPress(): void {
    this.vibrate('heavy');
  }

  // Context menu opened
  contextMenu(): void {
    this.vibrate('medium');
  }

  // Modal opened/closed
  modalToggle(): void {
    this.vibrate('light');
  }

  // Tab changed
  tabChange(): void {
    this.vibrate('light');
  }

  // Slider value changed
  sliderChange(): void {
    this.vibrate('light');
  }

  // Range limit reached
  rangeLimit(): void {
    this.custom([15, 30, 15]);
  }

  // Timer/countdown completion
  timerComplete(): void {
    this.custom([50, 100, 50, 100, 50]);
  }

  // Loading complete
  loadingComplete(): void {
    this.vibrate('light');
  }
}

// Export singleton instance
export const haptics = new HapticsManager();

// Export for React hooks
export default haptics;
