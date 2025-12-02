import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { createNoise2D } from 'simplex-noise';

export function ProceduralHubBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seed] = useState(Math.random());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const noise = createNoise2D();
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    const draw = () => {
      ctx.fillStyle = 'hsl(var(--background))';
      ctx.fillRect(0, 0, width, height);

      // Generate procedural art
      for (let x = 0; x < width; x += 8) {
        for (let y = 0; y < height; y += 8) {
          const value = noise(x * 0.005 + seed, y * 0.005 + seed);
          const hue = (value + 1) * 180;
          const alpha = Math.abs(value) * 0.1;
          
          ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
          ctx.fillRect(x, y, 8, 8);
        }
      }
    };

    // Defer heavy computation to avoid blocking initial render
    const timeoutId = setTimeout(draw, 100);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [seed]);

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15 }}
      transition={{ duration: 2 }}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
