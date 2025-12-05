import { useState, useCallback, useRef } from 'react';
import { useWidgetPreferences } from './useWidgetPreferences';
import { useReducedMotion } from './useReducedMotion';

interface ReorderState {
  isDragging: boolean;
  draggedId: string | null;
}

export function useWidgetReorder(initialOrder: string[]) {
  const { updateOrder, preferences } = useWidgetPreferences();
  const prefersReducedMotion = useReducedMotion();
  const [items, setItems] = useState<string[]>(initialOrder);
  const [reorderState, setReorderState] = useState<ReorderState>({
    isDragging: false,
    draggedId: null,
  });
  
  // Track if order has been customized
  const hasCustomOrder = useRef(false);

  // Initialize with saved order if available
  const initializeOrder = useCallback((widgetIds: string[]) => {
    const savedOrder = preferences.widgetOrder;
    
    if (savedOrder.length > 0) {
      // Filter saved order to only include existing widgets
      const validSavedOrder = savedOrder.filter(id => widgetIds.includes(id));
      // Add any new widgets that aren't in saved order
      const newWidgets = widgetIds.filter(id => !savedOrder.includes(id));
      setItems([...validSavedOrder, ...newWidgets]);
      hasCustomOrder.current = true;
    } else {
      setItems(widgetIds);
    }
  }, [preferences.widgetOrder]);

  // Handle reorder event
  const handleReorder = useCallback((newOrder: string[]) => {
    setItems(newOrder);
    hasCustomOrder.current = true;
  }, []);

  // Save order to database (debounced)
  const saveOrder = useCallback(() => {
    if (hasCustomOrder.current) {
      updateOrder(items);
    }
  }, [items, updateOrder]);

  // Start dragging
  const startDrag = useCallback((widgetId: string) => {
    setReorderState({ isDragging: true, draggedId: widgetId });
  }, []);

  // End dragging
  const endDrag = useCallback(() => {
    setReorderState({ isDragging: false, draggedId: null });
    saveOrder();
  }, [saveOrder]);

  // Apply pinned widgets first in order
  const getOrderedWidgets = useCallback((widgetIds: string[]) => {
    const { pinnedWidgets, hiddenWidgets } = preferences;
    
    // Filter out hidden widgets
    const visibleWidgets = widgetIds.filter(id => !hiddenWidgets.includes(id));
    
    // Separate pinned and unpinned
    const pinned = visibleWidgets.filter(id => pinnedWidgets.includes(id));
    const unpinned = visibleWidgets.filter(id => !pinnedWidgets.includes(id));
    
    // Apply custom order to unpinned widgets
    const customOrder = preferences.widgetOrder;
    if (customOrder.length > 0) {
      unpinned.sort((a, b) => {
        const aIndex = customOrder.indexOf(a);
        const bIndex = customOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    }
    
    // Pinned widgets always come first
    return [...pinned, ...unpinned];
  }, [preferences]);

  // Animation config based on reduced motion preference
  const dragAnimationConfig = prefersReducedMotion
    ? { scale: 1, boxShadow: '0 0 0 0 rgba(0,0,0,0)' }
    : { 
        scale: 1.03, 
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
        transition: { type: 'spring', stiffness: 300, damping: 30 }
      };

  return {
    items,
    setItems,
    reorderState,
    handleReorder,
    startDrag,
    endDrag,
    initializeOrder,
    getOrderedWidgets,
    dragAnimationConfig,
    hasCustomOrder: hasCustomOrder.current,
  };
}
