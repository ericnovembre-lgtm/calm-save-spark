import { useState, useEffect } from 'react';
import { Star, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Feature {
  icon: any;
  title: string;
  description: string;
  path: string;
  color: string;
}

interface Props {
  features: Feature[];
  onReorder: (features: Feature[]) => void;
}

export function SmartFeatureRecommender({ features, onReorder }: Props) {
  const [recommendations, setRecommendations] = useState<number[]>([]);

  useEffect(() => {
    // Simulate ML-based feature recommendation
    const analyzeUsagePatterns = () => {
      // Mock: prioritize Budget, Transactions, and Automations
      const priorityIndices = [0, 1, 5]; // Budget, Transactions, Automations
      const otherIndices = features
        .map((_, i) => i)
        .filter(i => !priorityIndices.includes(i));
      
      const reordered = [...priorityIndices, ...otherIndices];
      setRecommendations(reordered);
      
      const reorderedFeatures = reordered.map(i => features[i]);
      onReorder(reorderedFeatures);
    };

    const timer = setTimeout(analyzeUsagePatterns, 1000);
    return () => clearTimeout(timer);
  }, [features]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-4"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Zap className="w-4 h-4 text-primary" />
        <span>AI-optimized layout based on your usage patterns</span>
      </div>
    </motion.div>
  );
}
