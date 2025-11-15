import { motion } from 'framer-motion';
import { Target, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PersonalizedEmptyStateProps {
  userName?: string;
  onCreateGoal: () => void;
  className?: string;
}

/**
 * Delightful empty state with personalization and animations
 */
export const PersonalizedEmptyState = ({ 
  userName, 
  onCreateGoal,
  className = '' 
}: PersonalizedEmptyStateProps) => {
  const greetings = [
    `Ready to start saving, ${userName || 'friend'}?`,
    `Let's build your future, ${userName || 'friend'}!`,
    `Your journey begins here, ${userName || 'friend'}!`,
  ];

  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-center min-h-[400px] ${className}`}
    >
      <Card className="p-12 max-w-2xl text-center">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 20,
            delay: 0.2 
          }}
          className="inline-block mb-6"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Target className="w-12 h-12 text-primary" />
            </div>
            
            {/* Orbiting sparkles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <Sparkles className="absolute -top-2 left-1/2 w-4 h-4 text-yellow-500" />
              <TrendingUp className="absolute top-1/2 -right-2 w-4 h-4 text-green-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Greeting */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-3"
        >
          {randomGreeting}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-lg mb-8"
        >
          Every great achievement starts with a single goal.
          <br />
          Let's create your first one together.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            size="lg"
            onClick={onCreateGoal}
            className="group"
          >
            Create Your First Goal
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <ArrowRight className="ml-2 w-5 h-5" />
            </motion.div>
          </Button>
        </motion.div>

        {/* Quick facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-3 gap-6 text-sm"
        >
          <div>
            <p className="text-2xl font-bold text-primary">5min</p>
            <p className="text-muted-foreground">Setup time</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">24/7</p>
            <p className="text-muted-foreground">Progress tracking</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">∞</p>
            <p className="text-muted-foreground">Possibilities</p>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};
