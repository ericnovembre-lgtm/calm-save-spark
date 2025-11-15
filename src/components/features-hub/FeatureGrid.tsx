import { motion } from "framer-motion";
import { Feature } from "@/pages/FeaturesHub";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FeatureBadge } from "./FeatureBadge";

interface FeatureGridProps {
  features: Feature[];
  onFeatureClick: (feature: Feature) => void;
  isNextGen?: boolean;
}

export function FeatureGrid({ features, onFeatureClick, isNextGen }: FeatureGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();

  const handleFeatureClick = (feature: Feature) => {
    if (feature.route && (feature.status === "available" || feature.status === "beta")) {
      navigate(feature.route);
    } else {
      onFeatureClick(feature);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={feature.id}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          whileHover={!prefersReducedMotion ? { y: -8 } : {}}
          className="group relative"
        >
          <button
            onClick={() => handleFeatureClick(feature)}
            className="w-full text-left"
          >
            <div className="relative h-full p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden">
              {/* Background gradient for next-gen features */}
              {isNextGen && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              )}

              {/* Status badge */}
              <div className="absolute top-4 right-4">
                <FeatureBadge status={feature.status} />
              </div>

              {/* Icon */}
              <motion.div
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary"
                whileHover={!prefersReducedMotion ? { scale: 1.1, rotate: 5 } : {}}
                transition={{ duration: 0.2 }}
              >
                {feature.icon}
              </motion.div>

              {/* Content */}
              <h3 className="font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {feature.description}
              </p>

              {/* Action indicator */}
              <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>
                  {feature.status === "available" || feature.status === "beta" 
                    ? "Open" 
                    : "Learn more"}
                </span>
                <motion.div
                  animate={!prefersReducedMotion ? { x: [0, 4, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </div>

              {/* Glow effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                animate={!prefersReducedMotion ? {
                  background: [
                    "radial-gradient(circle at 0% 0%, hsl(var(--primary) / 0) 0%, hsl(var(--primary) / 0.05) 50%, hsl(var(--primary) / 0) 100%)",
                    "radial-gradient(circle at 100% 100%, hsl(var(--primary) / 0) 0%, hsl(var(--primary) / 0.05) 50%, hsl(var(--primary) / 0) 100%)",
                    "radial-gradient(circle at 0% 0%, hsl(var(--primary) / 0) 0%, hsl(var(--primary) / 0.05) 50%, hsl(var(--primary) / 0) 100%)",
                  ]
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </button>
        </motion.div>
      ))}
    </div>
  );
}
