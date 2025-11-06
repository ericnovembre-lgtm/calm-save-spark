import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveplusAnimIcon } from "@/components/icons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Feature } from "@/components/welcome/FeatureCarousel";

interface FeatureTourProps {
  features: Feature[];
  onComplete: () => void;
  onSkip: () => void;
}

const TOUR_STORAGE_KEY = "saveplus_feature_tour_completed";

export const FeatureTour = ({ features, onComplete, onSkip }: FeatureTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const currentFeature = features[currentStep];
  const isLastStep = currentStep === features.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    onComplete();
  };

  const handleSkipTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    onSkip();
  };

  // Prevent body scroll when tour is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleSkipTour}
        />

        {/* Tour Card */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9, y: 20 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 md:p-10"
        >
          {/* Close Button */}
          <button
            onClick={handleSkipTour}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Close tour"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Feature {currentStep + 1} of {features.length}
              </span>
              <button
                onClick={handleSkipTour}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / features.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Feature Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeature.id}
              initial={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              {/* Feature Icon */}
              <motion.div
                className="mb-6 flex justify-center"
                whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20">
                  <SaveplusAnimIcon 
                    name={currentFeature.icon} 
                    size={64} 
                    decorative 
                  />
                </div>
              </motion.div>

              {/* Feature Title */}
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 text-center">
                {currentFeature.title}
              </h2>

              {/* Feature Description */}
              <p className="text-lg text-muted-foreground mb-4 text-center leading-relaxed">
                {currentFeature.summary || currentFeature.description}
              </p>

              {/* Feature Details */}
              <div className="bg-accent/50 rounded-xl p-4 border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  {currentFeature.details}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {features.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted hover:bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="gap-2"
            >
              {isLastStep ? (
                <>
                  Complete
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/**
 * Check if user has completed the feature tour
 */
export const hasCompletedTour = (): boolean => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
};

/**
 * Reset tour completion (for testing)
 */
export const resetTour = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOUR_STORAGE_KEY);
};
