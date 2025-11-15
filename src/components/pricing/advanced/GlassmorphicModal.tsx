import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { X } from 'lucide-react';

interface GlassmorphicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

export default function GlassmorphicModal({
  open,
  onOpenChange,
  children,
  className = '',
}: GlassmorphicModalProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className={`
                relative max-w-2xl w-full max-h-[90vh] overflow-y-auto
                bg-background/95 backdrop-blur-xl
                border border-primary/20 rounded-2xl shadow-2xl
                ${className}
              `}
              initial={prefersReducedMotion ? {} : { 
                scale: 0.9, 
                opacity: 0,
                y: 50,
                rotateX: 10,
              }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: 0,
                rotateX: 0,
              }}
              exit={prefersReducedMotion ? {} : { 
                scale: 0.9, 
                opacity: 0,
                y: 50,
              }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 30 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
                onClick={() => onOpenChange(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Animated glow border */}
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-30 -z-10"
                  style={{
                    background: 'linear-gradient(45deg, hsl(var(--primary)), transparent, hsl(var(--primary)))',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              )}

              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
