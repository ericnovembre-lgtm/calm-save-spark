import { useEffect, useRef, useState } from 'react';

export interface ComponentTrackingData {
  name: string;
  mountTime: number;
  renderTime: number;
  isMounted: boolean;
  renderCount: number;
  lastRenderTimestamp: number;
}

// Global store for component tracking
const componentRegistry = new Map<string, ComponentTrackingData>();
const listeners = new Set<(data: Map<string, ComponentTrackingData>) => void>();

/**
 * Subscribe to component tracking updates
 */
export function subscribeToComponentTracking(
  callback: (data: Map<string, ComponentTrackingData>) => void
) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Get all tracked components
 */
export function getAllTrackedComponents(): Map<string, ComponentTrackingData> {
  return new Map(componentRegistry);
}

/**
 * Notify all listeners of tracking updates
 */
function notifyListeners() {
  listeners.forEach(listener => listener(new Map(componentRegistry)));
}

/**
 * Hook to track component mount and render performance
 */
export function useComponentTracking(componentName: string) {
  const mountTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(Date.now());
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    const mountTime = Date.now();
    const initialRenderTime = mountTime - mountTimeRef.current;

    // Register component mount
    const data: ComponentTrackingData = {
      name: componentName,
      mountTime: mountTime,
      renderTime: initialRenderTime,
      isMounted: true,
      renderCount: 1,
      lastRenderTimestamp: mountTime,
    };

    componentRegistry.set(componentName, data);
    notifyListeners();

    console.log(`[ComponentTracking] ${componentName} mounted`, {
      renderTime: initialRenderTime,
      timestamp: new Date(mountTime).toISOString(),
    });

    // Cleanup on unmount
    return () => {
      const unmountTime = Date.now();
      const currentData = componentRegistry.get(componentName);
      
      if (currentData) {
        componentRegistry.set(componentName, {
          ...currentData,
          isMounted: false,
        });
        notifyListeners();
      }

      console.log(`[ComponentTracking] ${componentName} unmounted`, {
        lifetime: unmountTime - mountTime,
        timestamp: new Date(unmountTime).toISOString(),
      });
    };
  }, [componentName]);

  // Track each render
  useEffect(() => {
    const renderEnd = Date.now();
    const renderDuration = renderEnd - renderStartRef.current;
    const newCount = renderCount + 1;

    setRenderCount(newCount);

    const currentData = componentRegistry.get(componentName);
    if (currentData) {
      componentRegistry.set(componentName, {
        ...currentData,
        renderTime: renderDuration,
        renderCount: newCount,
        lastRenderTimestamp: renderEnd,
      });
      notifyListeners();
    }

    renderStartRef.current = Date.now();
  });

  return {
    renderCount,
    mountTime: mountTimeRef.current,
  };
}
