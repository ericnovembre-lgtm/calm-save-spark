import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const loadingMessages = [
  "Calculating optimal savings path...",
  "Analyzing your financial goals...",
  "Optimizing your strategy...",
  "Preparing your dashboard...",
  "Almost there..."
];

/**
 * Animated loading state with rotating messages
 */
export const AnimatedLoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      {/* Animated loader */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Loader2 className="w-12 h-12 text-primary" />
      </motion.div>

      {/* Rotating messages */}
      <motion.div
        key={Math.random()}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-lg text-muted-foreground">
          {loadingMessages[Math.floor(Math.random() * loadingMessages.length)]}
        </p>
      </motion.div>

      {/* Pulse dots */}
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
};
