import { useState, useEffect } from 'react';
import { Step, CallBackProps, STATUS } from 'react-joyride';

export const usePotsTour = () => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to Visual Vaults! Let me show you how to turn your dreams into reality.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="dream-generator"]',
      content: 'Simply describe what you\'re saving for, and AI will suggest an amount and find a perfect image. Try it: "Trip to Japan" or "New laptop"',
      placement: 'bottom',
    },
    {
      target: '[data-tour="manual-button"]',
      content: 'Prefer to create manually? Use this button to set your own details.',
      placement: 'left',
    },
    {
      target: '[data-tour="pot-card"]',
      content: 'Each vault shows your progress with beautiful visuals. Watch the background image reveal as you save!',
      placement: 'top',
    },
    {
      target: '[data-tour="pot-actions"]',
      content: 'Edit, archive, or delete your vault. Click the archive icon to keep completed vaults organized.',
      placement: 'left',
    },
    {
      target: '[data-tour="add-funds"]',
      content: 'Add funds anytime to grow your vault. You can also set up automatic transfers!',
      placement: 'top',
    },
    {
      target: '[data-tour="automation-card"]',
      content: 'Set up recurring deposits to automatically fill your vaults every week or month.',
      placement: 'bottom',
    },
  ];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('pots-tour-completed');
    if (!hasSeenTour) {
      setTimeout(() => setRun(true), 1000);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem('pots-tour-completed', 'true');
    }

    setStepIndex(index);
  };

  const resetTour = () => {
    localStorage.removeItem('pots-tour-completed');
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
