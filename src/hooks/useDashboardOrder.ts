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

/**
 * Hook for managing dashboard card order with persistent localStorage
 * TODO: Migrate to database storage when user_preferences table is available
 */
export function useDashboardOrder(userId?: string) {
  const storageKey = userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY;
  
  // Initialize from localStorage or default
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_CARD_ORDER;
    
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : DEFAULT_CARD_ORDER;
    } catch {
      return DEFAULT_CARD_ORDER;
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

  const resetOrder = () => {
    updateOrder(DEFAULT_CARD_ORDER);
  };

  return {
    cardOrder,
    updateOrder,
    resetOrder,
    isLoading: false,
  };
}
