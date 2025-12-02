import { useState, useEffect, useCallback } from 'react';
import { Step, CallBackProps, STATUS } from 'react-joyride';

const TOUR_STORAGE_KEY = 'digital-twin-tour-completed';

/**
 * Digital Twin Tour Hook
 * Guides users through key features with auto-injected example event
 */
export const useDigitalTwinTour = (addEvent?: (event: any, year: number) => void) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to your Digital Twin! This living financial simulation shows how life events impact your future. Let\'s take a quick tour.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="dt-avatar"]',
      content: 'Your holographic avatar changes color based on financial health: 🟢 Green = Thriving, 🟡 Yellow = Neutral, 🔴 Red = Struggling',
      placement: 'bottom',
    },
    {
      target: '[data-tour="dt-timeline"]',
      content: 'Drag the timeline to see your net worth at different ages. The gradient shows your financial journey from today to retirement.',
      placement: 'top',
    },
    {
      target: '[data-tour="dt-events"]',
      content: 'Drag life events from this sidebar onto your timeline to simulate their impact. Let\'s try one!',
      placement: 'right',
    },
    {
      target: 'body',
      content: 'I\'ve added a "New Job +30%" event at age 35 as an example. Watch your net worth increase! 📈',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="dt-projections"]',
      content: 'View Monte Carlo projections to see the probability range of your financial future. Shows best/worst case scenarios.',
      placement: 'left',
    },
    {
      target: '[data-tour="dt-save"]',
      content: 'Save scenarios to the database to compare different life paths. You can load them anytime!',
      placement: 'left',
    },
    {
      target: '[data-tour="dt-share"]',
      content: 'Share your scenario via email or generate a public link with a preview image. You\'re all set! 🎉',
      placement: 'left',
    },
  ];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(TOUR_STORAGE_KEY);
    
    if (!hasSeenTour) {
      // Delay tour start to let page render
      const timer = setTimeout(() => {
        setRun(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, action, type } = data;

    // Auto-inject example event at step 4
    if (index === 4 && type === 'step:after' && action === 'next' && addEvent) {
      const exampleEvent = {
        id: 'job',
        icon: '💼',
        label: 'New Job +30%',
        impact: 50000,
        description: 'Salary increase',
        color: 'border-green-500',
      };
      addEvent(exampleEvent, 35);
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    }

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
