/**
 * Audio Manager for Goal Interactions
 * Manages sound effects with user preferences
 */

interface AudioPreferences {
  enabled: boolean;
  volume: number;
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private preferences: AudioPreferences = {
    enabled: true,
    volume: 0.3
  };

  constructor() {
    this.loadPreferences();
  }

  private loadPreferences() {
    try {
      const stored = localStorage.getItem('audio-preferences');
      if (stored) {
        this.preferences = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load audio preferences:', error);
    }
  }

  private getContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.preferences.enabled = enabled;
    localStorage.setItem('audio-preferences', JSON.stringify(this.preferences));
  }

  setVolume(volume: number) {
    this.preferences.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('audio-preferences', JSON.stringify(this.preferences));
  }

  /**
   * Play coin clink sound
   */
  playCoinClink() {
    if (!this.preferences.enabled) return;

    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    osc.type = 'sine';

    gain.gain.setValueAtTime(this.preferences.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Play milestone chime (different tones based on percentage)
   */
  playMilestoneChime(percentage: number) {
    if (!this.preferences.enabled) return;

    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Different frequencies for different milestones
    const frequencies = percentage >= 100 
      ? [523.25, 659.25, 783.99, 1046.50, 1318.51] // Full celebration
      : percentage >= 75
      ? [523.25, 659.25, 783.99, 1046.50] // Near complete
      : percentage >= 50
      ? [523.25, 659.25, 783.99] // Half way
      : [523.25, 659.25]; // Early progress

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      osc.type = 'sine';

      const startTime = now + (index * 0.1);
      const duration = 0.4;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.preferences.volume * 0.25, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  /**
   * Play quick interaction sound
   */
  playClick() {
    if (!this.preferences.enabled) return;

    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 1200;
    osc.type = 'sine';

    gain.gain.setValueAtTime(this.preferences.volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Play swipe sound
   */
  playSwipe() {
    if (!this.preferences.enabled) return;

    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    osc.type = 'sine';

    gain.gain.setValueAtTime(this.preferences.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Play achievement unlock sound
   */
  playAchievementUnlock() {
    if (!this.preferences.enabled) return;

    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Triumphant fanfare
    const melody = [
      { freq: 523.25, time: 0 },
      { freq: 659.25, time: 0.1 },
      { freq: 783.99, time: 0.2 },
      { freq: 1046.50, time: 0.3 },
      { freq: 783.99, time: 0.4 },
      { freq: 1046.50, time: 0.5 }
    ];

    melody.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      osc.type = 'triangle';

      const startTime = now + time;
      const duration = 0.3;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.preferences.volume * 0.3, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }
}

export const audioManager = new AudioManager();
