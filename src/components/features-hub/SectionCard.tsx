import { motion } from "framer-motion";
import { FeatureGrid } from "./FeatureGrid";
import { Section, Feature } from "@/pages/FeaturesHub";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Sparkles, Zap } from "lucide-react";

interface SectionCardProps {
  section: Section;
  onFeatureClick: (feature: Feature) => void;
}

export function SectionCard({ section, onFeatureClick }: SectionCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const isNextGen = section.category === "next-gen";

  return (
    <div className="relative">
      {/* Section Header */}
      <motion.div
        className="mb-8"
        whileHover={!prefersReducedMotion ? { scale: 1.01 } : {}}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            {isNextGen && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
            )}
            <h2 className="text-3xl font-bold text-foreground">
              {section.title}
            </h2>
            {isNextGen && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary border border-primary/30">
                NEW
              </span>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-lg">{section.subtitle}</p>
      </motion.div>

      {/* Features Grid */}
      <div className="relative">
        {isNextGen && (
          <motion.div
            className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 blur-xl -z-10"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        
        <FeatureGrid
          features={section.features}
          onFeatureClick={onFeatureClick}
          isNextGen={isNextGen}
        />
      </div>
    </div>
  );
}
