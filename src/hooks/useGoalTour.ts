import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

export const useGoalTour = () => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to your Goals page! Let me show you around.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="new-goal-button"]',
      content: 'Click here to create your first savings goal. Set a target amount and optional deadline.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="goal-card"]',
      content: 'Each goal card shows your progress with beautiful visualizations. Click the menu icon for actions like adding funds, editing, or deleting.',
      placement: 'top',
    },
    {
      target: '[data-tour="ai-insights"]',
      content: 'Get AI-powered insights and recommendations to optimize your savings strategy.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="quick-actions"]',
      content: 'Use quick actions for faster access to common tasks.',
      placement: 'left',
    },
  ];

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('goals-tour-completed');
    if (!hasSeenTour) {
      // Delay tour start slightly for better UX
      setTimeout(() => setRun(true), 1000);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem('goals-tour-completed', 'true');
    }

    setStepIndex(index);
  };

  const resetTour = () => {
    localStorage.removeItem('goals-tour-completed');
    setStepIndex(0);
    setRun(true);
  };

  return {
    run,
    steps,
    stepIndex,
    handleJoyrideCallback,
    resetTour,
  };
};
