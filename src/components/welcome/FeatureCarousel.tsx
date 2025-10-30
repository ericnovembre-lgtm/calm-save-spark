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
    <div className="relative -mx-4 px-4">
      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide scroll-smooth">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="snap-start shrink-0"
          >
            <motion.button
              onClick={() => onFeatureClick(feature)}
              className="relative h-auto w-64 md:w-72 flex-col gap-4 p-6 md:p-8 bg-card/80 backdrop-blur-sm hover:bg-card transition-all border border-border/50 rounded-xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] group overflow-hidden"
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col items-center gap-4">
                <motion.div 
                  className="text-foreground bg-background/50 p-3 rounded-xl"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {iconMap[feature.id] || feature.icon}
                </motion.div>
                <div className="text-center">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-foreground/90 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.button>
          </motion.div>
        ))}
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="flex justify-center gap-2 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {features.slice(0, 4).map((_, index) => (
          <div 
            key={index}
            className="w-2 h-2 rounded-full bg-muted-foreground/30"
          />
        ))}
      </motion.div>
    </div>
  );
};
