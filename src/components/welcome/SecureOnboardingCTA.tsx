import { motion } from "framer-motion";
import { Shield, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const securityFeatures = [
  "Bank-level encryption",
  "Two-factor authentication",
  "FDIC insured accounts",
  "Privacy-first design"
];

export const SecureOnboardingCTA = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.35 }}
      className="relative bg-gradient-to-br from-accent/80 to-secondary/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-[var(--shadow-card)] border border-border/50 overflow-hidden group"
    >
      {/* Animated background pattern */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{
          backgroundImage: "radial-gradient(circle, hsl(0 0% 0% / 0.1) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
          <motion.div 
            className="bg-background rounded-2xl p-4 w-fit"
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <Shield className="w-8 h-8 text-foreground" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Secure Account Setup
            </h3>
            <p className="text-foreground/80 text-lg">
              Get started with your secure, privacy-focused savings account in minutes.
            </p>
          </div>
        </div>
        
        <ul className="space-y-4 mb-8">
          {securityFeatures.map((feature, index) => (
            <motion.li
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <Check className="w-5 h-5 text-foreground shrink-0" />
              </motion.div>
              <span className="text-foreground font-medium">{feature}</span>
            </motion.li>
          ))}
        </ul>

        <Link to="/onboarding" className="block">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button size="lg" className="w-full text-lg h-14 shadow-lg hover:shadow-xl transition-shadow">
              Begin Your Journey
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
};
