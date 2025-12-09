import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Mic, CheckCircle2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { haptics } from '@/lib/haptics';
import { TUTORIAL_STEPS, TutorialStep } from '@/hooks/useVoiceCommandTutorial';

interface VoiceCommandTutorialProps {
  isOpen: boolean;
  currentStep: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onTryCommand?: (command: string) => void;
}

export function VoiceCommandTutorial({
  isOpen,
  currentStep,
  onClose,
  onNext,
  onPrev,
  onTryCommand,
}: VoiceCommandTutorialProps) {
  const prefersReducedMotion = useReducedMotion();
  const step = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleTryCommand = (command: string) => {
    haptics.buttonPress();
    onTryCommand?.(command);
    onClose();
  };

  const getCategoryColor = (category: TutorialStep['category']) => {
    switch (category) {
      case 'basic':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'navigation':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'action':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'tips':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-muted-foreground bg-muted/50 border-border';
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
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
          />

          {/* Tutorial Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-[90vw] max-w-md z-50",
              "bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  getCategoryColor(step.category)
                )}>
                  <span className="text-lg">{step.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Welcome animation for first step */}
              {isFirstStep && !prefersReducedMotion && (
                <motion.div
                  className="flex justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <div className="relative">
                    <motion.div
                      className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          '0 0 0 0 hsl(var(--primary) / 0.2)',
                          '0 0 0 20px hsl(var(--primary) / 0)',
                        ],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Mic className="w-10 h-10 text-primary" />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Description */}
              <p className="text-muted-foreground text-center mb-6">
                {step.description}
              </p>

              {/* Examples */}
              {step.examples.length > 0 && (
                <div className="space-y-2">
                  {step.category === 'tips' ? (
                    // Tips are displayed as list items
                    <ul className="space-y-3">
                      {step.examples.map((tip, index) => (
                        <motion.li
                          key={tip}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    // Commands are interactive buttons
                    <div className="flex flex-wrap gap-2 justify-center">
                      {step.examples.map((example, index) => (
                        <motion.button
                          key={example}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTryCommand(example)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                            "bg-muted/50 hover:bg-muted border border-border/50",
                            "text-foreground transition-colors cursor-pointer"
                          )}
                        >
                          <Mic className="w-3 h-3 text-primary" />
                          <span>"{example}"</span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrev}
                disabled={isFirstStep}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              <div className="flex gap-1">
                {TUTORIAL_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>

              <Button
                size="sm"
                onClick={onNext}
                className="gap-1"
              >
                {isLastStep ? 'Done' : 'Next'}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Small help button component to trigger tutorial
export function VoiceHelpButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-muted-foreground hover:text-foreground"
      onClick={onClick}
      aria-label="Voice command help"
    >
      <HelpCircle className="w-4 h-4" />
    </Button>
  );
}
