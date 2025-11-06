import { useCallback, useRef } from 'react';

/**
 * Hook to play celebration sound effects using Web Audio API
 */
export const useCelebrationSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Play a success chime sound (ascending notes)
   */
  const playSuccessChime = useCallback(() => {
    const audioContext = getAudioContext();
    const now = audioContext.currentTime;

    // Create a series of ascending notes for success chime
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = now + (index * 0.15);
      const duration = 0.3;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }, [getAudioContext]);

  /**
   * Play a confetti pop sound (burst effect)
   */
  const playConfettiPop = useCallback(() => {
    const audioContext = getAudioContext();
    const now = audioContext.currentTime;

    // Create white noise burst for pop effect
    const bufferSize = audioContext.sampleRate * 0.1; // 100ms
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // High-pass filter for pop sound
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    // Quick attack and decay
    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    source.start(now);
    source.stop(now + 0.1);
  }, [getAudioContext]);

  return {
    playSuccessChime,
    playConfettiPop,
  };
};
