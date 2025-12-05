import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  audioData?: Uint8Array;
  isActive: boolean;
  state: 'idle' | 'listening' | 'speaking' | 'processing' | 'error';
  variant?: 'default' | 'compact';
  barCount?: number;
}

export function WaveformVisualizer({ 
  audioData, 
  isActive, 
  state,
  variant = 'default',
  barCount,
}: WaveformVisualizerProps) {
  const isCompact = variant === 'compact';
  const numBars = barCount ?? (isCompact ? 6 : 12);
  const [bars, setBars] = useState<number[]>(Array(numBars).fill(20));
  const [processingPhase, setProcessingPhase] = useState(0);

  // Processing animation
  useEffect(() => {
    if (state !== 'processing') return;
    
    const interval = setInterval(() => {
      setProcessingPhase(prev => (prev + 1) % numBars);
    }, 100);
    
    return () => clearInterval(interval);
  }, [state, numBars]);

  useEffect(() => {
    if (!isActive && state !== 'processing') {
      setBars(Array(numBars).fill(20));
      return;
    }

    if (audioData && audioData.length > 0 && state === 'listening') {
      // Sample the audio data to get bars
      const step = Math.floor(audioData.length / numBars);
      const newBars = Array.from({ length: numBars }, (_, i) => {
        const value = audioData[i * step] || 0;
        return Math.max(20, (value / 255) * 100);
      });
      setBars(newBars);
    } else if (state === 'speaking') {
      // Animate bars randomly when AI is speaking
      const interval = setInterval(() => {
        setBars(Array.from({ length: numBars }, () => 
          Math.random() * 60 + 20
        ));
      }, 100);
      return () => clearInterval(interval);
    } else if (state === 'processing') {
      // Wave animation for processing
      setBars(Array.from({ length: numBars }, (_, i) => {
        const distance = Math.abs(i - processingPhase);
        const wave = Math.max(0, 1 - distance * 0.3);
        return 20 + wave * 60;
      }));
    } else if (state === 'error') {
      // Brief flash for error
      setBars(Array(numBars).fill(80));
      const timeout = setTimeout(() => setBars(Array(numBars).fill(20)), 300);
      return () => clearTimeout(timeout);
    }
  }, [audioData, isActive, state, numBars, processingPhase]);

  const getBarColor = () => {
    switch (state) {
      case 'listening':
        return 'bg-primary';
      case 'speaking':
        return 'bg-accent';
      case 'processing':
        return 'bg-primary/70';
      case 'error':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const height = isCompact ? 'h-8' : 'h-16';
  const barWidth = isCompact ? 'w-1' : 'w-2';
  const gap = isCompact ? 'gap-0.5' : 'gap-1';

  return (
    <div 
      className={`flex items-end justify-center ${gap} ${height}`}
      role="img"
      aria-label={state === 'listening' ? 'Voice input active, speak now' : 'Voice visualizer'}
    >
      {bars.map((barHeight, index) => (
        <motion.div
          key={index}
          className={`${barWidth} rounded-full ${getBarColor()}`}
          initial={{ height: '20%' }}
          animate={{ 
            height: `${barHeight}%`,
            opacity: isActive || state === 'processing' ? 1 : 0.3
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
