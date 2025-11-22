import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { haptics } from '@/lib/haptics';
import { soundEffects } from '@/lib/sound-effects';

interface DragState {
  sourceBudgetId: string;
  sourceName: string;
  surplus: number;
  isDragging: boolean;
  dragPosition: { x: number; y: number };
}

interface DropZoneState {
  budgetId: string;
  isHovered: boolean;
  isValid: boolean;
}

/**
 * Hook for drag-to-rebalance budget funds
 * Handles drag state, drop zones, validation, and transfer logic
 */
export function useBudgetDragToRebalance(onTransferComplete?: () => void) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropZones, setDropZones] = useState<Map<string, DropZoneState>>(new Map());
  const [showParticles, setShowParticles] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    amount: number;
  } | null>(null);
  
  const dragElementRef = useRef<HTMLElement | null>(null);

  const startDrag = useCallback((
    budgetId: string,
    budgetName: string,
    surplus: number,
    element: HTMLElement
  ) => {
    if (surplus <= 0) {
      haptics.pattern('error');
      toast.error('No surplus to transfer', {
        description: `${budgetName} doesn't have extra funds`
      });
      return;
    }

    haptics.buttonPress();
    soundEffects.click();
    dragElementRef.current = element;
    
    setDragState({
      sourceBudgetId: budgetId,
      sourceName: budgetName,
      surplus,
      isDragging: true,
      dragPosition: { x: 0, y: 0 }
    });
  }, []);

  const updateDragPosition = useCallback((x: number, y: number, cursorX: number, cursorY: number) => {
    setDragState(prev => prev ? { ...prev, dragPosition: { x, y } } : null);

    // Check hover state for all drop zones
    setDropZones(prev => {
      const updated = new Map(prev);
      updated.forEach((zone, budgetId) => {
        const element = document.getElementById(`budget-card-${budgetId}`);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const isHovered = 
          cursorX >= rect.left &&
          cursorX <= rect.right &&
          cursorY >= rect.top &&
          cursorY <= rect.bottom;

        updated.set(budgetId, { ...zone, isHovered });
      });
      return updated;
    });
  }, []);

  const endDrag = useCallback(async (cursorX: number, cursorY: number) => {
    if (!dragState) return;

    // Find hovered drop zone
    let targetBudgetId: string | null = null;
    let targetIsValid = false;

    dropZones.forEach((zone, budgetId) => {
      if (zone.isHovered && zone.isValid) {
        targetBudgetId = budgetId;
        targetIsValid = true;
      }
    });

    if (!targetBudgetId || !targetIsValid) {
      // Invalid drop - shake animation
      haptics.pattern('error');
      soundEffects.warning();
      setDragState(null);
      return;
    }

    // Get element positions for particle animation
    const sourceElement = dragElementRef.current;
    const targetElement = document.getElementById(`budget-card-${targetBudgetId}`);
    
    if (sourceElement && targetElement) {
      const sourceRect = sourceElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      
      setShowParticles({
        from: {
          x: sourceRect.left + sourceRect.width / 2,
          y: sourceRect.top + sourceRect.height / 2
        },
        to: {
          x: targetRect.left + targetRect.width / 2,
          y: targetRect.top + targetRect.height / 2
        },
        amount: dragState.surplus
      });
    }

    // Execute transfer
    try {
      haptics.pattern('success');
      soundEffects.success();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.functions.invoke('transfer-budget-funds', {
        body: {
          from_budget_id: dragState.sourceBudgetId,
          to_budget_id: targetBudgetId,
          amount: dragState.surplus,
          reason: 'Drag-to-rebalance'
        }
      });

      if (error) throw error;

      toast.success('Funds transferred!', {
        description: `$${dragState.surplus.toFixed(2)} moved to cover shortage`
      });

      onTransferComplete?.();
    } catch (error: any) {
      haptics.pattern('error');
      toast.error('Transfer failed', {
        description: error.message
      });
    } finally {
      setDragState(null);
      setTimeout(() => setShowParticles(null), 3000);
    }
  }, [dragState, dropZones, onTransferComplete]);

  const cancelDrag = useCallback(() => {
    setDragState(null);
  }, []);

  const registerDropZone = useCallback((
    budgetId: string,
    isValid: boolean
  ) => {
    setDropZones(prev => {
      const updated = new Map(prev);
      updated.set(budgetId, { budgetId, isHovered: false, isValid });
      return updated;
    });
  }, []);

  const unregisterDropZone = useCallback((budgetId: string) => {
    setDropZones(prev => {
      const updated = new Map(prev);
      updated.delete(budgetId);
      return updated;
    });
  }, []);

  return {
    dragState,
    dropZones,
    showParticles,
    startDrag,
    updateDragPosition,
    endDrag,
    cancelDrag,
    registerDropZone,
    unregisterDropZone
  };
}
