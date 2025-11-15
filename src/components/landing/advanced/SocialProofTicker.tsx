import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Star, TrendingUp, Users, Award } from 'lucide-react';

const proofs = [
  { icon: Star, text: '4.9/5 stars on App Store' },
  { icon: Users, text: '50K+ active users' },
  { icon: TrendingUp, text: '$2.1M+ saved collectively' },
  { icon: Award, text: 'Best Fintech App 2024' },
  { icon: Star, text: '10K+ 5-star reviews' },
  { icon: Users, text: 'Growing 300% annually' },
];

export function SocialProofTicker() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="py-6 bg-accent/5 border-y border-accent/10">
        <div className="flex gap-8 justify-center flex-wrap">
          {proofs.slice(0, 4).map((proof, i) => {
            const Icon = proof.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-sm font-medium">
                <Icon className="w-4 h-4 text-accent" />
                <span>{proof.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const duplicatedProofs = [...proofs, ...proofs];

  return (
    <div className="py-6 bg-accent/5 border-y border-accent/10 overflow-hidden">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{
          x: [0, '-50%'],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {duplicatedProofs.map((proof, i) => {
          const Icon = proof.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Icon className="w-4 h-4 text-accent" />
              <span>{proof.text}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
