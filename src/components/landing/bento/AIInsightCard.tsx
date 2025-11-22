import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Brain, TrendingUp } from 'lucide-react';

export const AIInsightCard = () => {
  const prefersReducedMotion = useReducedMotion();
  const [showNotification, setShowNotification] = useState(false);

  return (
    <motion.div
      className="h-full p-8 rounded-3xl bg-gradient-to-br from-accent/20 via-primary/10 to-accent/20 border border-accent/30 backdrop-blur-xl relative overflow-hidden"
      onHoverStart={() => !prefersReducedMotion && setShowNotification(true)}
      onHoverEnd={() => setShowNotification(false)}
      whileHover={prefersReducedMotion ? {} : {
        boxShadow: '0 20px 40px -10px hsl(var(--accent) / 0.3)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start gap-4 mb-6">
          <motion.div
            className="p-3 rounded-2xl bg-accent/20 text-accent"
            animate={prefersReducedMotion ? {} : {
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Brain className="w-10 h-10" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">AI-Powered Insights</h3>
            <p className="text-muted-foreground mt-2">
              Get personalized financial advice from 6 specialized AI agents
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="text-6xl font-extrabold text-accent mb-2"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
            >
              6
            </motion.div>
            <div className="text-lg text-muted-foreground">Specialized AI Agents</div>
          </motion.div>
        </div>

        {/* Animated Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-8 left-8 right-8 p-4 rounded-2xl bg-card border border-accent/30 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground mb-1">💡 AI Insight</div>
                  <div className="text-sm text-muted-foreground">
                    You're spending 23% more on food this month. Consider meal prepping to save $120.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
