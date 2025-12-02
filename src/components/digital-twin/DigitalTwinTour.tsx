import Joyride, { CallBackProps, Step } from 'react-joyride';

interface DigitalTwinTourProps {
  run: boolean;
  steps: Step[];
  stepIndex: number;
  onCallback: (data: CallBackProps) => void;
}

export function DigitalTwinTour({ run, steps, stepIndex, onCallback }: DigitalTwinTourProps) {
  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={onCallback}
      styles={{
        options: {
          primaryColor: '#06b6d4', // cyan-500
          zIndex: 10000,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          borderRadius: '12px',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'white',
          fontSize: '14px',
          padding: '20px',
          backdropFilter: 'blur(20px)',
        },
        tooltipContent: {
          fontFamily: 'ui-monospace, monospace',
          padding: '12px 0',
        },
        buttonNext: {
          backgroundColor: '#06b6d4',
          color: 'black',
          fontWeight: 'bold',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '13px',
        },
        buttonBack: {
          color: 'rgba(255, 255, 255, 0.6)',
          marginRight: '8px',
        },
        buttonSkip: {
          color: 'rgba(255, 255, 255, 0.4)',
        },
        beacon: {
          borderColor: '#06b6d4',
          backgroundColor: '#06b6d4',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
        spotlight: {
          border: '2px solid #06b6d4',
          borderRadius: '8px',
        },
      }}
      locale={{
        back: '← Back',
        close: 'Close',
        last: 'Finish 🎉',
        next: 'Next →',
        skip: 'Skip Tour',
      }}
    />
  );
}
