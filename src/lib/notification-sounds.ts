/**
 * Notification Sounds Library
 * Dedicated audio feedback for notifications and alerts
 */

class NotificationSoundsManager {
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.25;

  constructor() {
    if (typeof window !== 'undefined') {
      this.enabled = localStorage.getItem('notificationSoundsEnabled') !== 'false';
    }
  }

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('notificationSoundsEnabled', enabled.toString());
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    fadeOut: boolean = true
  ): void {
    if (!this.enabled) return;

    try {
      const context = this.getContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(this.volume, context.currentTime);
      if (fadeOut) {
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
      }

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      console.debug('Notification sound failed:', error);
    }
  }

  private playChord(frequencies: number[], duration: number = 0.3): void {
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, duration, 'sine'), i * 50);
    });
  }

  /** Alert sound - budget warning, unusual activity */
  alert(): void {
    // Descending two-tone alert
    this.playTone(880, 0.15, 'triangle');
    setTimeout(() => this.playTone(660, 0.15, 'triangle'), 150);
  }

  /** Insight sound - AI insight arrival (gentle chime) */
  insight(): void {
    // Soft ascending chime
    this.playTone(523.25, 0.2, 'sine'); // C5
    setTimeout(() => this.playTone(659.25, 0.25, 'sine'), 100); // E5
  }

  /** Message sound - chat message received */
  message(): void {
    // Quick double blip
    this.playTone(800, 0.08, 'sine');
    setTimeout(() => this.playTone(1000, 0.1, 'sine'), 100);
  }

  /** Reminder sound - bill due, scheduled transfer */
  reminder(): void {
    // Gentle three-tone sequence
    const frequencies = [440, 554.37, 659.25]; // A4, C#5, E5
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine'), i * 120);
    });
  }

  /** Achievement sound - goal reached, badge unlocked */
  achievement(): void {
    // Triumphant ascending arpeggio
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine'), i * 80);
    });
  }

  /** Transaction sound - money moved (coin drop) */
  transaction(): void {
    this.playTone(1200, 0.08, 'sine');
    setTimeout(() => this.playTone(800, 0.12, 'sine'), 40);
  }

  /** Error sound - action failed */
  error(): void {
    this.playTone(200, 0.2, 'square');
    setTimeout(() => this.playTone(150, 0.25, 'square'), 150);
  }

  /** Success sound - action completed */
  success(): void {
    this.playChord([523.25, 659.25, 783.99]); // C major
  }

  /** Refresh sound - data updated */
  refresh(): void {
    this.playTone(600, 0.1, 'sine');
  }

  /** Dismiss sound - notification cleared */
  dismiss(): void {
    this.playTone(400, 0.08, 'sine', true);
  }

  /** Urgent alert - critical notification */
  urgent(): void {
    // Attention-grabbing pattern
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(880, 0.1, 'square');
        setTimeout(() => this.playTone(880, 0.1, 'square'), 150);
      }, i * 400);
    }
  }

  /** Celebration sound - major milestone */
  celebrate(): void {
    // Firework-like ascending pattern
    const frequencies = [262, 330, 392, 523, 659, 784, 1047];
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15 + i * 0.02, 'sine'), i * 60);
    });
  }
}

export const notificationSounds = new NotificationSoundsManager();
