import { CoPilotProvider, useCoPilot } from '@/contexts/CoPilotContext';
import { CoPilotOrb } from './CoPilotOrb';
import { CoPilotPanel } from './CoPilotPanel';
import { CoPilotSpotlight } from './CoPilotSpotlight';
import { ProactivePulse } from './ProactivePulse';
import { useIdleDetection } from '@/hooks/useIdleDetection';
import { useProactiveNudges } from '@/hooks/useProactiveNudges';
import { useAnomalyAlerts } from '@/hooks/useAnomalyAlerts';
import { ReactNode, useEffect } from 'react';

/**
 * Inner component that uses CoPilot context and connects alerts
 */
function CoPilotUI() {
  const { setPulse } = useCoPilot();
  const { nudges } = useProactiveNudges();
  const { anomalies } = useAnomalyAlerts();
  
  // Enable idle detection for proactive help
  useIdleDetection({ 
    idleThreshold: 30000, // 30 seconds
  });
  
  // Connect proactive nudges to pulse system
  useEffect(() => {
    if (nudges && nudges.length > 0) {
      const topNudge = nudges[0];
      if (topNudge.priority >= 3) {
        setPulse('urgent', topNudge.message);
      } else if (topNudge.priority === 2) {
        setPulse('opportunity', topNudge.message);
      }
    }
  }, [nudges, setPulse]);
  
  // Connect anomaly alerts to pulse system
  useEffect(() => {
    if (anomalies && anomalies.length > 0) {
      const unresolvedAnomalies = anomalies.filter(a => !a.resolved_at && !a.false_positive);
      if (unresolvedAnomalies.length > 0) {
        const topAnomaly = unresolvedAnomalies[0];
        if (topAnomaly.severity === 'critical' || topAnomaly.severity === 'high') {
          // Use anomaly_type as message since description is in factors array
          const message = topAnomaly.factors?.[0]?.description || topAnomaly.anomaly_type;
          setPulse('anomaly', message);
        }
      }
    }
  }, [anomalies, setPulse]);
  
  return (
    <>
      <CoPilotOrb />
      <CoPilotPanel />
      <CoPilotSpotlight />
      <ProactivePulse />
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
