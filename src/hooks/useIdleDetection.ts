import { useEffect, useRef, useCallback } from 'react';
import { useCoPilot } from '@/contexts/CoPilotContext';

interface UseIdleDetectionOptions {
  idleThreshold?: number; // milliseconds before considered idle
  enabled?: boolean;
  onIdle?: () => void;
}

export function useIdleDetection({
  idleThreshold = 30000, // 30 seconds default
  enabled = true,
  onIdle,
}: UseIdleDetectionOptions = {}) {
  const { contextState, setPulse, pulseNotification } = useCoPilot();
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);
  
  const clearIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, []);
  
  const startIdleTimeout = useCallback(() => {
    clearIdleTimeout();
    
    if (!enabled) return;
    
    idleTimeoutRef.current = setTimeout(() => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        
        // Trigger pulse notification
        setPulse(
          'help',
          'Need help with this page?',
          undefined,
          10000 // Auto-dismiss after 10 seconds
        );
        
        onIdle?.();
      }
    }, idleThreshold);
  }, [enabled, idleThreshold, setPulse, clearIdleTimeout, onIdle]);
  
  // Reset idle detection on user interaction
  useEffect(() => {
    const handleInteraction = () => {
      hasTriggeredRef.current = false;
      startIdleTimeout();
    };
    
    if (enabled) {
      window.addEventListener('mousemove', handleInteraction);
      window.addEventListener('keydown', handleInteraction);
      window.addEventListener('click', handleInteraction);
      window.addEventListener('scroll', handleInteraction);
      window.addEventListener('touchstart', handleInteraction);
      
      // Start initial timeout
      startIdleTimeout();
    }
    
    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      clearIdleTimeout();
    };
  }, [enabled, startIdleTimeout, clearIdleTimeout]);
  
  // Reset when route changes
  useEffect(() => {
    hasTriggeredRef.current = false;
    startIdleTimeout();
  }, [contextState.currentRoute, startIdleTimeout]);
  
  return {
    isIdle: hasTriggeredRef.current,
    reset: () => {
      hasTriggeredRef.current = false;
      startIdleTimeout();
    },
  };
}
