import { motion } from "framer-motion";
import { Play, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export const InteractiveDemo = () => {
  const navigate = useNavigate();
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
            See $ave+ in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore a live preview of the dashboard and experience the power of intelligent financial management
          </p>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl">
            {/* Demo Preview Image Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-muted via-background to-muted flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="inline-flex p-6 rounded-full bg-primary/10 backdrop-blur">
                  <Play className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Interactive Dashboard Preview</h3>
                  <p className="text-muted-foreground">
                    Click below to explore the live demo
                  </p>
                </div>
              </div>
            </div>

            {/* Overlay with CTA */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent flex items-end justify-center p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Try Live Demo
                </button>
                <button
                  onClick={() => navigate("/onboarding")}
                  className="px-8 py-4 rounded-full bg-background border-2 border-primary text-foreground font-semibold hover:bg-primary/10 transition-all"
                >
                  Start Free Account
                </button>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              { label: "Real-time Updates", value: "< 2s" },
              { label: "Data Sync", value: "Daily" },
              { label: "Load Time", value: "< 1s" },
              { label: "Mobile Optimized", value: "100%" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 rounded-xl bg-muted/50 border border-border"
              >
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
