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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.35 }}
      className="bg-accent rounded-lg p-8 shadow-[var(--shadow-card)] border border-border"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="bg-background rounded-full p-3">
          <Shield className="w-6 h-6 text-foreground" />
        </div>
        <div>
          <h3 className="font-display font-bold text-2xl text-foreground mb-2">
            Secure Account Setup
          </h3>
          <p className="text-muted-foreground">
            Get started with your secure, privacy-focused savings account in minutes.
          </p>
        </div>
      </div>
      
      <ul className="space-y-3 mb-6">
        {securityFeatures.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <Check className="w-5 h-5 text-foreground shrink-0" />
            <span className="text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Link to="/onboarding">
        <Button size="lg" className="w-full">
          Begin Your Journey
        </Button>
      </Link>
    </motion.div>
  );
};
