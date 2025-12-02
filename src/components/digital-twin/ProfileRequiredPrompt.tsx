import { motion } from 'framer-motion';
import { Sparkles, UserCircle, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * Empty state shown when user hasn't set up their Digital Twin profile
 */
export function ProfileRequiredPrompt() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <motion.div
        className="max-w-2xl w-full backdrop-blur-xl bg-card/90 border border-border rounded-2xl p-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Icon */}
        <motion.div
          className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/30 flex items-center justify-center mb-8"
          animate={{
            boxShadow: [
              '0 0 20px hsl(var(--accent) / 0.3)',
              '0 0 40px hsl(var(--accent) / 0.4)',
              '0 0 20px hsl(var(--accent) / 0.3)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-12 h-12 text-accent" />
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Initialize Your Digital Twin
        </h1>
        <p className="text-muted-foreground text-lg mb-8 font-mono">
          Create a living simulation of your financial future
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="p-4 rounded-xl bg-accent/5 border border-accent/20"
            whileHover={{ scale: 1.05 }}
          >
            <UserCircle className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-2">Personal Profile</h3>
            <p className="text-xs text-muted-foreground">
              Age, income, expenses, and life stage
            </p>
          </motion.div>

          <motion.div
            className="p-4 rounded-xl bg-primary/5 border border-primary/20"
            whileHover={{ scale: 1.05 }}
          >
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-2">Financial Projection</h3>
            <p className="text-xs text-muted-foreground">
              Simulate your net worth over decades
            </p>
          </motion.div>

          <motion.div
            className="p-4 rounded-xl bg-accent/5 border border-accent/20"
            whileHover={{ scale: 1.05 }}
          >
            <Target className="w-8 h-8 text-accent mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-2">Life Events</h3>
            <p className="text-xs text-muted-foreground">
              Test scenarios like job changes or major purchases
            </p>
          </motion.div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            onClick={() => navigate('/settings')}
          >
            Set Up Your Twin Profile
          </Button>
          <p className="text-xs text-muted-foreground/60 font-mono">
            Takes 2 minutes · Fully private and secure
          </p>
        </div>
      </motion.div>
    </div>
  );
}
