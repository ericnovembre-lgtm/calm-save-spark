import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Prediction {
  feature: string;
  confidence: number;
  reason: string;
}

export function PredictiveFeatureEngine() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    // Simulate ML prediction
    const timer = setTimeout(() => {
      setPrediction({
        feature: 'Budget',
        confidence: 87,
        reason: 'You typically check your budget on Monday mornings'
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!prediction) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              AI predicts you'll use <span className="text-primary font-bold">{prediction.feature}</span> next
            </p>
            <p className="text-xs text-muted-foreground mt-1">{prediction.reason}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-primary">{prediction.confidence}%</div>
            <div className="text-xs text-muted-foreground">confidence</div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary" />
        </div>
      </Card>
    </motion.div>
  );
}
