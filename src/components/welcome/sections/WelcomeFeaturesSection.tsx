import { motion, useInView } from "framer-motion";
import { LazyLoad } from "@/components/performance/LazyLoad";
import LazyErrorBoundary from "@/components/performance/LazyErrorBoundary";
import { TrackedLazyComponent } from "@/components/performance/TrackedLazyComponent";
import { FlippableFeatureCard } from "@/components/welcome/FlippableFeatureCard";
import { JourneyTimeline } from "@/components/welcome/JourneyTimeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  details?: string;
}

interface WelcomeFeaturesSectionProps {
  featuresRef: React.RefObject<HTMLDivElement>;
  featuresInView: boolean;
  features: Feature[];
  onFeatureClick: (feature: Feature) => void;
}

export function WelcomeFeaturesSection({
  featuresRef,
  featuresInView,
  features,
  onFeatureClick
}: WelcomeFeaturesSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <LazyLoad threshold={0.1} minHeight="800px">
      <motion.section 
        ref={featuresRef}
        className="space-y-12 relative bg-[color:var(--color-surface)] -mx-4 px-4 lg:-mx-20 lg:px-20 py-16 rounded-2xl"
        style={{ zIndex: 'var(--z-content-base)' } as React.CSSProperties}
      >
        <motion.div 
          className="flex items-center gap-3 mb-8"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
          animate={prefersReducedMotion ? false : (featuresInView ? { opacity: 1, x: 0 } : {})}
          transition={{ duration: 0.5 }}
        >
          <div className="h-1 w-12 bg-gradient-to-r from-[color:var(--color-accent)] to-transparent rounded-full" />
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Mission Control
          </h2>
        </motion.div>
        <div className="space-y-12">
          {/* Flippable Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TrackedLazyComponent componentName="FlippableFeatureCards" minHeight="256px">
              <LazyErrorBoundary componentName="FlippableFeatureCard" fallbackHeight="256px">
                {features.slice(0, 6).map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <FlippableFeatureCard
                      id={feature.id}
                      title={feature.title}
                      description={feature.description}
                      icon={feature.icon}
                      details={feature.details || ""}
                      badge={index === 0 ? "Most Popular" : index === 1 ? "New" : undefined}
                      onLearnMore={() => onFeatureClick(feature)}
                    />
                  </motion.div>
                ))}
              </LazyErrorBoundary>
            </TrackedLazyComponent>
          </div>

          {/* Journey Timeline */}
          <div className="mt-16">
            <TrackedLazyComponent componentName="JourneyTimeline" minHeight="400px">
              <LazyErrorBoundary componentName="JourneyTimeline" fallbackHeight="400px">
                <JourneyTimeline />
              </LazyErrorBoundary>
            </TrackedLazyComponent>
          </div>
        </div>
      </motion.section>
    </LazyLoad>
  );
}
