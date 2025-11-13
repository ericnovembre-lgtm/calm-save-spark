import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
}

interface ParticleEffectProps {
  trigger?: boolean;
  color?: string;
  particleCount?: number;
  duration?: number;
}

/**
 * ParticleEffect - Animated particle burst effect
 * Used for milestone celebrations and progress achievements
 */
export function ParticleEffect({ 
  trigger = false, 
  color = 'hsl(var(--primary))',
  particleCount = 20,
  duration = 2000 
}: ParticleEffectProps) {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!trigger || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to parent
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Create particles
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: centerX,
      y: centerY,
      size: Math.random() * 4 + 2,
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4 - 2, // Slight upward bias
      },
      life: duration,
      maxLife: duration,
    }));

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(particle => {
        // Update particle
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.velocity.y += 0.1; // Gravity
        particle.life -= 16; // Assuming 60fps

        // Calculate opacity based on life
        const opacity = particle.life / particle.maxLife;

        // Draw particle
        ctx.fillStyle = color.replace(')', `, ${opacity})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        return particle.life > 0;
      });

      if (particlesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [trigger, color, particleCount, duration, prefersReducedMotion]);

  if (prefersReducedMotion || !trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
