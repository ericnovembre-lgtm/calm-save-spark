import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface GoalPreviewCardProps {
  name: string;
  targetAmount: number;
  timeline: string;
  backgroundImage: string;
  progress: number;
  isLoading?: boolean;
}

export const GoalPreviewCard = ({
  name,
  targetAmount,
  timeline,
  backgroundImage,
  progress,
  isLoading,
}: GoalPreviewCardProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={name}
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95, rotateY: -10 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.95, rotateY: 10 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl overflow-hidden shadow-xl"
        style={{ background: backgroundImage }}
      >
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        
        {/* Content */}
        <div className="relative p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
                <p className="text-sm text-white/80">{timeline}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-white/80">Target</span>
                  <motion.span
                    initial={prefersReducedMotion ? {} : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                    className="text-3xl font-bold text-white"
                  >
                    ${targetAmount.toLocaleString()}
                  </motion.span>
                </div>
                
                <Progress value={progress} className="h-2 bg-white/20" />
                
                <div className="flex justify-between text-xs text-white/70">
                  <span>${(targetAmount * progress / 100).toFixed(0)} saved</span>
                  <span>{progress}%</span>
                </div>
              </div>
              
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                className="w-full py-3 bg-white text-foreground rounded-xl font-semibold text-sm shadow-lg"
              >
                Start Saving
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
