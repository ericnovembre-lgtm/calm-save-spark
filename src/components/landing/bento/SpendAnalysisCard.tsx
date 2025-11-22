import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PieChart } from 'lucide-react';
import { AnimatedBarChart } from './AnimatedBarChart';

export const SpendAnalysisCard = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="h-full p-6 rounded-3xl bg-card border border-border backdrop-blur-xl overflow-hidden relative"
      whileHover={prefersReducedMotion ? {} : {
        y: -4,
        boxShadow: '0 20px 40px -10px hsl(var(--primary) / 0.2)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-4">
          <motion.div
            className="p-2 rounded-xl bg-primary/10 text-primary"
            whileHover={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <PieChart className="w-7 h-7" />
          </motion.div>
          <div>
            <h3 className="font-bold text-xl text-foreground">Spend Analysis</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track where your money goes
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <AnimatedBarChart />
          
          <div className="mt-4 space-y-2">
            {[
              { label: 'Food & Dining', amount: '$450', color: 'bg-accent' },
              { label: 'Transportation', amount: '$280', color: 'bg-primary' },
              { label: 'Entertainment', amount: '$120', color: 'bg-blue-500' },
            ].map((category, i) => (
              <motion.div
                key={category.label}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${category.color}`} />
                  <span className="text-muted-foreground">{category.label}</span>
                </div>
                <span className="font-semibold text-foreground">{category.amount}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
