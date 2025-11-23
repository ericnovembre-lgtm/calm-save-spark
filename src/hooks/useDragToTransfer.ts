import { useState, useCallback } from 'react';
import { PanInfo } from 'framer-motion';

interface DragPosition {
  x: number;
  y: number;
}

interface DropZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseDragToTransferOptions {
  onDrop: (fromAccountId: string, toAccountId: string) => void;
}

/**
 * Hook for drag-to-transfer interaction
 * Enables dragging account cards onto each other to initiate transfers
 */
export const useDragToTransfer = ({ onDrop }: UseDragToTransferOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedAccountId, setDraggedAccountId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<DragPosition>({ x: 0, y: 0 });
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);

  const registerDropZone = useCallback((id: string, element: HTMLElement) => {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    setDropZones(zones => {
      const existing = zones.find(z => z.id === id);
      if (existing) {
        // Update position
        return zones.map(z => z.id === id ? {
          id,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        } : z);
      }
      
      return [
        ...zones,
        {
          id,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        }
      ];
    });
  }, []);

  const unregisterDropZone = useCallback((id: string) => {
    setDropZones(zones => zones.filter(z => z.id !== id));
  }, []);

  const handleDragStart = useCallback((accountId: string) => {
    setIsDragging(true);
    setDraggedAccountId(accountId);
  }, []);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    const x = info.offset.x;
    const y = info.offset.y;
    setDragPosition({ x, y });

    // Check if hovering over any drop zone (excluding the dragged card itself)
    const screenX = info.point.x;
    const screenY = info.point.y;

    const zone = dropZones.find(dz => 
      dz.id !== draggedAccountId &&
      screenX >= dz.x && 
      screenX <= dz.x + dz.width &&
      screenY >= dz.y && 
      screenY <= dz.y + dz.height
    );

    setHoveredZone(zone?.id || null);
  }, [dropZones, draggedAccountId]);

  const handleDragEnd = useCallback(async (_: any, info: PanInfo) => {
    setIsDragging(false);
    setDragPosition({ x: 0, y: 0 });

    if (hoveredZone && draggedAccountId) {
      onDrop(draggedAccountId, hoveredZone);
    }

    setHoveredZone(null);
    setDraggedAccountId(null);
  }, [hoveredZone, draggedAccountId, onDrop]);

  const getDragHandlers = (accountId: string) => ({
    drag: true,
    dragSnapToOrigin: true,
    dragElastic: 0.2,
    onDragStart: () => handleDragStart(accountId),
    onDrag: handleDrag,
    onDragEnd: handleDragEnd
  });

  return {
    isDragging,
    draggedAccountId,
    dragPosition,
    hoveredZone,
    dropZones,
    registerDropZone,
    unregisterDropZone,
    getDragHandlers
  };
};