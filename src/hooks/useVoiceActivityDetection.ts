import { useEffect, useRef, useState } from 'react';

interface UseVADOptions {
  enabled: boolean;
  silenceThreshold?: number; // Volume threshold (0-1)
  silenceDuration?: number; // Milliseconds of silence before triggering
  onSilenceDetected?: () => void;
}

export function useVoiceActivityDetection({
  enabled,
  silenceThreshold = 0.01,
  silenceDuration = 1500,
  onSilenceDetected
}: UseVADOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastVolumeRef = useRef<number>(0);

  const processAudioData = (audioData: Uint8Array) => {
    if (!enabled) return;

    // Calculate average volume
    const average = audioData.reduce((sum, value) => sum + value, 0) / audioData.length;
    const normalizedVolume = average / 255;
    lastVolumeRef.current = normalizedVolume;

    if (normalizedVolume > silenceThreshold) {
      // User is speaking
      setIsSpeaking(true);
      
      // Clear any existing silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } else if (isSpeaking) {
      // User might be silent, start/continue timer
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          setIsSpeaking(false);
          onSilenceDetected?.();
          silenceTimerRef.current = null;
        }, silenceDuration);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  const reset = () => {
    setIsSpeaking(false);
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  return {
    isSpeaking,
    processAudioData,
    reset,
    currentVolume: lastVolumeRef.current
  };
}
