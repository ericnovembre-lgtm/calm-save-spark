import { motion } from "framer-motion";
import { Zap, Target, TrendingUp, Shield, Gift, Bot, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string;
}

interface FeatureCarouselProps {
  features: Feature[];
  onFeatureClick: (feature: Feature) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  "smart-pots": <Target className="w-6 h-6" />,
  "automated-savings": <Zap className="w-6 h-6" />,
  "ave-plus-card": <Shield className="w-6 h-6" />,
  "financial-insights": <TrendingUp className="w-6 h-6" />,
  "rewards-program": <Gift className="w-6 h-6" />,
  "ai-coach": <Bot className="w-6 h-6" />,
  "bank-security": <Lock className="w-6 h-6" />,
};

export const FeatureCarousel = ({ features, onFeatureClick }: FeatureCarouselProps) => {
  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.35 }}
            className="snap-start shrink-0"
          >
            <Button
              variant="outline"
              onClick={() => onFeatureClick(feature)}
              className="h-auto w-64 flex-col gap-4 p-6 bg-card hover:bg-secondary/50 transition-all border-border"
            >
              <div className="text-foreground">{iconMap[feature.id] || feature.icon}</div>
              <div className="text-center">
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
