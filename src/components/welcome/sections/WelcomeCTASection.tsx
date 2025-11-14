import { motion } from "framer-motion";
import { SecureOnboardingCTA } from "@/components/welcome/SecureOnboardingCTA";
import { PriorityLoader } from "@/components/performance/PriorityLoader";

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
