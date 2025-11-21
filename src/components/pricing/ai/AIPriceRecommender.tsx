import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getTierForAmount } from '@/components/pricing/TierBadge';

interface AIPriceRecommenderProps {
  currentAmount: number;
  onApplyRecommendation: (amount: number) => void;
}

export function AIPriceRecommender({ currentAmount, onApplyRecommendation }: AIPriceRecommenderProps) {
  const prefersReducedMotion = useReducedMotion();
  const [recommendedAmount, setRecommendedAmount] = useState(8);
  const [confidence, setConfidence] = useState(0);
  const [reasons, setReasons] = useState<string[]>([]);

  useEffect(() => {
    // AI logic to recommend optimal tier
    const calculateRecommendation = () => {
      // Simulate AI analysis
      const recommended = Math.min(Math.max(currentAmount + 2, 5), 12);
      const conf = 75 + Math.random() * 20;
      
      const reasonsList = [
        'Unlimited goals unlock 3x more savings potential',
        'AI forecasting saves users avg $240/month',
        'Priority support resolves issues 5x faster',
      ];
      
      setRecommendedAmount(recommended);
      setConfidence(conf);
      setReasons(reasonsList);
    };

    calculateRecommendation();
  }, [currentAmount]);

  const tier = getTierForAmount(recommendedAmount);

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-6 border border-primary/20 backdrop-blur-sm"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            AI Recommendation
            <span className="text-xs font-normal text-muted-foreground">
              {confidence.toFixed(0)}% confidence
            </span>
          </h3>
          
          <p className="text-sm text-muted-foreground mt-1">
            Based on your profile, we recommend the <span className="font-semibold text-primary">{tier.name}</span> tier
          </p>

          {/* Confidence Meter */}
          <div className="mt-4 space-y-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
          </div>

          {/* Reasons */}
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Why we recommend this:
            </p>
            {reasons.map((reason, idx) => (
              <motion.div
                key={idx}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{reason}</span>
              </motion.div>
            ))}
          </div>

          {/* Action */}
          <Button
            onClick={() => onApplyRecommendation(recommendedAmount)}
            className="mt-4 w-full sm:w-auto"
            size="sm"
          >
            <Target className="w-4 h-4 mr-2" />
            Apply Recommendation
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
