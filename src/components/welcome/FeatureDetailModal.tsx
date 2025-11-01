import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Feature } from "./FeatureCarousel";
import { useEffect } from "react";

interface FeatureDetailModalProps {
  feature: Feature | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureDetailModal = ({ feature, isOpen, onClose }: FeatureDetailModalProps) => {
  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
          >
            <div className="bg-background border-2 border-[color:var(--color-border)] rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-[color:var(--color-text)]">{feature.icon}</div>
                  <h2 id="modal-title" className="font-display font-bold text-2xl text-[color:var(--color-text)]">
                    {feature.title}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close feature details"
                  className="hover:bg-accent flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <p id="modal-description" className="text-muted-foreground">
                  {feature.description}
                </p>
                <div className="bg-card rounded-lg p-4 border border-[color:var(--color-border)]">
                  <p className="text-sm text-foreground whitespace-pre-line">
                    {feature.details}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} className="border-[color:var(--color-border)]">
                  Close (Esc)
                </Button>
                <Button onClick={onClose}>
                  Got it!
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
