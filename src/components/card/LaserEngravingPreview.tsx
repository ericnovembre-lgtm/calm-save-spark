import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhysicalCreditCard } from './PhysicalCreditCard';
import { SmokeParticleCanvas } from './SmokeParticleCanvas';
import { haptics } from '@/lib/haptics';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CardVariant = 'matte-black' | 'matte-white' | 'metallic-gold' | 'metallic-silver';

interface LaserEngravingPreviewProps {
  name: string;
  cardVariant: CardVariant;
  onComplete?: () => void;
  onClose: () => void;
  autoStart?: boolean;
}

type CharState = 'pending' | 'engraving' | 'complete';

export function LaserEngravingPreview({
  name,
  cardVariant,
  onComplete,
  onClose,
  autoStart = true
}: LaserEngravingPreviewProps) {
  const [currentCharIndex, setCurrentCharIndex] = useState(-1);
  const [charStates, setCharStates] = useState<CharState[]>(
    Array(name.length).fill('pending')
  );
  const [isComplete, setIsComplete] = useState(false);
  const [laserPosition, setLaserPosition] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  const CHAR_DURATION = prefersReducedMotion ? 0 : 120;

  useEffect(() => {
    if (!autoStart) return;

    const startDelay = setTimeout(() => {
      engraveNextCharacter(0);
    }, 500);

    return () => clearTimeout(startDelay);
  }, [autoStart]);

  const engraveNextCharacter = (index: number) => {
    if (index >= name.length) {
      // Engraving complete
      haptics.pattern('success');
      setIsComplete(true);
      setTimeout(() => {
        onComplete?.();
      }, 1500);
      return;
    }

    setCurrentCharIndex(index);
    
    // Update character state to engraving
    setCharStates(prev => {
      const newStates = [...prev];
      newStates[index] = 'engraving';
      return newStates;
    });

    // Haptic feedback for each character
    haptics.vibrate('light');

    // Calculate laser position (approximate based on character index)
    const baseX = 150 + index * 25;
    const baseY = 200;
    setLaserPosition({ x: baseX, y: baseY });

    // Complete character engraving
    setTimeout(() => {
      setCharStates(prev => {
        const newStates = [...prev];
        newStates[index] = 'complete';
        return newStates;
      });

      // Move to next character
      setTimeout(() => {
        engraveNextCharacter(index + 1);
      }, CHAR_DURATION);
    }, CHAR_DURATION);
  };

  const getCharStyle = (state: CharState) => {
    switch (state) {
      case 'pending':
        return {
          opacity: 0,
          color: 'transparent',
        };
      case 'engraving':
        return {
          opacity: 1,
          color: '#ff4500',
          textShadow: '0 0 10px #ff4500, 0 0 20px #ff6b35',
          filter: 'brightness(2)',
        };
      case 'complete':
        return {
          opacity: 1,
          color: cardVariant === 'metallic-gold' ? '#1a1a1a' : '#ffffff',
          textShadow: cardVariant === 'metallic-gold' 
            ? '1px 1px 2px rgba(0,0,0,0.3)' 
            : '1px 1px 2px rgba(255,255,255,0.3)',
        };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="relative max-w-2xl w-full">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl font-bold mb-2">Personalizing Your Card</h2>
            <p className="text-muted-foreground">
              Laser-engraving your name with precision
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            {/* Card with custom name overlay */}
            <div className="relative">
              <PhysicalCreditCard
                variant={cardVariant}
                cardNumber="•••• •••• •••• 1234"
                cardHolder=""
                expiryDate="12/28"
              />
              
              {/* Custom name engraving layer */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-4xl font-bold tracking-wider flex gap-2">
                  {name.split('').map((char, index) => (
                    <motion.span
                      key={index}
                      style={getCharStyle(charStates[index])}
                      transition={{ duration: 0.1 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Laser point */}
              {currentCharIndex >= 0 && currentCharIndex < name.length && !prefersReducedMotion && (
                <motion.div
                  className="absolute w-2 h-2 rounded-full pointer-events-none"
                  style={{
                    left: laserPosition.x,
                    top: laserPosition.y,
                    background: 'radial-gradient(circle, #ff4500 0%, #ff6b35 50%, transparent 70%)',
                    boxShadow: '0 0 20px #ff4500, 0 0 40px #ff6b35, 0 0 60px #ff8c00',
                    filter: 'blur(0.5px)',
                  }}
                  animate={{
                    opacity: [1, 0.5, 1],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                  }}
                />
              )}

              {/* Smoke particles */}
              {!prefersReducedMotion && (
                <SmokeParticleCanvas
                  laserX={laserPosition.x}
                  laserY={laserPosition.y}
                  isEngraving={currentCharIndex >= 0 && currentCharIndex < name.length}
                />
              )}

              {/* Completion flash */}
              {isComplete && !prefersReducedMotion && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0] }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-white/30 pointer-events-none rounded-2xl"
                />
              )}
            </div>
          </motion.div>

          {isComplete && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 text-center"
            >
              <p className="text-lg text-muted-foreground">
                Personalization complete! Your card is ready.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
