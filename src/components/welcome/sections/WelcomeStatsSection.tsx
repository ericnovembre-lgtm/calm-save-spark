/**
 * @fileoverview Welcome Statistics Section Component
 * 
 * Renders the "Why Choose $ave+?" statistics section featuring:
 * - Expandable stat cards showing key metrics (users, savings, APY)
 * - Live activity ticker with real-time updates
 * - Pull-to-refresh functionality for mobile users
 * - Staggered animations for visual impact
 * - Hidden easter egg (double-click to unlock clicker game)
 * 
 * @module components/welcome/sections/WelcomeStatsSection
 */

import { motion, useInView } from "framer-motion";
import { Users, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { LazyLoad } from "@/components/performance/LazyLoad";
import LazyErrorBoundary from "@/components/performance/LazyErrorBoundary";
import { ExpandableStatCard } from "@/components/welcome/ExpandableStatCard";
import { LiveActivityTicker } from "@/components/welcome/LiveActivityTicker";
import { PullToRefreshStats } from "@/components/mobile/PullToRefreshStats";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Props for the WelcomeStatsSection component
 * 
 * @interface WelcomeStatsSectionProps
 */
interface WelcomeStatsSectionProps {
  /** Reference to the stats section DOM element for scroll tracking */
  statsRef: React.RefObject<HTMLDivElement>;
  
  /** Whether the stats section is currently in the viewport */
  statsInView: boolean;
  
  /** Callback fired when user double-clicks the live activity ticker (easter egg) */
  onDoubleClick: () => void;
}

/**
 * WelcomeStatsSection Component
 * 
 * Displays key platform statistics in an engaging, interactive format.
 * Features expandable cards that reveal detailed breakdowns on click/tap,
 * and includes a live activity ticker showing real-time savings events.
 * 
 * Statistics Displayed:
 * - Active Savers: 50,000+ (with monthly/weekly/daily breakdown)
 * - Total Saved: $2.1M+ (with automated/round-up/manual breakdown)
 * - Average APY: 4.25% (competitive interest rate)
 * 
 * Features:
 * - Medium priority lazy loading (rendered after features)
 * - Responsive grid: 2 columns (mobile) → 3 columns (desktop)
 * - Cards expand on click to show detailed breakdowns
 * - Pull-to-refresh on mobile refreshes stats
 * - Staggered entrance animations (0, 0.1s, 0.2s delays)
 * - Live activity ticker with smooth auto-scroll
 * - Easter egg: double-click ticker to unlock clicker game
 * 
 * Accessibility:
 * - Respects prefers-reduced-motion for animations
 * - ARIA labels for screen readers
 * - Keyboard accessible expandable cards
 * - High contrast color scheme
 * 
 * @component
 * @example
 * ```tsx
 * <WelcomeStatsSection
 *   statsRef={statsRef}
 *   statsInView={statsInView}
 *   onDoubleClick={() => setShowClickerGame(true)}
 * />
 * ```
 * 
 * @param {WelcomeStatsSectionProps} props - Component props
 * @returns {JSX.Element} Rendered statistics section with interactive cards
 */
export function WelcomeStatsSection({
  statsRef,
  statsInView,
  onDoubleClick
}: WelcomeStatsSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <LazyLoad threshold={0.1} minHeight="600px">
      <motion.section 
        ref={statsRef}
        className="space-y-12 relative"
        style={{ zIndex: 'var(--z-content-base)' } as React.CSSProperties}
      >
        <motion.div 
          className="flex items-center gap-3 mb-8"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
          animate={prefersReducedMotion ? false : (statsInView ? { opacity: 1, x: 0 } : {})}
          transition={{ duration: 0.5 }}
        >
          <div className="h-1 w-12 bg-gradient-to-r from-[color:var(--color-accent)] to-transparent rounded-full" />
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Why Choose $ave+?
          </h2>
        </motion.div>
        <LazyErrorBoundary componentName="PullToRefreshStats" fallbackHeight="400px">
          <PullToRefreshStats onRefresh={async () => {
            // Simulate refresh
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Stats refreshed!");
          }}>
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={statsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0, duration: 0.5 }}
                  >
                    <ExpandableStatCard
                      label="Active Savers"
                      value={50000}
                      suffix="+"
                      icon={<Users className="w-8 h-8" />}
                      delay={0}
                      breakdown={[
                        { label: "This Month", value: "2,340", percentage: 75 },
                        { label: "This Week", value: "580", percentage: 45 },
                        { label: "Today", value: "120", percentage: 25 },
                      ]}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={statsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    <ExpandableStatCard
                      label="Total Saved"
                      value={2.1}
                      suffix="M+"
                      icon={<DollarSign className="w-8 h-8" />}
                      delay={0.1}
                      breakdown={[
                        { label: "Automated Savings", value: "$1.2M", percentage: 57 },
                        { label: "Round-ups", value: "$600K", percentage: 28 },
                        { label: "Manual Transfers", value: "$300K", percentage: 15 },
                      ]}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={statsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <ExpandableStatCard
                      label="Average APY"
                      value={4.25}
                      suffix="%"
                      icon={<TrendingUp className="w-8 h-8" />}
                      delay={0.2}
                    />
                  </motion.div>
                </>
              </div>

              {/* Live Activity Ticker */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.5 }}
                onDoubleClick={onDoubleClick}
                className="cursor-pointer"
                title="Double-click for a surprise!"
              >
                <LazyErrorBoundary componentName="LiveActivityTicker" fallbackHeight="64px">
                  <LiveActivityTicker />
                </LazyErrorBoundary>
              </motion.div>
            </div>
          </PullToRefreshStats>
        </LazyErrorBoundary>
      </motion.section>
    </LazyLoad>
  );
}
