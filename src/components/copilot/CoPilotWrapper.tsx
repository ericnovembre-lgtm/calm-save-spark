import { useEffect, useRef } from 'react';
import { CoPilotProvider, useCoPilot } from '@/contexts/CoPilotContext';
import { UnifiedCoPilotFAB } from './UnifiedCoPilotFAB';
import { CoPilotPanel } from './CoPilotPanel';
import { CoPilotSpotlight } from './CoPilotSpotlight';
import { useProactiveNudges } from '@/hooks/useProactiveNudges';
import { useAnomalyAlerts } from '@/hooks/useAnomalyAlerts';
import { useIdleDetection } from '@/hooks/useIdleDetection';
import type { PulseState } from '@/types/copilot';
import { ReactNode } from 'react';

interface CoPilotWrapperProps {
  children: ReactNode;
}

function CoPilotUI() {
  const { setPulse, isOpen } = useCoPilot();
  const { nudges } = useProactiveNudges();
  const { anomalies, scanForAnomalies, summary } = useAnomalyAlerts();
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScanRef = useRef<number>(0);
  
  // Idle detection for proactive engagement
  useIdleDetection({
    idleThreshold: 30000, // 30 seconds
    onIdle: () => {
      // Show helpful tip when user is idle
      if (!isOpen) {
        setPulse('help', 'Need help? I can assist with budgets, goals, or transactions!');
      }
    }
  });
  
  // Connect proactive nudges to pulse system
  useEffect(() => {
    if (nudges && nudges.length > 0) {
      const topNudge = nudges[0];
      const priority = topNudge.priority || 0;
      
      // Map priority to pulse state
      let pulseState: PulseState = 'help';
      if (priority >= 8) {
        pulseState = 'urgent';
      } else if (priority >= 5) {
        pulseState = 'anomaly';
      } else if (priority >= 3) {
        pulseState = 'opportunity';
      }
      
      setPulse(pulseState, topNudge.message);
    }
  }, [nudges, setPulse]);
  
  // Connect anomaly alerts to pulse system with severity mapping
  useEffect(() => {
    if (anomalies && anomalies.length > 0) {
      const topAnomaly = anomalies[0];
      
      // Map severity to pulse state
      let pulseState: PulseState = 'help';
      switch (topAnomaly.severity) {
        case 'critical':
          pulseState = 'urgent';
          break;
        case 'high':
          pulseState = 'urgent';
          break;
        case 'medium':
          pulseState = 'anomaly';
          break;
        case 'low':
          pulseState = 'help';
          break;
      }
      
      // Extract description from factors if available
      const factorDescription = topAnomaly.factors?.[0]?.description || topAnomaly.anomaly_type;
      const message = `Detected: ${factorDescription}`;
      
      setPulse(pulseState, message);
    }
  }, [anomalies, setPulse]);
  
  // Automatic anomaly scanning on mount and periodically
  useEffect(() => {
    const performScan = () => {
      const now = Date.now();
      // Debounce: only scan if at least 5 minutes have passed
      if (now - lastScanRef.current >= 5 * 60 * 1000) {
        lastScanRef.current = now;
        scanForAnomalies.mutate();
      }
    };
    
    // Initial scan on mount
    performScan();
    
    // Scan every 5 minutes
    scanIntervalRef.current = setInterval(performScan, 5 * 60 * 1000);
    
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [scanForAnomalies]);
  
  // Show summary notification if multiple anomalies
  useEffect(() => {
    if (summary.total > 1) {
      const criticalOrHigh = summary.critical + summary.high;
      if (criticalOrHigh > 0) {
        setPulse('urgent', `${criticalOrHigh} critical alerts need your attention`);
      }
    }
  }, [summary, setPulse]);
  
  return (
    <>
      <CoPilotPanel />
      <CoPilotSpotlight />
    </>
  );
}

export function CoPilotWrapper({ children }: CoPilotWrapperProps) {
  return (
    <CoPilotProvider>
      {children}
      <CoPilotUI />
    </CoPilotProvider>
  );
}
