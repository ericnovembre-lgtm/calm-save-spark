import * as Tone from 'tone';

/**
 * CoachSoundsManager - Sophisticated sound effects using Tone.js
 * Provides audio feedback for Coach interface interactions
 */
class CoachSoundsManager {
  private synth: Tone.PolySynth | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;

  constructor() {
    this.enabled = localStorage.getItem('coachSoundsEnabled') !== 'false';
  }

  private async initSynth() {
    if (!this.synth && this.enabled) {
      await Tone.start();
      this.synth = new Tone.PolySynth(Tone.Synth, {
        envelope: {
          attack: 0.005,
          decay: 0.1,
          sustain: 0.3,
          release: 0.5,
        },
      }).toDestination();
      this.synth.volume.value = -12; // Reduce volume
      this.initialized = true;
    }
    return this.synth;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('coachSoundsEnabled', enabled.toString());
  }

  /**
   * Scenario Completion - Ascending arpeggio (triumphant)
   */
  async playScenarioComplete() {
    if (!this.enabled) return;
    
    try {
      const synth = await this.initSynth();
      if (!synth) return;

      const now = Tone.now();
      synth.triggerAttackRelease("C4", "8n", now);
      synth.triggerAttackRelease("E4", "8n", now + 0.1);
      synth.triggerAttackRelease("G4", "8n", now + 0.2);
      synth.triggerAttackRelease("C5", "4n", now + 0.3);
    } catch (error) {
      console.warn('Failed to play scenario complete sound:', error);
    }
  }

  /**
   * Opportunity Executed - Triumphant chord
   */
  async playOpportunityExecuted() {
    if (!this.enabled) return;

    try {
      const synth = await this.initSynth();
      if (!synth) return;

      const now = Tone.now();
      synth.triggerAttackRelease(["C4", "E4", "G4", "C5"], "2n", now);
    } catch (error) {
      console.warn('Failed to play opportunity executed sound:', error);
    }
  }

  /**
   * State Change Warning - Two-note warning pattern
   */
  async playStateWarning() {
    if (!this.enabled) return;

    try {
      const synth = await this.initSynth();
      if (!synth) return;

      const now = Tone.now();
      synth.triggerAttackRelease("A4", "16n", now);
      synth.triggerAttackRelease("A4", "16n", now + 0.15);
    } catch (error) {
      console.warn('Failed to play state warning sound:', error);
    }
  }

  /**
   * State Change Critical - Urgent descending pattern
   */
  async playStateCritical() {
    if (!this.enabled) return;

    try {
      const synth = await this.initSynth();
      if (!synth) return;

      const now = Tone.now();
      synth.triggerAttackRelease("E4", "16n", now);
      synth.triggerAttackRelease("C4", "16n", now + 0.1);
      synth.triggerAttackRelease("A3", "8n", now + 0.2);
    } catch (error) {
      console.warn('Failed to play state critical sound:', error);
    }
  }

  /**
   * Radar Ping - Quick blip for opportunity detection
   */
  async playRadarPing() {
    if (!this.enabled) return;

    try {
      const synth = await this.initSynth();
      if (!synth) return;

      synth.triggerAttackRelease("G5", "32n", Tone.now());
    } catch (error) {
      console.warn('Failed to play radar ping sound:', error);
    }
  }

  /**
   * Quick Menu Open - Soft whoosh using noise
   */
  async playQuickMenuOpen() {
    if (!this.enabled) return;

    try {
      await Tone.start();

      const noise = new Tone.Noise("white").start();
      const filter = new Tone.Filter(800, "lowpass").toDestination();
      noise.connect(filter);
      noise.volume.value = -20;

      filter.frequency.rampTo(2000, 0.1);
      setTimeout(() => {
        noise.stop();
        noise.dispose();
        filter.dispose();
      }, 150);
    } catch (error) {
      console.warn('Failed to play quick menu open sound:', error);
    }
  }

  /**
   * Batch Execute - More triumphant progression
   */
  async playBatchExecute() {
    if (!this.enabled) return;

    try {
      const synth = await this.initSynth();
      if (!synth) return;

      const now = Tone.now();
      synth.triggerAttackRelease(["C4", "E4", "G4"], "8n", now);
      synth.triggerAttackRelease(["E4", "G4", "C5"], "8n", now + 0.15);
      synth.triggerAttackRelease(["G4", "C5", "E5"], "4n", now + 0.3);
    } catch (error) {
      console.warn('Failed to play batch execute sound:', error);
    }
  }

  /**
   * Filter Change - Subtle click
   */
  async playFilterChange() {
    if (!this.enabled) return;

    try {
      const synth = await this.initSynth();
      if (!synth) return;

      synth.triggerAttackRelease("C5", "32n", Tone.now());
    } catch (error) {
      console.warn('Failed to play filter change sound:', error);
    }
  }

  /**
   * Orb Expand - Whoosh sound
   */
  async playOrbExpand() {
    if (!this.enabled) return;

    try {
      await Tone.start();

      const noise = new Tone.Noise("pink").start();
      const filter = new Tone.Filter(400, "lowpass").toDestination();
      noise.connect(filter);
      noise.volume.value = -18;

      filter.frequency.rampTo(3000, 0.2);
      setTimeout(() => {
        noise.stop();
        noise.dispose();
        filter.dispose();
      }, 250);
    } catch (error) {
      console.warn('Failed to play orb expand sound:', error);
    }
  }

  /**
   * Dispose of all audio resources
   */
  dispose() {
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
      this.initialized = false;
    }
  }
}

export const coachSounds = new CoachSoundsManager();
