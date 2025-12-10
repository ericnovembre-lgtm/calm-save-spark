/**
 * SentryRouteTracker
 * Tracks route changes and reports page view transactions to Sentry
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageLoad, trackNavigation } from '@/lib/sentry-performance';

export function SentryRouteTracker() {
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);
  const endPageLoadRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;

    // End previous page load tracking
    if (endPageLoadRef.current) {
      endPageLoadRef.current();
    }

    // Track navigation if this isn't the first load
    if (previousPath && previousPath !== currentPath) {
      trackNavigation(previousPath, currentPath);
    }

    // Start tracking new page load
    endPageLoadRef.current = trackPageLoad(currentPath);

    // Update previous path
    previousPathRef.current = currentPath;

    // Cleanup on unmount
    return () => {
      if (endPageLoadRef.current) {
        endPageLoadRef.current();
      }
    };
  }, [location.pathname]);

  return null;
}
