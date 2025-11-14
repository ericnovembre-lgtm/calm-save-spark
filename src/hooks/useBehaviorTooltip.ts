/**
 * Behavior-triggered tooltip hook
 * Shows contextual help after user pauses on a field for 5+ seconds
 */

import { useState, useEffect, useRef } from 'react';

interface TooltipConfig {
  /** Delay in ms before showing tooltip (default: 5000) */
  delay?: number;
  /** Whether tooltip is enabled */
  enabled?: boolean;
}

export const useBehaviorTooltip = (
  helpText: string,
  config: TooltipConfig = {}
) => {
  const { delay = 5000, enabled = true } = config;
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownRef = useRef(false);

  const handleFocus = () => {
    if (!enabled || hasShownRef.current) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to show tooltip after delay
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
      hasShownRef.current = true;
    }, delay);
  };

  const handleBlur = () => {
    // Clear timeout if user leaves field before delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  const handleChange = () => {
    // User is typing, hide tooltip and mark as shown
    if (showTooltip) {
      setShowTooltip(false);
      hasShownRef.current = true;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    showTooltip,
    tooltipProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
      onChange: handleChange,
    },
    helpText,
  };
};
