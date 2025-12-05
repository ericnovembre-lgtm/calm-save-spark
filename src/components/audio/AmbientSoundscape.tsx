import { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface AmbientSoundscapeProps {
  /** Auto-start if preference enabled (default: false) */
  autoStart?: boolean;
  /** Initial volume 0-1 (default: 0.1) */
  initialVolume?: number;
  /** Show controls (default: true) */
  showControls?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Ambient soundscape component for background audio
 * Creates a calming financial environment with subtle tones
 */
export function AmbientSoundscape({
  autoStart = false,
  initialVolume = 0.1,
  showControls = true,
  className,
}: AmbientSoundscapeProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;

    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = context;

    // Create master gain node
    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0, context.currentTime);
    gainNode.connect(context.destination);
    gainNodeRef.current = gainNode;

    return context;
  }, []);

  // Create ambient tones
  const createAmbientTones = useCallback(() => {
    const context = audioContextRef.current;
    const gainNode = gainNodeRef.current;
    if (!context || !gainNode) return;

    // Clear existing oscillators
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignore errors from already stopped oscillators
      }
    });
    oscillatorsRef.current = [];

    // Calm ambient frequencies (based on 432Hz tuning for relaxation)
    const frequencies = [
      { freq: 108, type: 'sine' as OscillatorType, gain: 0.3 },   // Sub bass
      { freq: 216, type: 'sine' as OscillatorType, gain: 0.2 },   // Bass
      { freq: 324, type: 'sine' as OscillatorType, gain: 0.15 },  // Low mid
      { freq: 432, type: 'sine' as OscillatorType, gain: 0.1 },   // A4 (432Hz)
    ];

    frequencies.forEach(({ freq, type, gain }) => {
      const osc = context.createOscillator();
      const oscGain = context.createGain();
      
      osc.frequency.value = freq;
      osc.type = type;
      oscGain.gain.value = gain;
      
      // Add subtle LFO modulation for organic feel
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      
      lfo.frequency.value = 0.05 + Math.random() * 0.1; // Very slow modulation
      lfoGain.gain.value = freq * 0.02; // Slight pitch variation
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start();
      
      oscillatorsRef.current.push(osc);
    });
  }, []);

  // Start playback
  const start = useCallback(async () => {
    const context = initAudio();
    
    // Resume context if suspended (browser autoplay policy)
    if (context.state === 'suspended') {
      await context.resume();
    }
    
    createAmbientTones();
    
    // Fade in
    const gainNode = gainNodeRef.current;
    if (gainNode) {
      gainNode.gain.cancelScheduledValues(context.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 2);
    }
    
    setIsPlaying(true);
    
    // Save preference
    localStorage.setItem('ambientSoundEnabled', 'true');
  }, [initAudio, createAmbientTones, volume]);

  // Stop playback
  const stop = useCallback(() => {
    const context = audioContextRef.current;
    const gainNode = gainNodeRef.current;
    
    if (context && gainNode) {
      // Fade out
      gainNode.gain.cancelScheduledValues(context.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 1);
      
      // Stop oscillators after fade
      setTimeout(() => {
        oscillatorsRef.current.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (e) {
            // Ignore
          }
        });
        oscillatorsRef.current = [];
      }, 1000);
    }
    
    setIsPlaying(false);
    localStorage.setItem('ambientSoundEnabled', 'false');
  }, []);

  // Toggle playback
  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  // Update volume
  const handleVolumeChange = useCallback((values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    
    const gainNode = gainNodeRef.current;
    const context = audioContextRef.current;
    
    if (gainNode && context && isPlaying) {
      gainNode.gain.cancelScheduledValues(context.currentTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(newVolume, context.currentTime + 0.1);
    }
  }, [isPlaying]);

  // Handle visibility change (pause on tab blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const gainNode = gainNodeRef.current;
      const context = audioContextRef.current;
      
      if (!gainNode || !context || !isPlaying) return;
      
      if (document.hidden) {
        // Mute when tab is hidden
        gainNode.gain.setValueAtTime(0, context.currentTime);
      } else {
        // Restore volume when tab is visible
        gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.5);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, volume]);

  // Auto-start if enabled
  useEffect(() => {
    const savedPreference = localStorage.getItem('ambientSoundEnabled');
    if (autoStart && savedPreference === 'true') {
      // Delay to ensure user interaction has occurred
      const timer = setTimeout(() => {
        start();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      oscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          // Ignore
        }
      });
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!showControls) return null;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="h-8 w-8"
        aria-label={isPlaying ? 'Mute ambient sound' : 'Play ambient sound'}
      >
        {isPlaying ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
      
      {isPlaying && (
        <Slider
          value={[volume]}
          onValueChange={handleVolumeChange}
          min={0}
          max={0.3}
          step={0.01}
          className="w-20"
          aria-label="Ambient volume"
        />
      )}
    </div>
  );
}
