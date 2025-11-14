/**
 * @fileoverview Welcome Features Section Component
 * 
 * Renders the "Mission Control" features section showcasing the app's core capabilities:
 * - Interactive flippable feature cards with mini demos
 * - Journey timeline showing user progression
 * - Staggered animations for engaging visual experience
 * - Performance optimizations with lazy loading
 * 
 * @module components/welcome/sections/WelcomeFeaturesSection
 */

import { motion, useInView } from "framer-motion";
import { LazyLoad } from "@/components/performance/LazyLoad";
import LazyErrorBoundary from "@/components/performance/LazyErrorBoundary";
import { TrackedLazyComponent } from "@/components/performance/TrackedLazyComponent";
import { FlippableFeatureCard } from "@/components/welcome/FlippableFeatureCard";
import { JourneyTimeline } from "@/components/welcome/JourneyTimeline";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Feature } from "@/components/welcome/types";

/**
 * Props for the WelcomeFeaturesSection component
 * 
 * @interface WelcomeFeaturesSectionProps
 */
interface WelcomeFeaturesSectionProps {
  /** Reference to the features section DOM element for scroll tracking */
  featuresRef: React.RefObject<HTMLDivElement>;
  
  /** Whether the features section is currently in the viewport */
  featuresInView: boolean;
  
  /** Array of feature objects to display in the grid */
  features: Feature[];
  
  /** Callback fired when a user clicks "Learn More" on a feature card */
  onFeatureClick: (feature: Feature) => void;
}

/**
 * WelcomeFeaturesSection Component
 * 
 * Displays the Mission Control features section with interactive flippable cards
 * and a journey timeline. Features are displayed in a responsive grid layout
 * with staggered animations.
 * 
 * Features:
 * - High priority lazy loading (rendered before stats section)
 * - Responsive grid: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
 * - First 6 features shown with "Most Popular" and "New" badges
 * - Each card flips to reveal mini interactive demos
 * - Journey timeline shows user progression milestones
 * - Staggered entrance animations (0.1s delay per card)
 * 
 * Performance:
 * - Uses LazyLoad with 100px root margin for optimized rendering
 * - TrackedLazyComponent monitors rendering performance
 * - Error boundaries provide fallbacks if components fail
 * 
 * @component
 * @example
 * ```tsx
 * <WelcomeFeaturesSection
 *   featuresRef={featuresRef}
 *   featuresInView={featuresInView}
 *   features={[
 *     {
 *       id: 'smart-pots',
 *       title: 'Smart Savings Pots',
 *       description: 'Organize your money into goals',
 *       icon: 'piggy-bank',
 *       details: 'Create unlimited pots...'
 *     }
 *   ]}
 *   onFeatureClick={(feature) => console.log('Clicked:', feature.title)}
 * />
 * ```
 * 
 * @param {WelcomeFeaturesSectionProps} props - Component props
 * @returns {JSX.Element} Rendered features section with cards and timeline
 */
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
