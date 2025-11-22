import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FluidProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

/**
 * Advanced circular progress with liquid fill animation
 * Uses Canvas for fluid wave effects and particles
 */
export const FluidProgressRing = ({
  progress,
  size = 160,
  strokeWidth = 12
}: FluidProgressRingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const prefersReducedMotion = useReducedMotion();

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (prefersReducedMotion || progress < 75) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const drawLiquidFill = () => {
      ctx.clearRect(0, 0, size, size);

      // Calculate fill height based on progress
      const fillHeight = (progress / 100) * size;
      const waveY = size - fillHeight;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, size, 0, 0);
      gradient.addColorStop(0, 'hsla(var(--primary) / 0.2)');
      gradient.addColorStop(1, 'hsla(var(--primary) / 0.4)');

      ctx.fillStyle = gradient;

      // Draw wave with sine function
      ctx.beginPath();
      ctx.moveTo(0, size);

      const amplitude = 5;
      const frequency = 0.02;
      const phase = time * 0.002;

      for (let x = 0; x <= size; x++) {
        const y = waveY + Math.sin(x * frequency + phase) * amplitude;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(size, size);
      ctx.closePath();
      ctx.fill();

      // Draw floating particles
      const particleCount = 5;
      for (let i = 0; i < particleCount; i++) {
        const particlePhase = phase + i * 0.5;
        const px = (i / particleCount) * size + Math.sin(particlePhase) * 20;
        const py = waveY + Math.cos(particlePhase * 0.8) * 30 - 20;

        ctx.fillStyle = 'hsla(var(--primary) / 0.5)';
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      time += 16;
      animationRef.current = requestAnimationFrame(drawLiquidFill);
    };

    drawLiquidFill();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [progress, size, prefersReducedMotion]);

  // Color based on progress
  const getStrokeColor = () => {
    if (progress < 25) return 'hsl(var(--primary) / 0.5)';
    if (progress < 50) return 'hsl(var(--primary) / 0.7)';
    if (progress < 75) return 'hsl(var(--primary))';
    return 'hsl(45 93% 60%)'; // Gold for high progress
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* SVG Progress Ring */}
      <svg width={size} height={size} className="absolute inset-0">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>

      {/* Canvas for liquid fill (only when progress >= 75%) */}
      {progress >= 75 && !prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="absolute inset-0 rounded-full overflow-hidden opacity-60"
          style={{ clipPath: `circle(${radius}px at center)` }}
        />
      )}

      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {progress.toFixed(0)}%
        </motion.span>
      </div>

      {/* Glow effect for high progress */}
      {progress >= 90 && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
            filter: 'blur(20px)',
            pointerEvents: 'none'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
    </div>
  );
};
