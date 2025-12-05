import { useCallback, useRef } from 'react';

type Priority = 'polite' | 'assertive';

interface AnnounceOptions {
  priority?: Priority;
  clearAfter?: number;
}

interface QueuedAnnouncement {
  message: string;
  priority: Priority;
  timestamp: number;
}

/**
 * Unified hook for screen reader announcements
 * Provides a centralized way to announce content to assistive technologies
 */
export function useScreenReaderAnnounce() {
  const politeRef = useRef<HTMLDivElement | null>(null);
  const assertiveRef = useRef<HTMLDivElement | null>(null);
  const queueRef = useRef<QueuedAnnouncement[]>([]);
  const processingRef = useRef(false);

  // Get or create live region elements
  const getLiveRegion = useCallback((priority: Priority) => {
    const id = `sr-live-region-${priority}`;
    let element = document.getElementById(id);

    if (!element) {
      element = document.createElement('div');
      element.id = id;
      element.setAttribute('role', 'status');
      element.setAttribute('aria-live', priority);
      element.setAttribute('aria-atomic', 'true');
      element.className = 'sr-only';
      element.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(element);
    }

    return element;
  }, []);

  // Process announcement queue
  const processQueue = useCallback(() => {
    if (processingRef.current || queueRef.current.length === 0) return;

    processingRef.current = true;
    const announcement = queueRef.current.shift()!;
    const element = getLiveRegion(announcement.priority);

    // Clear first to ensure announcement triggers
    element.textContent = '';

    // Use requestAnimationFrame to ensure DOM update
    requestAnimationFrame(() => {
      element.textContent = announcement.message;

      // Clear after delay and process next
      setTimeout(() => {
        element.textContent = '';
        processingRef.current = false;
        processQueue();
      }, 1000);
    });
  }, [getLiveRegion]);

  // Main announce function
  const announce = useCallback(
    (message: string, options: AnnounceOptions = {}) => {
      const { priority = 'polite' } = options;

      queueRef.current.push({
        message,
        priority,
        timestamp: Date.now(),
      });

      processQueue();
    },
    [processQueue]
  );

  // Announce immediately (skips queue)
  const announceImmediate = useCallback(
    (message: string, priority: Priority = 'assertive') => {
      const element = getLiveRegion(priority);
      element.textContent = '';
      requestAnimationFrame(() => {
        element.textContent = message;
      });
    },
    [getLiveRegion]
  );

  // Format and announce currency
  const announceCurrency = useCallback(
    (amount: number, currency = 'USD') => {
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(amount);
      announce(formatted);
    },
    [announce]
  );

  // Announce progress
  const announceProgress = useCallback(
    (current: number, total: number, label?: string) => {
      const percentage = Math.round((current / total) * 100);
      const message = label
        ? `${label}: ${percentage}% complete`
        : `${percentage}% complete`;
      announce(message);
    },
    [announce]
  );

  // Announce loading state
  const announceLoading = useCallback(
    (isLoading: boolean, context?: string) => {
      if (isLoading) {
        announce(context ? `Loading ${context}` : 'Loading', { priority: 'polite' });
      } else {
        announce(context ? `${context} loaded` : 'Content loaded', { priority: 'polite' });
      }
    },
    [announce]
  );

  // Announce error
  const announceError = useCallback(
    (message: string) => {
      announce(`Error: ${message}`, { priority: 'assertive' });
    },
    [announce]
  );

  // Announce success
  const announceSuccess = useCallback(
    (message: string) => {
      announce(message, { priority: 'polite' });
    },
    [announce]
  );

  // Clear all announcements
  const clear = useCallback(() => {
    queueRef.current = [];
    const polite = document.getElementById('sr-live-region-polite');
    const assertive = document.getElementById('sr-live-region-assertive');
    if (polite) polite.textContent = '';
    if (assertive) assertive.textContent = '';
  }, []);

  return {
    announce,
    announceImmediate,
    announceCurrency,
    announceProgress,
    announceLoading,
    announceError,
    announceSuccess,
    clear,
  };
}

// Global announce function for use outside React
export function globalAnnounce(message: string, priority: Priority = 'polite') {
  const id = `sr-live-region-${priority}`;
  let element = document.getElementById(id);

  if (!element) {
    element = document.createElement('div');
    element.id = id;
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', priority);
    element.setAttribute('aria-atomic', 'true');
    element.className = 'sr-only';
    element.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(element);
  }

  element.textContent = '';
  requestAnimationFrame(() => {
    element!.textContent = message;
  });
}
