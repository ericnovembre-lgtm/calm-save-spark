import { useCallback, useRef, useEffect, useState } from 'react';

interface SoundPreferences {
  enabled: boolean;
  volume: number; // 0-1
  savingsSound: boolean;
  achievementSound: boolean;
  ambientMusic: boolean;
}

const DEFAULT_PREFERENCES: SoundPreferences = {
  enabled: true,
  volume: 0.5,
  savingsSound: true,
  achievementSound: true,
  ambientMusic: false,
};

const STORAGE_KEY = 'sound-preferences';

/**
 * Hook to manage sound effects with user preferences
 */
export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [preferences, setPreferences] = useState<SoundPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading sound preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving sound preferences:', error);
    }
  }, [preferences]);

  /**
   * Play coin drop sound for savings actions
   */
  const playCoinSound = useCallback(() => {
    if (!preferences.enabled || !preferences.savingsSound) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    const now = audioContext.currentTime;

    // Create coin "clink" sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(preferences.volume * 0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }, [preferences]);

  /**
   * Play success chime for achievements
   */
  const playAchievementSound = useCallback(() => {
    if (!preferences.enabled || !preferences.achievementSound) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    const now = audioContext.currentTime;

    // Create ascending chord for achievement
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = now + (index * 0.1);
      const duration = 0.4;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(preferences.volume * 0.25, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }, [preferences]);

  /**
   * Play subtle interaction sound
   */
  const playClickSound = useCallback(() => {
    if (!preferences.enabled) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    const now = audioContext.currentTime;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1200;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(preferences.volume * 0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }, [preferences]);

  /**
   * Play goal completion sound
   */
  const playGoalCompleteSound = useCallback(() => {
    if (!preferences.enabled || !preferences.achievementSound) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    const now = audioContext.currentTime;

    // Triumphant fanfare
    const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'triangle';

      const startTime = now + (index * 0.08);
      const duration = 0.5;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(preferences.volume * 0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }, [preferences]);

  /**
   * Play ambient background music
   */
  const startAmbientMusic = useCallback(() => {
    if (!preferences.enabled || !preferences.ambientMusic) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    
    // Create a gentle ambient drone
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator1.connect(filter);
    oscillator2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Soft ambient frequencies
    oscillator1.frequency.value = 220; // A3
    oscillator2.frequency.value = 329.63; // E4
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';

    // Low-pass filter for warmth
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    // Very quiet volume for ambient
    gainNode.gain.setValueAtTime(preferences.volume * 0.05, audioContext.currentTime);

    oscillator1.start();
    oscillator2.start();

    // Store for cleanup
    return () => {
      oscillator1.stop();
      oscillator2.stop();
    };
  }, [preferences]);

  const updatePreference = <K extends keyof SoundPreferences>(
    key: K,
    value: SoundPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return {
    preferences,
    updatePreference,
    playCoinSound,
    playAchievementSound,
    playClickSound,
    playGoalCompleteSound,
    startAmbientMusic,
  };
};
