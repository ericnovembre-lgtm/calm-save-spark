import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Feature } from "./FeatureCarousel";

interface FeatureDetailModalProps {
  feature: Feature | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureDetailModal = ({ feature, isOpen, onClose }: FeatureDetailModalProps) => {
  if (!feature) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-background border border-border rounded-lg shadow-[var(--shadow-card)] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-foreground">{feature.icon}</div>
                  <h2 id="modal-title" className="font-display font-bold text-2xl text-foreground">
                    {feature.title}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close"
                  className="hover:bg-secondary"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground">{feature.description}</p>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-line">{feature.details}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={onClose}>Got it!</Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
