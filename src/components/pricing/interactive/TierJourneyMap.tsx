import { motion } from 'framer-motion';
import { MapPin, Trophy, Star } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PRICING_TIERS } from '@/components/pricing/TierBadge';

interface TierJourneyMapProps {
  selectedAmount: number;
}

export function TierJourneyMap({ selectedAmount }: TierJourneyMapProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 border border-border"
    >
      <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Your Savings Journey</h3>

      <div className="relative">
        {/* Path line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary" />

        {/* Milestones */}
        <div className="space-y-8">
          {PRICING_TIERS.map((tier, idx) => {
            const isActive = selectedAmount >= tier.minAmount && selectedAmount <= tier.maxAmount;
            const isPassed = selectedAmount > tier.maxAmount;

            return (
              <motion.div
                key={tier.name}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -50 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="relative flex items-center gap-4"
              >
                {/* Checkpoint */}
                <motion.div
                  className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-4 transition-colors ${
                    isActive
                      ? 'bg-primary border-primary shadow-lg shadow-primary/50'
                      : isPassed
                      ? 'bg-primary/50 border-primary/50'
                      : 'bg-muted border-muted-foreground/20'
                  }`}
                  animate={isActive && !prefersReducedMotion ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isPassed ? (
                    <Trophy className="w-6 h-6 text-primary-foreground" />
                  ) : isActive ? (
                    <Star className="w-6 h-6 text-primary-foreground" />
                  ) : (
                    <MapPin className="w-6 h-6 text-muted-foreground" />
                  )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 p-4 rounded-xl bg-gradient-to-r from-accent/5 to-transparent border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    {tier.icon}
                    <h4 className="font-semibold text-foreground">{tier.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  <p className="text-xs text-primary mt-2">${tier.minAmount} - ${tier.maxAmount}/month</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
