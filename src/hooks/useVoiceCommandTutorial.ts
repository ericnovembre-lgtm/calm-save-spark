import { useState, useEffect, useCallback } from 'react';

const TUTORIAL_COMPLETED_KEY = 'voice-command-tutorial-completed';
const TUTORIAL_SEEN_KEY = 'voice-command-tutorial-seen';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  category: 'basic' | 'navigation' | 'action' | 'tips';
  examples: string[];
  icon: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Voice Commands',
    description: 'Control your finances hands-free with natural voice commands.',
    category: 'basic',
    examples: [],
    icon: '🎤',
  },
  {
    id: 'basic',
    title: 'Basic Commands',
    description: 'Ask about your balance, spending, and budgets using everyday language.',
    category: 'basic',
    examples: [
      'Check my balance',
      'How much did I spend today?',
      'What\'s my budget status?',
    ],
    icon: '💬',
  },
  {
    id: 'navigation',
    title: 'Navigation',
    description: 'Navigate to any page in the app just by speaking.',
    category: 'navigation',
    examples: [
      'Show my transactions',
      'Open the coach',
      'Check my credit score',
      'View investments',
    ],
    icon: '🧭',
  },
  {
    id: 'actions',
    title: 'Quick Actions',
    description: 'Take action on your finances without typing.',
    category: 'action',
    examples: [
      'Transfer $50 to savings',
      'Create a goal for vacation',
      'Show upcoming bills',
    ],
    icon: '⚡',
  },
  {
    id: 'tips',
    title: 'Pro Tips',
    description: 'Get the most out of voice commands with these tips.',
    category: 'tips',
    examples: [
      'Speak naturally - the AI understands context',
      'Voice auto-submits after 1.5s of silence',
      'Tap the mic again to cancel listening',
    ],
    icon: '💡',
  },
];

export function useVoiceCommandTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_COMPLETED_KEY) === 'true';
    const seen = localStorage.getItem(TUTORIAL_SEEN_KEY) === 'true';
    setHasCompleted(completed);
    setHasSeen(seen);
  }, []);

  // Open tutorial
  const openTutorial = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
    localStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
    setHasSeen(true);
  }, []);

  // Close tutorial
  const closeTutorial = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Mark as completed
  const completeTutorial = useCallback(() => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    setHasCompleted(true);
    setIsOpen(false);
  }, []);

  // Go to next step
  const nextStep = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  }, [currentStep, completeTutorial]);

  // Go to previous step
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Reset tutorial (for settings)
  const resetTutorial = useCallback(() => {
    localStorage.removeItem(TUTORIAL_COMPLETED_KEY);
    localStorage.removeItem(TUTORIAL_SEEN_KEY);
    setHasCompleted(false);
    setHasSeen(false);
    setCurrentStep(0);
  }, []);

  // Check if should show tutorial on first voice tap
  const shouldShowOnFirstVoiceTap = !hasSeen && !hasCompleted;

  return {
    isOpen,
    currentStep,
    totalSteps: TUTORIAL_STEPS.length,
    currentStepData: TUTORIAL_STEPS[currentStep],
    hasCompleted,
    hasSeen,
    shouldShowOnFirstVoiceTap,
    openTutorial,
    closeTutorial,
    completeTutorial,
    nextStep,
    prevStep,
    resetTutorial,
  };
}
