import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AIAssistantAvatarProps {
  isThinking?: boolean;
  message?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onClick?: () => void;
}

export const AIAssistantAvatar = ({
  isThinking = false,
  message,
  position = 'bottom-right',
  onClick
}: AIAssistantAvatarProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full mb-4 right-0 max-w-[280px]"
          >
            <div className="relative p-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-primary/30 shadow-2xl">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground leading-relaxed">{message}</p>
              </div>
              {/* Speech bubble arrow */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card/95 border-r border-b border-primary/30 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative group"
        whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
          animate={prefersReducedMotion ? {} : {
            scale: isThinking ? [1, 1.3, 1] : 1,
            opacity: isThinking ? [0.3, 0.6, 0.3] : 0.3,
          }}
          transition={{
            duration: 2,
            repeat: isThinking ? Infinity : 0,
          }}
        />

        {/* Main avatar circle */}
        <motion.div
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl border-2 border-primary/50"
          animate={prefersReducedMotion ? {} : {
            rotate: isThinking ? 360 : 0,
          }}
          transition={{
            duration: 2,
            repeat: isThinking ? Infinity : 0,
            ease: 'linear',
          }}
        >
          {/* Inner content */}
          <motion.div
            animate={prefersReducedMotion ? {} : {
              scale: isThinking ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isThinking ? Infinity : 0,
            }}
          >
            <Bot className="w-8 h-8 text-primary-foreground" />
          </motion.div>

          {/* Thinking particles */}
          {isThinking && !prefersReducedMotion && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary-foreground"
                  animate={{
                    x: [0, Math.cos((i * 120 * Math.PI) / 180) * 30],
                    y: [0, Math.sin((i * 120 * Math.PI) / 180) * 30],
                    opacity: [1, 0],
                    scale: [1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* Sparkle indicator */}
        {(isHovered || isThinking) && !prefersReducedMotion && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 360] }}
            transition={{
              rotate: {
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};
