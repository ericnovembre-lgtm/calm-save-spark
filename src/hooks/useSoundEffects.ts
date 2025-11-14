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

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Play coin drop sound for savings actions
   */
  const playCoinSound = useCallback(() => {
    if (!preferences.enabled || !preferences.savingsSound) return;

    const audioContext = getAudioContext();
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
  }, [preferences, getAudioContext]);

  /**
   * Play success chime for achievements
   */
  const playAchievementSound = useCallback(() => {
    if (!preferences.enabled || !preferences.achievementSound) return;

    const audioContext = getAudioContext();
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
  }, [preferences, getAudioContext]);

  /**
   * Play subtle interaction sound
   */
  const playClickSound = useCallback(() => {
    if (!preferences.enabled) return;

    const audioContext = getAudioContext();
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
  }, [preferences, getAudioContext]);

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
  };
};
