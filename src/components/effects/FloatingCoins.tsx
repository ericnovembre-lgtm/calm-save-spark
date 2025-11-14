import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FloatingCoinsProps {
  density?: 'low' | 'medium' | 'high';
  elements?: 'coins' | 'stars' | 'both';
  speed?: number;
}

interface FloatingElement {
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  type: 'coin' | 'star';
  opacity: number;
}

export function FloatingCoins({ 
  density = 'low',
  elements = 'coins',
  speed = 20
}: FloatingCoinsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const elementsRef = useRef<FloatingElement[]>([]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Determine number of elements
    const counts = { low: 8, medium: 12, high: 16 };
    const count = counts[density];

    // Initialize elements
    elementsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 15 + 8,
      speed: (Math.random() * 0.5 + 0.3) * (speed / 20),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      type: elements === 'both' 
        ? (Math.random() > 0.5 ? 'coin' : 'star')
        : elements === 'coins' ? 'coin' : 'star',
      opacity: Math.random() * 0.1 + 0.05
    }));

    let animationFrame: number;

    const drawCoin = (x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      // Coin circle
      ctx.fillStyle = 'hsl(var(--accent))';
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Inner circle
      ctx.strokeStyle = 'hsl(var(--foreground))';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
      ctx.stroke();

      // Dollar sign
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = `${size / 2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 0);

      ctx.restore();
    };

    const drawStar = (x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      ctx.fillStyle = 'hsl(var(--primary))';
      ctx.beginPath();
      
      const spikes = 5;
      const outerRadius = size / 2;
      const innerRadius = size / 4;

      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes;
        const pointX = Math.cos(angle) * radius;
        const pointY = Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(pointX, pointY);
        } else {
          ctx.lineTo(pointX, pointY);
        }
      }
      
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      elementsRef.current.forEach(element => {
        // Update position
        element.y -= element.speed;
        element.rotation += element.rotationSpeed;

        // Fade in/out at edges
        if (element.y < -element.size) {
          element.y = canvas.height + element.size;
          element.x = Math.random() * canvas.width;
        }

        // Draw element
        if (element.type === 'coin') {
          drawCoin(element.x, element.y, element.size, element.rotation, element.opacity);
        } else {
          drawStar(element.x, element.y, element.size, element.rotation, element.opacity);
        }
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [density, elements, speed, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}
