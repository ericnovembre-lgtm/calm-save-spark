import { motion } from "framer-motion";
import { Monitor, Smartphone, Globe, Shield, Zap, Lock, CheckCircle2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const features = [
  {
    icon: Monitor,
    title: "Web Dashboard",
    description: "Full-featured desktop experience"
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    description: "Native iOS & Android apps"
  },
  {
    icon: Globe,
    title: "Responsive Web",
    description: "Works on any device"
  }
];

const security = [
  { icon: Shield, text: "Bank-level 256-bit encryption" },
  { icon: Lock, text: "SOC 2 Type II certified" },
  { icon: CheckCircle2, text: "Never stores account credentials" },
  { icon: Zap, text: "99.9% uptime SLA" }
];

const integrations = [
  "Chase", "Bank of America", "Wells Fargo", "Capital One",
  "Citibank", "US Bank", "PNC", "TD Bank",
  "Discover", "American Express"
];

export const PlatformOverview = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Financial Life, Everywhere
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access your finances from any device, anytime, anywhere—with bank-level security
          </p>
        </motion.div>

        {/* Platform Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
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
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Security & Reliability */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-background to-muted/50 border border-border backdrop-blur-sm">
            <div className="text-center mb-8">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Bank-Level Security</h3>
              <p className="text-muted-foreground">
                Your data is protected with the same security standards as major financial institutions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {security.map((item, index) => {
                const Icon = item.icon;
                
                return (
                  <motion.div
                    key={index}
                    initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                    whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-background/60 backdrop-blur"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Bank Integrations */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold mb-8">
            Connected to 10,000+ Financial Institutions
          </h3>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {integrations.map((bank, index) => (
              <motion.div
                key={index}
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="px-6 py-3 rounded-full bg-background border border-border hover:border-primary/50 transition-all font-semibold"
              >
                {bank}
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Powered by Plaid • Read-only access • Never stores credentials
          </p>
        </motion.div>
      </div>
    </section>
  );
};
