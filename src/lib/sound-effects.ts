/**
 * Sound Effects Manager
 * Handles UI sound effects with volume control and muting
 */

class SoundEffectsManager {
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    if (typeof window !== 'undefined') {
      this.enabled = localStorage.getItem('soundEffectsEnabled') !== 'false';
    }
  }

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEffectsEnabled', enabled.toString());
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled) return;

    const context = this.getContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(this.volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  }

  // UI Interaction Sounds
  click() {
    this.playTone(800, 0.05, 'sine');
  }

  hover() {
    this.playTone(400, 0.03, 'sine');
  }

  success() {
    const context = this.getContext();
    const now = context.currentTime;
    
    // C major chord
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sine'), i * 100);
    });
  }

  error() {
    this.playTone(200, 0.2, 'square');
    setTimeout(() => this.playTone(150, 0.2, 'square'), 100);
  }

  warning() {
    this.playTone(440, 0.15, 'triangle');
    setTimeout(() => this.playTone(440, 0.15, 'triangle'), 200);
  }

  // Budget-specific sounds
  milestone() {
    const context = this.getContext();
    const frequencies = [523.25, 587.33, 659.25, 783.99, 880.00];
    
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine'), i * 80);
    });
  }

  coinDrop() {
    this.playTone(1200, 0.1, 'sine');
    setTimeout(() => this.playTone(800, 0.15, 'sine'), 50);
  }

  progressTick() {
    this.playTone(600, 0.05, 'sine');
  }

  swipe() {
    const context = this.getContext();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.connect(gain);
    gain.connect(context.destination);

    osc.frequency.setValueAtTime(800, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.1);
    osc.type = 'sine';

    gain.gain.setValueAtTime(this.volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

    osc.start();
    osc.stop(context.currentTime + 0.1);
  }
}

export const soundEffects = new SoundEffectsManager();
