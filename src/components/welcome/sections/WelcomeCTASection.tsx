/**
 * @fileoverview Welcome Call-to-Action Section Component
 * 
 * Renders the final conversion-focused section of the Welcome page:
 * - Prominent "Begin Your Journey" call-to-action
 * - Security badges and trust indicators
 * - Alternative "Explore Plans" option
 * - Smooth entrance animation on scroll
 * 
 * @module components/welcome/sections/WelcomeCTASection
 */

import { motion } from "framer-motion";
import { SecureOnboardingCTA } from "@/components/welcome/SecureOnboardingCTA";
import { PriorityLoader } from "@/components/performance/PriorityLoader";

/**
 * WelcomeCTASection Component
 * 
 * Displays the final call-to-action section encouraging users to sign up
 * or explore pricing plans. Features a clean, conversion-optimized design
 * with security indicators to build trust.
 * 
 * Features:
 * - Low priority loading (rendered last, below the fold)
 * - Smooth scale animation on viewport entry
 * - Conditional rendering based on authentication state
 * - Prominent primary CTA button
 * - Secondary "Explore Plans" link
 * - Security badges (HTTPS, Encryption, 2FA)
 * 
 * Behavior:
 * - Shows "Begin Your Journey" for unauthenticated users
 * - Shows "Launch Dashboard" for authenticated users
 * - Animates in when 50% of section enters viewport
 * - Scales from 0.95 to 1.0 with fade-in effect
 * 
 * Performance:
 * - Uses PriorityLoader with "low" priority
 * - Deferred rendering improves initial page load
 * - Minimal JavaScript, mostly static content
 * 
 * @component
 * @example
 * ```tsx
 * <WelcomeCTASection />
 * ```
 * 
 * @returns {JSX.Element} Rendered call-to-action section with secure onboarding prompt
 */
export function WelcomeCTASection() {
  return (
    <PriorityLoader priority="low" minHeight="300px">
      <motion.section
        className="relative z-20 bg-[color:var(--color-surface)] -mx-4 px-4 lg:-mx-20 lg:px-20 py-20 rounded-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SecureOnboardingCTA />
        </motion.div>
      </motion.section>
    </PriorityLoader>
  );
}
