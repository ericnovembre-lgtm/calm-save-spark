import * as Tone from 'tone';

class DigitalTwinSounds {
  private synth: Tone.Synth | null = null;
  private initialized = false;
  private lastScrubTime = 0;
  private scrubThrottleMs = 100; // Max 1 sound per 100ms

  async init() {
    if (this.initialized) return;
    await Tone.start();
    this.synth = new Tone.Synth().toDestination();
    this.initialized = true;
  }

  async playTimelineScrub() {
    // Throttle scrub sounds to avoid overwhelming audio
    const now = Date.now();
    if (now - this.lastScrubTime < this.scrubThrottleMs) return;
    
    this.lastScrubTime = now;
    await this.init();
    if (!this.synth) return;
    this.synth.triggerAttackRelease('C5', '0.01');
  }

  async playLifeEventDrop(isPositive: boolean) {
    await this.init();
    if (!this.synth) return;
    
    if (isPositive) {
      // Upward arpeggio for positive events
      this.synth.triggerAttackRelease('C4', '0.1', Tone.now());
      this.synth.triggerAttackRelease('E4', '0.1', Tone.now() + 0.1);
      this.synth.triggerAttackRelease('G4', '0.1', Tone.now() + 0.2);
    } else {
      // Downward sound for negative events
      this.synth.triggerAttackRelease('G4', '0.1', Tone.now());
      this.synth.triggerAttackRelease('D4', '0.1', Tone.now() + 0.1);
    }
  }

  async playMilestone() {
    await this.init();
    if (!this.synth) return;
    
    // Celebration sound
    this.synth.triggerAttackRelease('C5', '0.1', Tone.now());
    this.synth.triggerAttackRelease('E5', '0.1', Tone.now() + 0.1);
    this.synth.triggerAttackRelease('G5', '0.1', Tone.now() + 0.2);
    this.synth.triggerAttackRelease('C6', '0.2', Tone.now() + 0.3);
  }

  async playStateChange() {
    await this.init();
    if (!this.synth) return;
    this.synth.triggerAttackRelease('A4', '0.15');
  }
}

export const digitalTwinSounds = new DigitalTwinSounds();
