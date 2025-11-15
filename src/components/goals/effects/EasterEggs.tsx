import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Sparkles } from 'lucide-react';

/**
 * Easter eggs for delightful surprises
 * - Konami code → money rain
 * - Device shake → goal shuffle
 */
export const EasterEggs = () => {
  const [moneyRain, setMoneyRain] = useState(false);
  const [konamiProgress, setKonamiProgress] = useState(0);
  
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];

  useEffect(() => {
    // Konami code listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiProgress]) {
        const newProgress = konamiProgress + 1;
        setKonamiProgress(newProgress);
        
        if (newProgress === konamiCode.length) {
          setMoneyRain(true);
          setKonamiProgress(0);
          
          setTimeout(() => setMoneyRain(false), 5000);
        }
      } else {
        setKonamiProgress(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiProgress]);

  // Device shake detection
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      const acceleration = e.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x = 0, y = 0, z = 0 } = acceleration;
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if (deltaX + deltaY + deltaZ > 50) {
        // Shuffle detected - emit custom event
        window.dispatchEvent(new CustomEvent('goalShuffle'));
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  return (
    <AnimatePresence>
      {moneyRain && (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -50,
                rotate: Math.random() * 360,
                scale: 0.5 + Math.random() * 0.5,
              }}
              animate={{
                y: window.innerHeight + 50,
                rotate: 360 + Math.random() * 720,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 2,
                ease: 'linear',
              }}
              className="absolute"
            >
              {i % 3 === 0 ? (
                <DollarSign className="w-8 h-8 text-green-500" />
              ) : (
                <Sparkles className="w-6 h-6 text-yellow-500" />
              )}
            </motion.div>
          ))}
          
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-background/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-center">
              <h2 className="text-4xl font-bold mb-2">🎉 Konami Code!</h2>
              <p className="text-xl text-muted-foreground">
                May your savings multiply!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
