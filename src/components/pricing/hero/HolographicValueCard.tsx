import { motion } from 'framer-motion';
import { TrendingUp, Zap, Shield, Award } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getTierForAmount } from '@/components/pricing/TierBadge';

interface HolographicValueCardProps {
  selectedAmount: number;
}

export function HolographicValueCard({ selectedAmount }: HolographicValueCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const tier = getTierForAmount(selectedAmount);
  
  const roiScore = Math.min((selectedAmount / 20) * 100, 100);
  const features = [
    { icon: TrendingUp, label: 'ROI Score', value: `${roiScore.toFixed(0)}%` },
    { icon: Zap, label: 'Speed Boost', value: `${tier.minAmount}x` },
    { icon: Shield, label: 'Security Level', value: tier.name },
    { icon: Award, label: 'Premium Features', value: `${tier.maxAmount}+` },
  ];

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30, rotateX: -10 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative"
      style={{ perspective: '1000px' }}
    >
      {/* Holographic border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] opacity-50 blur-xl animate-shimmer" />
      
      <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl p-6 border border-primary/20">
        {/* Scan line effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
            animate={{ y: [0, 300] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <motion.div
            animate={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className="w-5 h-5 text-primary" />
          </motion.div>
          Value Analysis
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50"
            >
              <feature.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{feature.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{feature.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Animated data streams */}
        <div className="mt-6 space-y-2">
          {[...Array(3)].map((_, idx) => (
            <motion.div
              key={idx}
              className="h-1 bg-gradient-to-r from-primary/20 via-primary/50 to-transparent rounded-full"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8 + idx * 0.2, duration: 1.5, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
