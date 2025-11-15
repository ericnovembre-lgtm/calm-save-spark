import { useState } from 'react';

// Core sections shown to new users (smart defaults)
const CORE_SECTIONS = [
  'personal-impact',  // Show impact first
  'ai-agents',
  'balance',
  'goals',
  'manual-transfer',
  'ai-insights',
];

// Full list of all available sections
const ALL_SECTIONS = [
  'balance',
  'ai-insights',
  'ai-agents',
  'goals',
  'challenges',
  'predictive',
  'manual-transfer',
  'analytics-dashboard',
  'scheduled-transfers',
  'connect-account',
  'transfer-history',
  'journey-milestones',
  'recommendations',
  'cash-flow',
  'skill-tree',
  'peer-insights',
  'goal-timeline',
  'next-gen-features',
  'layout-manager',
  'theme-customizer',
];

const STORAGE_KEY = 'dashboard-card-order';
const COLLAPSED_KEY = 'dashboard-collapsed-sections';
const FIRST_VISIT_KEY = 'dashboard-first-visit';
const UNLOCKED_SECTIONS_KEY = 'dashboard-unlocked-sections';

/**
 * Hook for managing dashboard card order and collapsed state with persistent localStorage
 * Implements smart defaults: new users see only core sections
 */
export function useDashboardOrder(userId?: string) {
  const storageKey = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  const collapsedKey = userId ? `${COLLAPSED_KEY}-${userId}` : COLLAPSED_KEY;
  const firstVisitKey = userId ? `${FIRST_VISIT_KEY}-${userId}` : FIRST_VISIT_KEY;
  const unlockedKey = userId ? `${UNLOCKED_SECTIONS_KEY}-${userId}` : UNLOCKED_SECTIONS_KEY;
  
  // Check if this is the user's first visit
  const isFirstVisit = () => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(firstVisitKey);
  };

  // Initialize card order from localStorage or smart default
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ALL_SECTIONS;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // First visit: show only core sections
      if (isFirstVisit()) {
        localStorage.setItem(firstVisitKey, 'true');
        return CORE_SECTIONS;
      }
      
      return ALL_SECTIONS;
    } catch {
      return isFirstVisit() ? CORE_SECTIONS : ALL_SECTIONS;
    }
  });

  // Track unlocked sections
  const [unlockedSections, setUnlockedSections] = useState<string[]>(() => {
    if (typeof window === 'undefined') return CORE_SECTIONS;
    
    try {
      const stored = localStorage.getItem(unlockedKey);
      return stored ? JSON.parse(stored) : CORE_SECTIONS;
    } catch {
      return CORE_SECTIONS;
    }
  });

  // Initialize collapsed sections state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(collapsedKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const updateOrder = (newOrder: string[]) => {
    setCardOrder(newOrder);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newOrder));
      } catch (error) {
        console.error('Failed to save dashboard order:', error);
      }
    }
  };

  const toggleCollapsed = (sectionId: string, isCollapsed: boolean) => {
    const newCollapsed = { ...collapsedSections, [sectionId]: isCollapsed };
    setCollapsedSections(newCollapsed);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(collapsedKey, JSON.stringify(newCollapsed));
      } catch (error) {
        console.error('Failed to save collapsed state:', error);
      }
    }
  };

  const resetOrder = () => {
    updateOrder(ALL_SECTIONS);
  };

  const unlockSection = (sectionId: string) => {
    if (unlockedSections.includes(sectionId)) return;
    
    const newUnlocked = [...unlockedSections, sectionId];
    setUnlockedSections(newUnlocked);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(unlockedKey, JSON.stringify(newUnlocked));
      } catch (error) {
        console.error('Failed to save unlocked sections:', error);
      }
    }
    
    // Add to card order if not already present
    if (!cardOrder.includes(sectionId)) {
      updateOrder([...cardOrder, sectionId]);
    }
  };

  const unlockAllSections = () => {
    setUnlockedSections(ALL_SECTIONS);
    updateOrder(ALL_SECTIONS);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(unlockedKey, JSON.stringify(ALL_SECTIONS));
      } catch (error) {
        console.error('Failed to save unlocked sections:', error);
      }
    }
  };

  return {
    cardOrder,
    updateOrder,
    resetOrder,
    collapsedSections,
    toggleCollapsed,
    unlockedSections,
    unlockSection,
    unlockAllSections,
    isFirstVisit: isFirstVisit(),
    isLoading: false,
  };
}
