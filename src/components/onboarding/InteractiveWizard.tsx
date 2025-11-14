import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { saveplus_audit_event } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string; // CSS selector for the element to highlight
  position?: "top" | "bottom" | "left" | "right";
  actionLabel?: string;
  icon?: React.ReactNode;
}

interface InteractiveWizardProps {
  steps: WizardStep[];
  onComplete: () => void;
  onSkip: () => void;
  storageKey?: string;
}

const SPOTLIGHT_PADDING = 8;
const TOOLTIP_OFFSET = 20;

export const InteractiveWizard = ({
  steps,
  onComplete,
  onSkip,
  storageKey = "saveplus_interactive_wizard_completed"
}: InteractiveWizardProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const observerRef = useRef<ResizeObserver | null>(null);

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Update target element position
  useEffect(() => {
    if (!currentStep || !isVisible) return;

    const updateTargetPosition = () => {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Add highlight class
        element.classList.add("wizard-highlight");
      } else {
        setTargetRect(null);
      }
    };

    // Initial position
    updateTargetPosition();

    // Watch for resize/scroll
    const resizeObserver = new ResizeObserver(updateTargetPosition);
    const element = document.querySelector(currentStep.targetSelector);
    
    if (element) {
      resizeObserver.observe(element);
    }

    window.addEventListener("scroll", updateTargetPosition, true);
    window.addEventListener("resize", updateTargetPosition);

    observerRef.current = resizeObserver;

    return () => {
      const element = document.querySelector(currentStep.targetSelector);
      if (element) {
        element.classList.remove("wizard-highlight");
        resizeObserver.unobserve(element);
      }
      window.removeEventListener("scroll", updateTargetPosition, true);
      window.removeEventListener("resize", updateTargetPosition);
    };
  }, [currentStep, currentStepIndex, isVisible]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          handleSkip();
          break;
        case "ArrowRight":
        case "Enter":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStepIndex, isVisible, isLastStep]);

  const handleNext = () => {
    saveplus_audit_event("wizard_step_completed", {
      step: currentStep.id,
      step_index: currentStepIndex,
      total_steps: steps.length
    });

    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      saveplus_audit_event("wizard_step_back", {
        step: currentStep.id,
        step_index: currentStepIndex
      });
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    saveplus_audit_event("wizard_completed", {
      total_steps: steps.length
    });
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    localStorage.setItem(storageKey, "skipped");
    saveplus_audit_event("wizard_skipped", {
      step: currentStep.id,
      step_index: currentStepIndex,
      total_steps: steps.length
    });
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const position = currentStep.position || "bottom";
    const style: React.CSSProperties = {};

    switch (position) {
      case "top":
        style.top = `${targetRect.top - TOOLTIP_OFFSET}px`;
        style.left = `${targetRect.left + targetRect.width / 2}px`;
        style.transform = "translate(-50%, -100%)";
        break;
      case "bottom":
        style.top = `${targetRect.bottom + TOOLTIP_OFFSET}px`;
        style.left = `${targetRect.left + targetRect.width / 2}px`;
        style.transform = "translate(-50%, 0)";
        break;
      case "left":
        style.top = `${targetRect.top + targetRect.height / 2}px`;
        style.left = `${targetRect.left - TOOLTIP_OFFSET}px`;
        style.transform = "translate(-100%, -50%)";
        break;
      case "right":
        style.top = `${targetRect.top + targetRect.height / 2}px`;
        style.left = `${targetRect.right + TOOLTIP_OFFSET}px`;
        style.transform = "translate(0, -50%)";
        break;
    }

    return style;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none">
        {/* Overlay with spotlight cutout */}
        <svg className="absolute inset-0 w-full h-full pointer-events-auto">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <motion.rect
                  initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                  x={targetRect.left - SPOTLIGHT_PADDING}
                  y={targetRect.top - SPOTLIGHT_PADDING}
                  width={targetRect.width + SPOTLIGHT_PADDING * 2}
                  height={targetRect.height + SPOTLIGHT_PADDING * 2}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="hsl(var(--background))"
            fillOpacity="0.8"
            mask="url(#spotlight-mask)"
            onClick={handleSkip}
          />
        </svg>

        {/* Highlight ring around target */}
        {targetRect && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            className="absolute border-2 border-primary rounded-xl pointer-events-none shadow-lg shadow-primary/50"
            style={{
              top: `${targetRect.top - SPOTLIGHT_PADDING}px`,
              left: `${targetRect.left - SPOTLIGHT_PADDING}px`,
              width: `${targetRect.width + SPOTLIGHT_PADDING * 2}px`,
              height: `${targetRect.height + SPOTLIGHT_PADDING * 2}px`,
            }}
          />
        )}

        {/* Tooltip Card */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
          className="absolute pointer-events-auto"
          style={getTooltipPosition()}
        >
          <Card className="w-[400px] max-w-[90vw] p-6 shadow-2xl backdrop-blur-xl bg-background/95 border-2">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {currentStep.icon && (
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {currentStep.icon}
                  </div>
                )}
                <div>
                  <Badge variant="outline" className="mb-2">
                    Step {currentStepIndex + 1} of {steps.length}
                  </Badge>
                  <h3 className="font-display font-semibold text-xl text-foreground">
                    {currentStep.title}
                  </h3>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="shrink-0"
                aria-label="Close wizard"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {currentStep.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Skip Tour
                </Button>

                <Button
                  variant="default"
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
                      {currentStep.actionLabel || "Next"}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Use <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">←</kbd>{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">→</kbd>{" "}
                to navigate • <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">ESC</kbd>{" "}
                to exit
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Helper function to check if wizard has been completed
export const hasCompletedWizard = (storageKey = "saveplus_interactive_wizard_completed"): boolean => {
  return localStorage.getItem(storageKey) === "true";
};

// Helper function to reset wizard progress
export const resetWizard = (storageKey = "saveplus_interactive_wizard_completed"): void => {
  localStorage.removeItem(storageKey);
};
