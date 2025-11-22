import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AIInsightCard } from './AIInsightCard';
import { SpendAnalysisCard } from './SpendAnalysisCard';
import { SecurityShieldCard } from './SecurityShieldCard';
import { BentoCard } from './BentoCard';
import { Zap, Target, DollarSign, TrendingUp } from 'lucide-react';

export const BentoFeatures = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-32 px-4 md:px-20 bg-muted/20">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold text-foreground mb-4 tracking-tight">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to transform your financial future
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]">
          {/* Large Card: AI Insight */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0 }}
            className="md:col-span-2 md:row-span-2"
          >
            <AIInsightCard />
          </motion.div>

          {/* Medium Card: Spend Analysis */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:row-span-2"
          >
            <SpendAnalysisCard />
          </motion.div>

          {/* Medium Card: Security */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:row-span-2"
          >
            <SecurityShieldCard />
          </motion.div>

          {/* Full Width: Automation */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-3"
          >
            <BentoCard
              title="Automated Savings"
              description="Set it and forget it. Round-ups, scheduled transfers, and smart rules working 24/7."
              icon={<Zap className="w-8 h-8" />}
            >
              <div className="flex items-center gap-3 mt-4">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Round-ups</span>
                    <span className="font-semibold text-accent">$127.50</span>
                  </div>
                  <div className="h-2 bg-accent/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent"
                      initial={{ width: 0 }}
                      whileInView={{ width: '75%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Scheduled</span>
                    <span className="font-semibold text-accent">$200.00</span>
                  </div>
                  <div className="h-2 bg-accent/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent"
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.6 }}
                    />
                  </div>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Small Cards */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <BentoCard
              title="Goal Tracking"
              description="Visual milestones"
              icon={<Target className="w-6 h-6" />}
            >
              <motion.div
                className="mt-3 text-4xl font-bold text-accent"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.6 }}
              >
                73%
              </motion.div>
            </BentoCard>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <BentoCard
              title="Bill Tracking"
              description="Never miss a payment"
              icon={<DollarSign className="w-6 h-6" />}
            >
              <div className="mt-3 flex gap-2">
                {[3, 5, 2, 4].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-accent rounded-t"
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h * 10}px` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                  />
                ))}
              </div>
            </BentoCard>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <BentoCard
              title="Investments"
              description="Grow your wealth"
              icon={<TrendingUp className="w-6 h-6" />}
            >
              <motion.div
                className="mt-3 text-2xl font-bold text-green-500"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                +12.4%
              </motion.div>
            </BentoCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
