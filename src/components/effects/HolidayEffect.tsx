import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getHoliday, type Holiday } from '@/lib/holidays';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
}

export function HolidayEffect() {
  const [holiday, setHoliday] = useState<Holiday | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const detected = getHoliday();
    setHoliday(detected);

    // Check if already dismissed today
    const today = new Date().toDateString();
    const dismissedDate = localStorage.getItem('holiday-effect-dismissed');
    if (dismissedDate === today) {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (!holiday || dismissed || prefersReducedMotion) return;

    // Generate particles
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 50,
      size: Math.random() * 20 + 10,
      rotation: Math.random() * 360,
      color: holiday.colors[Math.floor(Math.random() * holiday.colors.length)]
    }));

    setParticles(newParticles);
  }, [holiday, dismissed, prefersReducedMotion]);

  const handleDismiss = () => {
    setDismissed(true);
    const today = new Date().toDateString();
    localStorage.setItem('holiday-effect-dismissed', today);
  };

  const getParticleShape = (type: Holiday['particles']) => {
    switch (type) {
      case 'hearts':
        return '❤️';
      case 'snowflakes':
        return '❄️';
      case 'fireworks':
        return '✨';
      case 'leaves':
        return '🍂';
      case 'pi':
        return 'π';
      case 'ghosts':
        return '👻';
      case 'cake':
        return '🎂';
      default:
        return '✨';
    }
  };

  if (!holiday || dismissed || prefersReducedMotion) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
        {/* Holiday Banner */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto"
        >
          <div className="flex items-center gap-3 px-6 py-3 bg-background/90 backdrop-blur-sm rounded-full border border-border shadow-lg">
            <span className="text-2xl">{holiday.icon}</span>
            <span className="text-sm font-medium">Happy {holiday.name}!</span>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              aria-label={`Dismiss ${holiday.name} effects`}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>

        {/* Falling Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              opacity: 1,
              rotate: particle.rotation
            }}
            animate={{
              y: '110vh',
              opacity: [1, 1, 0],
              rotate: particle.rotation + 360
            }}
            transition={{
              duration: Math.random() * 3 + 5,
              delay: Math.random() * 2,
              ease: 'linear',
              repeat: Infinity
            }}
            className="absolute"
            style={{
              fontSize: `${particle.size}px`,
              color: particle.color
            }}
          >
            {getParticleShape(holiday.particles)}
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
