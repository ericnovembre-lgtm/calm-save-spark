import { useEffect, useRef } from 'react';
import { createNoise2D } from 'simplex-noise';

interface GenerativeBackgroundProps {
  mood?: 'calm' | 'energetic' | 'stressed';
  balanceChange?: number;
}

export function GenerativeBackground({ mood = 'calm', balanceChange = 0 }: GenerativeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const noise2D = createNoise2D();
    let frame = 0;

    // Mood-based colors
    const moodColors = {
      calm: ['#3b82f6', '#8b5cf6', '#6366f1'],
      energetic: ['#10b981', '#059669', '#14b8a6'],
      stressed: ['#ef4444', '#f59e0b', '#f97316']
    };

    const colors = moodColors[mood];
    const speed = mood === 'energetic' ? 0.003 : mood === 'stressed' ? 0.005 : 0.001;

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = frame * speed;

      // Generate organic patterns using Perlin noise
      for (let x = 0; x < canvas.width; x += 40) {
        for (let y = 0; y < canvas.height; y += 40) {
          const noiseValue = noise2D(x * 0.005 + time, y * 0.005 + time);
          const normalizedNoise = (noiseValue + 1) / 2;

          const colorIndex = Math.floor(normalizedNoise * colors.length);
          const color = colors[colorIndex];
          const opacity = 0.1 + normalizedNoise * 0.2;

          ctx.fillStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.fillRect(x, y, 40, 40);
        }
      }

      // Add balance change indicator
      if (balanceChange !== 0) {
        const pulseOpacity = Math.abs(Math.sin(frame * 0.05)) * 0.3;
        ctx.fillStyle = balanceChange > 0 
          ? `rgba(16, 185, 129, ${pulseOpacity})` 
          : `rgba(239, 68, 68, ${pulseOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      frame++;
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mood, balanceChange]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.15, mixBlendMode: 'screen' }}
    />
  );
}
