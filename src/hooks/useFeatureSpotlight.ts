import { useState, useEffect, useCallback } from 'react';
import { FEATURE_UPDATES, useWhatsNew } from './useWhatsNew';

const SPOTLIGHT_SEEN_KEY = 'feature-spotlight-seen';

interface SpotlightFeature {
  id: string;
  title: string;
  description: string;
  tourStep: string;
}

export function useFeatureSpotlight() {
  const [activeFeature, setActiveFeature] = useState<SpotlightFeature | null>(null);
  const [pendingFeatures, setPendingFeatures] = useState<SpotlightFeature[]>([]);
  const [isActive, setIsActive] = useState(false);
  const { showWhatsNew, currentVersion } = useWhatsNew();

  // Get seen features from localStorage
  const getSeenFeatures = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem(SPOTLIGHT_SEEN_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Save seen feature to localStorage
  const saveSeenFeature = useCallback((featureId: string) => {
    try {
      const seen = getSeenFeatures();
      if (!seen.includes(featureId)) {
        localStorage.setItem(SPOTLIGHT_SEEN_KEY, JSON.stringify([...seen, featureId]));
      }
    } catch (e) {
      console.error('Failed to save spotlight state:', e);
    }
  }, [getSeenFeatures]);

  // Initialize pending features after WhatsNew modal closes
  useEffect(() => {
    if (showWhatsNew) return; // Wait for modal to close

    const seenFeatures = getSeenFeatures();
    
    // Get features with tourStep that haven't been spotlighted
    const newFeatures = FEATURE_UPDATES
      .filter(f => f.version === currentVersion && f.tourStep)
      .filter(f => !seenFeatures.includes(`${f.version}-${f.tourStep}`))
      .map(f => ({
        id: `${f.version}-${f.tourStep}`,
        title: f.title,
        description: f.description,
        tourStep: f.tourStep!,
      }));

    if (newFeatures.length > 0) {
      setPendingFeatures(newFeatures);
      // Start spotlight sequence after a delay
      const timer = setTimeout(() => {
        setActiveFeature(newFeatures[0]);
        setIsActive(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showWhatsNew, currentVersion, getSeenFeatures]);

  // Mark current feature as seen and advance to next
  const markFeatureSeen = useCallback(() => {
    if (!activeFeature) return;

    saveSeenFeature(activeFeature.id);
    
    const remaining = pendingFeatures.filter(f => f.id !== activeFeature.id);
    setPendingFeatures(remaining);

    if (remaining.length > 0) {
      // Show next feature after animation
      setTimeout(() => {
        setActiveFeature(remaining[0]);
      }, 500);
    } else {
      setActiveFeature(null);
      setIsActive(false);
    }
  }, [activeFeature, pendingFeatures, saveSeenFeature]);

  // Skip all remaining spotlights
  const skipAllSpotlights = useCallback(() => {
    pendingFeatures.forEach(f => saveSeenFeature(f.id));
    setPendingFeatures([]);
    setActiveFeature(null);
    setIsActive(false);
  }, [pendingFeatures, saveSeenFeature]);

  return {
    activeFeature,
    isSpotlightActive: isActive,
    pendingCount: pendingFeatures.length,
    markFeatureSeen,
    skipAllSpotlights,
  };
}
