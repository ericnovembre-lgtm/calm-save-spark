/**
 * Post-onboarding tutorial overlay with spotlight effects
 * Guides users through key dashboard features after completing onboarding
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'balance-card',
    title: 'Your Savings Balance',
    description: 'Track your total savings progress here. This updates in real-time as you save.',
    target: '[data-tutorial="balance-card"]',
    position: 'bottom',
  },
  {
    id: 'goals-section',
    title: 'Savings Goals',
    description: 'Create and manage multiple savings goals. Set targets and deadlines to stay motivated.',
    target: '[data-tutorial="goals-section"]',
    position: 'top',
  },
  {
    id: 'quick-transfer',
    title: 'Quick Transfer',
    description: 'Transfer money to your savings with one click. Build your savings habit effortlessly.',
    target: '[data-tutorial="quick-transfer"]',
    position: 'left',
  },
  {
    id: 'automations',
    title: 'Automation Rules',
    description: 'Set up automatic savings rules. Save without thinking - round-ups, scheduled transfers, and more.',
    target: '[data-tutorial="automations"]',
    position: 'top',
  },
];

interface DashboardTutorialOverlayProps {
  /** Whether to show the tutorial */
  show: boolean;
  /** Callback when tutorial is completed */
  onComplete: () => void;
  /** Callback when tutorial is skipped */
  onSkip: () => void;
}

export const DashboardTutorialOverlay = ({
  show,
  onComplete,
  onSkip,
}: DashboardTutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStepData = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  // Update target element position when step changes
  useEffect(() => {
    if (!show || !currentStepData) return;

    const updateTargetPosition = () => {
      const target = document.querySelector(currentStepData.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll target into view smoothly
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    };

    // Initial position
    updateTargetPosition();

    // Update on window resize
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    // Track step view
    trackEvent('tutorial_step_viewed', {
      step: currentStepData.id,
      step_number: currentStep + 1,
      total_steps: TUTORIAL_STEPS.length,
    });

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [show, currentStep, currentStepData]);

  const handleNext = () => {
    trackEvent('tutorial_step_completed', {
      step: currentStepData.id,
      step_number: currentStep + 1,
    });

    if (isLastStep) {
      trackEvent('tutorial_completed', {
        total_steps: TUTORIAL_STEPS.length,
      });
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    trackEvent('tutorial_skipped', {
      step: currentStepData.id,
      step_number: currentStep + 1,
      total_steps: TUTORIAL_STEPS.length,
    });
    onSkip();
  };

  const getTooltipPosition = () => {
    if (!targetRect) return {};

    const padding = 16;
    const tooltipWidth = 320;

    switch (currentStepData.position) {
      case 'top':
        return {
          top: targetRect.top - padding,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - padding,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + padding,
          transform: 'translate(0, -50%)',
        };
      default:
        return {};
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay backdrop with spotlight cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
            style={{
              background: targetRect
                ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${
                    targetRect.top + targetRect.height / 2
                  }px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 20}px, rgba(0, 0, 0, 0.7) ${
                    Math.max(targetRect.width, targetRect.height) / 2 + 60
                  }px)`
                : 'rgba(0, 0, 0, 0.7)',
            }}
          />

          {/* Spotlight border around target */}
          {targetRect && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-[101] pointer-events-none"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                border: '3px solid hsl(var(--primary))',
                borderRadius: '12px',
                boxShadow: '0 0 0 2px hsl(var(--background)), 0 0 20px hsl(var(--primary) / 0.5)',
              }}
            />
          )}

          {/* Tutorial tooltip */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              'fixed z-[102] w-80 p-6 rounded-orbital',
              'bg-background border border-border shadow-2xl'
            )}
            style={getTooltipPosition()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2">
                  Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                </Badge>
                <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2 -mt-2"
                onClick={handleSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-muted rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6">{currentStepData.description}</p>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={handleSkip} className="flex-1">
                Skip Tutorial
              </Button>
              <Button onClick={handleNext} className="flex-1">
                {isLastStep ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Got it!
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
