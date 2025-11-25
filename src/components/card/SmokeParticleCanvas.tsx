import { useEffect, useRef } from 'react';

interface SmokeParticle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  velocity: { x: number; y: number };
  life: number;
  maxLife: number;
}

interface SmokeParticleCanvasProps {
  laserX: number;
  laserY: number;
  isEngraving: boolean;
}

export function SmokeParticleCanvas({ laserX, laserY, isEngraving }: SmokeParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SmokeParticle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new particles while engraving
      if (isEngraving && Math.random() > 0.3) {
        for (let i = 0; i < 2; i++) {
          particlesRef.current.push({
            x: laserX,
            y: laserY,
            radius: Math.random() * 3 + 2,
            opacity: 0.6,
            velocity: {
              x: (Math.random() - 0.5) * 0.5,
              y: -Math.random() * 1.5 - 0.5,
            },
            life: 0,
            maxLife: Math.random() * 400 + 400,
          });
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.life += 16;
        particle.opacity = Math.max(0, 0.6 * (1 - particle.life / particle.maxLife));
        particle.radius += 0.05;

        if (particle.opacity > 0) {
          ctx.save();
          ctx.filter = 'blur(4px)';
          ctx.fillStyle = `rgba(200, 200, 200, ${particle.opacity})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          return true;
        }
        return false;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [laserX, laserY, isEngraving]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
