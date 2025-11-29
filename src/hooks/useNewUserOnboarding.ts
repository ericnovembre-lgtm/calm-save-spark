import { useState, useEffect, useCallback, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { useSpotlightAnalytics } from './useSpotlightAnalytics';

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
  
  // Analytics tracking
  const analytics = useSpotlightAnalytics(ONBOARDING_STEPS.length);
  const hasTrackedStart = useRef(false);

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
        // Initialize analytics session
        if (!hasTrackedStart.current) {
          analytics.initSession();
          hasTrackedStart.current = true;
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showTutorial, analytics]);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const totalSteps = ONBOARDING_STEPS.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Track step changes
  useEffect(() => {
    if (isActive && currentStep) {
      analytics.trackStepEnter(currentStep.id, currentStepIndex);
    }
  }, [isActive, currentStepIndex, currentStep, analytics]);

  // Save current step
  useEffect(() => {
    if (isActive) {
      localStorage.setItem(ONBOARDING_STEP_KEY, currentStepIndex.toString());
    }
  }, [currentStepIndex, isActive]);

  const nextStep = useCallback(() => {
    // Track step completion before moving
    if (currentStep) {
      analytics.trackStepComplete(currentStep.id, currentStepIndex);
    }
    
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  }, [currentStepIndex, totalSteps, currentStep, analytics]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      // Track going back
      if (currentStep) {
        analytics.trackStepBack(currentStep.id, currentStepIndex);
      }
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex, currentStep, analytics]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setCurrentStepIndex(stepIndex);
    }
  }, [totalSteps]);

  const completeOnboarding = useCallback(() => {
    // Track completion
    analytics.trackCompletion();
    
    setIsActive(false);
    setHasCompleted(true);
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    hasTrackedStart.current = false;
    onComplete?.();
  }, [onComplete, analytics]);

  const skipOnboarding = useCallback(() => {
    // Track skip with current position
    if (currentStep) {
      analytics.trackSkip(currentStep.id, currentStepIndex);
    }
    
    setIsActive(false);
    setHasCompleted(true);
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    hasTrackedStart.current = false;
    onComplete?.();
  }, [currentStep, currentStepIndex, analytics, onComplete]);

  const restartOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    localStorage.removeItem(ONBOARDING_STEP_KEY);
    setHasCompleted(false);
    setCurrentStepIndex(0);
    setIsActive(true);
    
    // Start new analytics session
    analytics.initSession();
    hasTrackedStart.current = true;
  }, [analytics]);

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
