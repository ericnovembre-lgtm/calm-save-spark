import { useState, useEffect } from 'react';

interface ProgressiveLoadConfig {
  priority: 'critical' | 'high' | 'medium' | 'low';
  delay?: number;
}

/**
 * Hook for progressive content loading
 * Loads content based on priority with configurable delays
 */
export function useProgressiveLoad(config: ProgressiveLoadConfig) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const delays = {
      critical: 0,
      high: 100,
      medium: 300,
      low: 500,
    };

    const delay = config.delay ?? delays[config.priority];

    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [config.priority, config.delay]);

  return shouldLoad;
}

/**
 * Hook for batched progressive loading of multiple sections
 */
export function useProgressiveSections() {
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());

  const loadSection = (sectionId: string, delay: number = 0) => {
    setTimeout(() => {
      setLoadedSections((prev) => new Set(prev).add(sectionId));
    }, delay);
  };

  const isSectionLoaded = (sectionId: string) => loadedSections.has(sectionId);

  useEffect(() => {
    // Load critical sections immediately
    loadSection('balance', 0);
    loadSection('goals', 100);
    loadSection('charts', 300);
    loadSection('insights', 500);
    loadSection('recommendations', 700);
  }, []);

  return { loadedSections, loadSection, isSectionLoaded };
}
