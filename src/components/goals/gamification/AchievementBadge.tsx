import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star } from 'lucide-react';
import { audioManager } from '@/lib/audio-manager';
import { haptics } from '@/lib/haptics';
import { useEffect } from 'react';

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  show: boolean;
  onDismiss?: () => void;
}

/**
 * 3D flip reveal animation for achievement unlocks
 */
export const AchievementBadge = ({
  name,
  description,
  icon,
  rarity = 'common',
  show,
  onDismiss
}: AchievementBadgeProps) => {
  const rarityColors = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-amber-500 to-amber-600',
    epic: 'from-yellow-500 to-yellow-600',
    legendary: 'from-yellow-500 to-yellow-600'
  };

  useEffect(() => {
    if (show) {
      audioManager.playAchievementUnlock();
      haptics.vibrate('heavy');
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          {/* Confetti background */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                left: '50%',
                top: '50%'
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0.5],
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                delay: i * 0.03
              }}
            />
          ))}

          {/* Badge card */}
          <motion.div
            className="relative"
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            exit={{ scale: 0, rotateY: 180 }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300
            }}
          >
            <div className={`
              p-8 rounded-3xl
              bg-gradient-to-br ${rarityColors[rarity]}
              text-white shadow-2xl
              max-w-md
            `}>
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Award className="w-12 h-12" />
                </motion.div>
              </div>

              {/* Text */}
              <div className="text-center space-y-2">
                <motion.h3
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Achievement Unlocked!
                </motion.h3>
                
                <motion.p
                  className="text-xl font-semibold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {name}
                </motion.p>
                
                <motion.p
                  className="text-white/80"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {description}
                </motion.p>
              </div>

              {/* Rarity indicator */}
              <motion.div
                className="flex items-center justify-center gap-1 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[...Array(rarity === 'legendary' ? 5 : rarity === 'epic' ? 4 : rarity === 'rare' ? 3 : 2)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </motion.div>
            </div>

            {/* Glow effect */}
            <div className="
              absolute inset-0 rounded-3xl
              bg-gradient-to-br from-white/20 to-transparent
              blur-xl -z-10
            " />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
