import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CardParticleEffectsProps {
  trigger: 'seal-break' | 'celebration' | null;
  onComplete?: () => void;
}

export function CardParticleEffects({ trigger, onComplete }: CardParticleEffectsProps) {
  useEffect(() => {
    if (!trigger) return;

    if (trigger === 'seal-break') {
      // Small gold burst when seal breaks
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#B38728', '#FCF6BA', '#D4AF37', '#FFD700'],
        ticks: 200,
        gravity: 1.2,
        scalar: 0.8,
      });

      setTimeout(() => onComplete?.(), 400);
    } else if (trigger === 'celebration') {
      // Main celebration confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#EB001B', '#F79E1B', '#FFFFFF', '#FFD700'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#EB001B', '#F79E1B', '#FFFFFF', '#FFD700'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        } else {
          onComplete?.();
        }
      };

      frame();
    }
  }, [trigger, onComplete]);

  if (trigger === 'seal-break') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Sparkle particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: '50%',
              top: '40%',
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              x: (Math.cos((i * Math.PI * 2) / 12) * 100),
              y: (Math.sin((i * Math.PI * 2) / 12) * 100),
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    );
  }

  if (trigger === 'celebration') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Light rays */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 w-1 h-[200%] origin-top"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(255,215,0,0.3) 20%, transparent 100%)',
              rotate: (i * 45),
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: [0, 0.8, 0] }}
            transition={{
              duration: 1.5,
              delay: i * 0.1,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}
