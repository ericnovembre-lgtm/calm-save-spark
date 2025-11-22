import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export function CoinParticleSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    const createParticle = (x: number, y: number) => {
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * -3 - 1,
        life: 100,
        maxLife: 100,
        size: Math.random() * 20 + 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      };
    };

    const handleClick = (e: MouseEvent) => {
      const particleCount = 5;
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle(e.clientX, e.clientY));
      }
    };

    canvas.addEventListener('click', handleClick);

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // gravity
        particle.rotation += particle.rotationSpeed;
        particle.life--;

        if (particle.life <= 0) return false;

        const opacity = particle.life / particle.maxLife;

        // Draw coin
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = opacity;

        // Coin body
        ctx.fillStyle = '#d4af37'; // gold color
        ctx.beginPath();
        ctx.ellipse(0, 0, particle.size, particle.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Coin highlight
        ctx.fillStyle = '#f4d03f';
        ctx.beginPath();
        ctx.ellipse(-particle.size * 0.2, -particle.size * 0.1, particle.size * 0.3, particle.size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dollar sign
        ctx.fillStyle = '#8b6914';
        ctx.font = `bold ${particle.size * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);

        ctx.restore();

        return true;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', setCanvasSize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasSize);
      canvas.removeEventListener('click', handleClick);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto z-20"
      style={{ cursor: 'pointer' }}
    />
  );
}
