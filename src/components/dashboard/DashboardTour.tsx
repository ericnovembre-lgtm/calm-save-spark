import Joyride, { TooltipRenderProps } from 'react-joyride';
import { useDashboardTour } from '@/hooks/useDashboardTour';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Custom Tooltip Component
 * Glass-morphic styling matching $ave+ design system
 */
function CustomTooltip({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  size,
}: TooltipRenderProps) {
  const isLastStep = index === size - 1;
  const isFirstStep = index === 0;

  return (
    <motion.div
      {...tooltipProps}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-md p-6 rounded-2xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {index + 1} of {size}
          </span>
        </div>
        <Button
          {...closeProps}
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="text-sm text-foreground leading-relaxed mb-6">
        {step.content}
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        {Array.from({ length: size }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index
                ? 'w-6 bg-primary'
                : i < index
                ? 'w-1.5 bg-primary/50'
                : 'w-1.5 bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {!isFirstStep ? (
          <Button
            {...backProps}
            variant="ghost"
            size="sm"
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {continuous && (
          <Button
            {...primaryProps}
            size="sm"
            className="gap-1"
          >
            {isLastStep ? (
              "Let's Go!"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Dashboard Tour Component
 * Wraps react-joyride with custom styling for Next-Gen Dashboard
 */
export function DashboardTour() {
  const { run, steps, stepIndex, handleJoyrideCallback } = useDashboardTour();
  const prefersReducedMotion = useReducedMotion();

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      continuous
      showProgress
      showSkipButton
      disableScrolling={false}
      spotlightClicks
      tooltipComponent={CustomTooltip}
      floaterProps={{
        disableAnimation: prefersReducedMotion,
      }}
      styles={{
        options: {
          arrowColor: 'hsl(var(--background))',
          backgroundColor: 'hsl(var(--background))',
          overlayColor: 'rgba(0, 0, 0, 0.6)',
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
          zIndex: 10000,
        },
        spotlight: {
          borderRadius: 16,
        },
        overlay: {
          backdropFilter: prefersReducedMotion ? 'none' : 'blur(4px)',
        },
      }}
    />
  );
}
