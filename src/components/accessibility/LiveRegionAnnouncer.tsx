import { useEffect, useRef } from 'react';

interface LiveRegionAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

/**
 * Component for announcing dynamic content to screen readers
 * Useful for balance changes, achievement unlocks, etc.
 */
export function LiveRegionAnnouncer({ 
  message, 
  priority = 'polite' 
}: LiveRegionAnnouncerProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear and re-add to ensure announcement
      regionRef.current.textContent = '';
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

/**
 * Hook for programmatic announcements
 */
export function useAnnounce() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    
    document.body.appendChild(region);
    
    setTimeout(() => {
      region.textContent = message;
    }, 100);

    setTimeout(() => {
      document.body.removeChild(region);
    }, 3000);
  };

  return { announce };
}
