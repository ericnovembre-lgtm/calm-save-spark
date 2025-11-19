import { motion } from "framer-motion";
import { Building2, Shield, Zap, Code } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const banks = [
  "Chase", "Bank of America", "Wells Fargo", "Capital One",
  "Citibank", "US Bank", "PNC Bank", "TD Bank",
  "Truist", "Fifth Third Bank", "Citizens Bank", "Ally Bank",
  "Marcus by Goldman Sachs", "Discover", "HSBC", "BMO Harris"
];

const features = [
  {
    icon: Building2,
    title: "10,000+ Banks",
    description: "Connect to virtually any US financial institution"
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "Read-only access via Plaid's trusted infrastructure"
  },
  {
    icon: Zap,
    title: "Real-time Sync",
    description: "Automatic daily transaction updates"
  },
  {
    icon: Code,
    title: "Developer API",
    description: "Build custom integrations (Business plan)"
  }
];

export const Integrations = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Seamless Bank Integrations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect your accounts in seconds with secure, read-only access powered by Plaid
          </p>
        </motion.div>

        {/* Integration Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={index}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 mb-4 border border-primary/20">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Bank Logos Grid */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-muted/50 to-background border border-border backdrop-blur-sm">
            <h3 className="text-xl font-bold text-center mb-8">
              Trusted by users at these institutions and 10,000+ more
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {banks.map((bank, index) => (
                <motion.div
                  key={index}
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-center p-4 rounded-xl bg-background border border-border hover:border-primary/50 transition-all"
                >
                  <span className="text-sm font-semibold text-center">{bank}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Powered by <span className="font-semibold text-foreground">Plaid</span> • 
                Same technology trusted by Venmo, Robinhood & Coinbase
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">
              We never store your bank login credentials • Read-only access only
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
