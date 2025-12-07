import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: 'coin' | 'star' | 'sparkle';
}

interface DynamicParticleSystemProps {
  intensity?: 'low' | 'medium' | 'high';
  enabled?: boolean;
}

export function DynamicParticleSystem({ intensity = 'medium', enabled = true }: DynamicParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();

  const particleCounts = {
    low: 20,
    medium: 40,
    high: 60
  };

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles
    const initialParticles: Particle[] = [];
    const count = particleCounts[intensity];

    for (let i = 0; i < count; i++) {
      initialParticles.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: ['#d6c8a2', '#f59e0b', '#10b981', '#e9dfce'][Math.floor(Math.random() * 4)],
        type: ['coin', 'star', 'sparkle'][Math.floor(Math.random() * 3)] as any
      });
    }

    setParticles(initialParticles);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setParticles(prevParticles => 
        prevParticles.map(p => {
          // Update position
          let newX = p.x + p.vx;
          let newY = p.y + p.vy;

          // Bounce off edges
          if (newX < 0 || newX > canvas.width) {
            p.vx *= -1;
            newX = Math.max(0, Math.min(canvas.width, newX));
          }
          if (newY < 0 || newY > canvas.height) {
            p.vy *= -1;
            newY = Math.max(0, Math.min(canvas.height, newY));
          }

          // Draw particle
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.6;
          
          if (p.type === 'coin') {
            ctx.beginPath();
            ctx.arc(newX, newY, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'star') {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
              const x = newX + Math.cos(angle) * p.size;
              const y = newY + Math.sin(angle) * p.size;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(newX - p.size / 2, newY - p.size / 2, p.size, p.size);
          }

          return { ...p, x: newX, y: newY };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  );
}
