import { useState, useEffect, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

const ONBOARDING_COMPLETED_KEY = 'new-user-onboarding-completed';
const ONBOARDING_STEP_KEY = 'new-user-onboarding-step';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // data-tour attribute or 'body' for center
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick?: () => void;
  };
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to $ave+! 🎉',
    description: 'Let me show you around your new financial dashboard. This quick tour will help you get started.',
    target: 'body',
    position: 'center',
  },
  {
    id: 'daily-briefing',
    title: 'Your Daily Summary',
    description: 'Every day, your AI assistant summarizes your finances and highlights what needs attention.',
    target: 'daily-briefing',
    position: 'bottom',
  },
  {
    id: 'balance-card',
    title: 'Track Your Progress',
    description: 'See your total savings at a glance. The trend shows how your balance changed this week.',
    target: 'balance-card',
    position: 'bottom',
  },
  {
    id: 'smart-actions',
    title: 'AI-Powered Actions',
    description: 'Quick suggestions based on your spending patterns. Click any chip to take action instantly!',
    target: 'smart-actions',
    position: 'bottom',
    action: {
      label: 'Got it!',
    },
  },
  {
    id: 'nlq-commander',
    title: 'Ask Anything',
    description: 'Type questions in plain English like "How much did I spend on food?" or press ⌘K anytime.',
    target: 'nlq-commander',
    position: 'top',
  },
  {
    id: 'unified-fab',
    title: 'Quick Actions',
    description: 'Add money, start challenges, or get AI advice anytime with this floating button.',
    target: 'unified-fab',
    position: 'left',
  },
  {
    id: 'complete',
    title: "You're All Set!",
    description: 'Explore your dashboard and start saving smarter. You can replay this tour from Settings anytime.',
    target: 'body',
    position: 'center',
  },
];

interface UseNewUserOnboardingOptions {
  showTutorial?: boolean;
  onComplete?: () => void;
}

export function useNewUserOnboarding(options: UseNewUserOnboardingOptions = {}) {
  const { showTutorial = false, onComplete } = options;
  const prefersReducedMotion = useReducedMotion();
  
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Check if onboarding was already completed
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (completed === 'true') {
      setHasCompleted(true);
      return;
    }

    // Restore step if user refreshed mid-tour
    const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY);
    if (savedStep) {
      const stepIndex = parseInt(savedStep, 10);
      if (!isNaN(stepIndex) && stepIndex < ONBOARDING_STEPS.length) {
        setCurrentStepIndex(stepIndex);
      }
    }

    // Start onboarding if showTutorial flag is set
    if (showTutorial && !completed) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showTutorial]);

  // Save current step
  useEffect(() => {
    if (isActive) {
      localStorage.setItem(ONBOARDING_STEP_KEY, currentStepIndex.toString());
    }
  }, [currentStepIndex, isActive]);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const totalSteps = ONBOARDING_STEPS.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const nextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  }, [currentStepIndex, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setCurrentStepIndex(stepIndex);
    }
  }, [totalSteps]);

  const completeOnboarding = useCallback(() => {
    setIsActive(false);
    setHasCompleted(true);
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    onComplete?.();
  }, [onComplete]);

  const skipOnboarding = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const restartOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    setHasCompleted(false);
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    hasCompleted,
    prefersReducedMotion,
    nextStep,
    prevStep,
    goToStep,
    skipOnboarding,
    completeOnboarding,
    restartOnboarding,
  };
}
