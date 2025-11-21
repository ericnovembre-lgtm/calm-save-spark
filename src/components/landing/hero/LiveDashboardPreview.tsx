import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, PiggyBank, Target, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const dashboardViews = [
  {
    title: 'Savings Growth',
    icon: PiggyBank,
    value: '$12,847',
    change: '+24.5%',
    color: 'text-green-500'
  },
  {
    title: 'Goals Progress',
    icon: Target,
    value: '3/5',
    change: 'On track',
    color: 'text-primary'
  },
  {
    title: 'Round-Ups',
    icon: Zap,
    value: '$847',
    change: 'This month',
    color: 'text-accent'
  },
  {
    title: 'Total Returns',
    icon: TrendingUp,
    value: '+18.2%',
    change: 'All time',
    color: 'text-blue-500'
  }
];

export function LiveDashboardPreview() {
  const prefersReducedMotion = useReducedMotion();
  const [currentView, setCurrentView] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % dashboardViews.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const view = dashboardViews[currentView];
  const Icon = view.icon;

  return (
    <Card className="relative overflow-hidden bg-background/60 backdrop-blur-md border-primary/20 p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg bg-background/80 ${view.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{view.title}</p>
                <p className="text-2xl font-bold text-foreground">{view.value}</p>
              </div>
            </div>
            <motion.div
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className={`px-3 py-1 rounded-full text-sm font-semibold ${view.color} bg-current/10`}
            >
              {view.change}
            </motion.div>
          </div>

          {/* Mini chart simulation */}
          <div className="flex items-end gap-1 h-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={prefersReducedMotion ? {} : { height: 0 }}
                animate={{ 
                  height: `${Math.random() * 80 + 20}%` 
                }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.05,
                }}
                className="flex-1 bg-gradient-to-t from-primary/80 to-primary/40 rounded-t"
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicator dots */}
      <div className="flex justify-center gap-2 mt-4">
        {dashboardViews.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentView(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentView 
                ? 'bg-primary w-6' 
                : 'bg-muted-foreground/30'
            }`}
            aria-label={`View ${i + 1}`}
          />
        ))}
      </div>
    </Card>
  );
}
