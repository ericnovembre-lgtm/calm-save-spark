import { useState } from 'react';

const DEFAULT_CARD_ORDER = [
  'balance',
  'goals',
  'manual-transfer',
  'scheduled-transfers',
  'connect-account',
  'transfer-history',
  'journey-milestones',
  'recommendations',
  'cash-flow',
  'skill-tree',
  'peer-insights',
  'goal-timeline',
];

const STORAGE_KEY = 'dashboard-card-order';
const COLLAPSED_KEY = 'dashboard-collapsed-sections';

/**
 * Hook for managing dashboard card order and collapsed state with persistent localStorage
 * TODO: Migrate to database storage when user_preferences table is available
 */
export function useDashboardOrder(userId?: string) {
  const storageKey = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  const collapsedKey = userId ? `${COLLAPSED_KEY}-${userId}` : COLLAPSED_KEY;
  
  // Initialize card order from localStorage or default
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_CARD_ORDER;
    
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : DEFAULT_CARD_ORDER;
    } catch {
      return DEFAULT_CARD_ORDER;
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
    updateOrder(DEFAULT_CARD_ORDER);
  };

  return {
    cardOrder,
    updateOrder,
    resetOrder,
    collapsedSections,
    toggleCollapsed,
    isLoading: false,
  };
}
