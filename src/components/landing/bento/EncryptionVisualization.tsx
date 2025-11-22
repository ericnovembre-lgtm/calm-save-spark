import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Lock, Unlock } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  encrypted: boolean;
}

export const EncryptionVisualization = () => {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLocked, setIsLocked] = useState(true);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  // Binary matrix effect
  const binaryChars = '01';
  const [binaryColumns, setBinaryColumns] = useState<string[]>([]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Initialize binary columns
    const columns = Array.from({ length: 20 }, () => {
      const length = Math.floor(Math.random() * 10) + 5;
      return Array.from({ length }, () => 
        binaryChars[Math.floor(Math.random() * binaryChars.length)]
      ).join('');
    });
    setBinaryColumns(columns);

    // Update binary every 2 seconds
    const binaryInterval = setInterval(() => {
      setBinaryColumns(prev => prev.map(() => {
        const length = Math.floor(Math.random() * 10) + 5;
        return Array.from({ length }, () => 
          binaryChars[Math.floor(Math.random() * binaryChars.length)]
        ).join('');
      }));
    }, 2000);

    return () => clearInterval(binaryInterval);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      encrypted: Math.random() > 0.5,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.encrypted 
          ? 'rgba(34, 197, 94, 0.6)' // green-500
          : 'rgba(34, 197, 94, 0.2)';
        ctx.fill();

        // Draw connections
        particlesRef.current.forEach(other => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [prefersReducedMotion]);

  // Toggle lock state every 4 seconds
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIsLocked(prev => !prev);
    }, 4000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <Lock className="w-32 h-32 text-green-500 opacity-20" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Canvas for particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Binary matrix overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="flex gap-4 h-full">
          {binaryColumns.map((column, i) => (
            <motion.div
              key={i}
              className="flex flex-col text-green-500 text-xs font-mono whitespace-pre"
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.1,
              }}
            >
              {column.split('').map((char, j) => (
                <span key={j}>{char}</span>
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Central lock/unlock animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          key={isLocked ? 'locked' : 'unlocked'}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {isLocked ? (
            <Lock className="w-24 h-24 text-green-500" strokeWidth={1.5} />
          ) : (
            <Unlock className="w-24 h-24 text-green-500" strokeWidth={1.5} />
          )}
        </motion.div>

        {/* Pulsing ring effect */}
        <motion.div
          className="absolute w-32 h-32 rounded-full border-2 border-green-500"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Encryption data flow labels */}
      <motion.div
        className="absolute top-4 left-4 text-xs font-mono text-green-500 bg-background/80 px-2 py-1 rounded backdrop-blur-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        AES-256
      </motion.div>

      <motion.div
        className="absolute bottom-4 right-4 text-xs font-mono text-green-500 bg-background/80 px-2 py-1 rounded backdrop-blur-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      >
        TLS 1.3
      </motion.div>

      <motion.div
        className="absolute top-4 right-4 text-xs font-mono text-green-500 bg-background/80 px-2 py-1 rounded backdrop-blur-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        SHA-512
      </motion.div>
    </div>
  );
};
