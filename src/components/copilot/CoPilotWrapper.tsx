import { CoPilotProvider } from '@/contexts/CoPilotContext';
import { CoPilotOrb } from './CoPilotOrb';
import { CoPilotPanel } from './CoPilotPanel';
import { CoPilotSpotlight } from './CoPilotSpotlight';
import { useIdleDetection } from '@/hooks/useIdleDetection';
import { ReactNode } from 'react';

/**
 * Inner component that uses CoPilot context
 */
function CoPilotUI() {
  // Enable idle detection for proactive help
  useIdleDetection({ 
    idleThreshold: 30000, // 30 seconds
  });
  
  return (
    <>
      <CoPilotOrb />
      <CoPilotPanel />
      <CoPilotSpotlight />
    </>
  );
}

interface CoPilotWrapperProps {
  children: ReactNode;
}

/**
 * CoPilotWrapper - Provides CoPilot context and UI components
 * Must be used inside BrowserRouter
 */
export function CoPilotWrapper({ children }: CoPilotWrapperProps) {
  return (
    <CoPilotProvider>
      {children}
      <CoPilotUI />
    </CoPilotProvider>
  );
}
