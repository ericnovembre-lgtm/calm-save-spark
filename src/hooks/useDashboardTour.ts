import { useState, useEffect } from 'react';
import { Step, CallBackProps, STATUS } from 'react-joyride';

const TOUR_STORAGE_KEY = 'dashboard-tour-completed';

/**
 * Dashboard Tour Hook
 * Manages guided tour state for Next-Gen Dashboard features
 */
export const useDashboardTour = () => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to your Next-Gen Dashboard! Let me show you the powerful AI features that help you manage your finances effortlessly.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="daily-briefing"]',
      content: 'Your AI assistant greets you with a personalized financial summary each day. It analyzes your priorities and highlights what matters most.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="smart-actions"]',
      content: 'Smart Action Chips are AI-powered suggestions based on your financial data. Click any chip to take immediate action.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="nlq-commander"]',
      content: 'Ask anything about your finances in plain English! Try "Show me coffee spending" or press ⌘K to open the command palette.',
      placement: 'top',
    },
    {
      target: '[data-tour="widget-grid"]',
      content: 'Drag widgets to reorder your dashboard. The AI automatically prioritizes urgent items - watch for pulsing amber borders!',
      placement: 'top',
    },
    {
      target: '[data-tour="upcoming-bills"]',
      content: 'Never miss a payment! Bills due soon pulse amber and expand automatically to grab your attention.',
      placement: 'left',
    },
    {
      target: '[data-tour="aurora-background"]',
      content: 'Notice the subtle background gradients? They shift from green (gains) to rose (losses) based on your financial sentiment.',
      placement: 'center',
    },
    {
      target: '[data-tour="unified-fab"]',
      content: 'Quick access to common actions: add funds, start a challenge, or get AI advice anytime. You\'re all set!',
      placement: 'left',
    },
  ];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!hasSeenTour) {
      // Delay tour start to let dashboard render
      const timer = setTimeout(() => setRun(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, action, type } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    }

    // Update step index for controlled tour
    if (type === 'step:after') {
      setStepIndex(index + (action === 'prev' ? -1 : 1));
    }
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setStepIndex(0);
    setRun(true);
  };

  const startTour = () => {
    setStepIndex(0);
    setRun(true);
  };

  return {
    run,
    steps,
    stepIndex,
    handleJoyrideCallback,
    resetTour,
    startTour,
  };
};
