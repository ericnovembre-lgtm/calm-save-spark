import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  audioData?: Uint8Array;
  isActive: boolean;
  state: 'idle' | 'listening' | 'speaking';
}

export function WaveformVisualizer({ audioData, isActive, state }: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(12).fill(20));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(12).fill(20));
      return;
    }

    if (audioData && audioData.length > 0) {
      // Sample the audio data to get 12 bars
      const step = Math.floor(audioData.length / 12);
      const newBars = Array.from({ length: 12 }, (_, i) => {
        const value = audioData[i * step] || 0;
        return Math.max(20, (value / 255) * 100);
      });
      setBars(newBars);
    } else if (state === 'speaking') {
      // Animate bars randomly when AI is speaking
      const interval = setInterval(() => {
        setBars(Array.from({ length: 12 }, () => 
          Math.random() * 60 + 20
        ));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [audioData, isActive, state]);

  return (
    <div className="flex items-end justify-center gap-1 h-16">
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className={`w-2 rounded-full ${
            state === 'listening' 
              ? 'bg-primary' 
              : state === 'speaking'
              ? 'bg-accent'
              : 'bg-muted'
          }`}
          initial={{ height: '20%' }}
          animate={{ 
            height: `${height}%`,
            opacity: isActive ? 1 : 0.3
          }}
          transition={{
            duration: 0.15,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}
