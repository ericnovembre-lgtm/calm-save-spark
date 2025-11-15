import { motion, AnimatePresence } from "framer-motion";
import { Feature } from "@/pages/FeaturesHub";
import { X, ExternalLink, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FeatureModalProps {
  feature: Feature;
  isOpen: boolean;
  onClose: () => void;
}

export function FeatureModal({ feature, isOpen, onClose }: FeatureModalProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const handleNavigate = () => {
    if (feature.route) {
      navigate(feature.route);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-auto z-50 p-4"
          >
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl opacity-50" />
              
              {/* Content */}
              <div className="relative bg-card rounded-2xl p-8">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0"
                      whileHover={!prefersReducedMotion ? { scale: 1.05, rotate: 5 } : {}}
                    >
                      {feature.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-foreground mb-2">
                        {feature.title}
                      </h2>
                      <div className="flex items-center gap-2">
                        {feature.status === "available" && (
                          <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-success/20 text-success border border-success/30">
                            <CheckCircle2 className="w-4 h-4" />
                            Available Now
                          </span>
                        )}
                        {feature.status === "coming-soon" && (
                          <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-muted text-muted-foreground border border-border">
                            <Clock className="w-4 h-4" />
                            Coming Soon
                          </span>
                        )}
                        {feature.status === "beta" && (
                          <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
                            <Sparkles className="w-4 h-4" />
                            Beta Access
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-lg text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <p className="text-foreground leading-relaxed">
                    {feature.details}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {feature.status === "available" && feature.route ? (
                    <Button
                      onClick={handleNavigate}
                      className="gap-2"
                      size="lg"
                    >
                      Open Feature
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      disabled
                      variant="secondary"
                      size="lg"
                    >
                      Coming Soon
                    </Button>
                  )}
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="lg"
                  >
                    Close
                  </Button>
                </div>

                {/* Beta/Coming Soon notice */}
                {feature.status !== "available" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <p className="text-sm text-muted-foreground">
                      {feature.status === "beta" 
                        ? "This feature is currently in beta testing. Join our waitlist to get early access."
                        : "This feature is under development. We'll notify you when it becomes available."}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
