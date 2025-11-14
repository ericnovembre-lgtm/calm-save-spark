/**
 * Accessibility wrapper for onboarding steps
 * Ensures ARIA compliance, keyboard navigation, and screen reader support
 */

import { ReactNode, useEffect, useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AccessibilityWrapperProps {
  children: ReactNode;
  stepName: string;
  stepNumber: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
}

export function AccessibilityWrapper({
  children,
  stepName,
  stepNumber,
  totalSteps,
  onNext,
  onPrevious,
  canGoNext = true,
  canGoPrevious = true,
}: AccessibilityWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Announce step change to screen readers
  useEffect(() => {
    const announcement = `Step ${stepNumber} of ${totalSteps}: ${stepName}`;
    
    // Create live region announcement
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = announcement;
    
    document.body.appendChild(liveRegion);
    
    // Clean up
    const timeout = setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);

    return () => {
      clearTimeout(timeout);
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
    };
  }, [stepName, stepNumber, totalSteps]);

  // Focus management - focus container on mount
  useEffect(() => {
    if (containerRef.current) {
      // Small delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        containerRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [stepNumber]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow natural form navigation
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          if (canGoNext && onNext) {
            e.preventDefault();
            onNext();
          }
          break;
        case 'ArrowLeft':
        case 'PageUp':
          if (canGoPrevious && onPrevious) {
            e.preventDefault();
            onPrevious();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrevious, canGoNext, canGoPrevious]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={`${stepName} - Step ${stepNumber} of ${totalSteps}`}
      aria-describedby="onboarding-instructions"
      tabIndex={-1}
      className="focus:outline-none"
      data-reduced-motion={prefersReducedMotion}
    >
      {/* Screen reader instructions */}
      <div id="onboarding-instructions" className="sr-only">
        Use arrow keys or Page Up/Page Down to navigate between steps. 
        Press Tab to navigate within the current step.
        {canGoNext && ' Press Enter to continue to the next step.'}
      </div>

      {/* Step content */}
      {children}

      {/* Skip navigation for screen readers */}
      <div className="sr-only" aria-live="polite">
        {stepNumber === totalSteps ? (
          'This is the final step. Complete the form to finish onboarding.'
        ) : (
          `${totalSteps - stepNumber} steps remaining.`
        )}
      </div>
    </div>
  );
}
