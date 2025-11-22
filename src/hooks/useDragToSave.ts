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

interface UseDragToSaveOptions {
  onDrop: (goalId: string, amount: number) => Promise<void>;
  defaultAmount?: number;
}

/**
 * Hook for drag-to-save interaction
 * Enables dragging a coin icon from balance to goal drop zones
 */
export const useDragToSave = ({ onDrop, defaultAmount = 100 }: UseDragToSaveOptions) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<DragPosition>({ x: 0, y: 0 });
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);

  const registerDropZone = useCallback((id: string, element: HTMLElement) => {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    setDropZones(zones => {
      const existing = zones.find(z => z.id === id);
      if (existing) return zones;
      
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

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback((_: any, info: PanInfo) => {
    const x = info.offset.x;
    const y = info.offset.y;
    setDragPosition({ x, y });

    // Check if hovering over any drop zone
    const screenX = info.point.x;
    const screenY = info.point.y;

    const zone = dropZones.find(dz => 
      screenX >= dz.x && 
      screenX <= dz.x + dz.width &&
      screenY >= dz.y && 
      screenY <= dz.y + dz.height
    );

    setHoveredZone(zone?.id || null);
  }, [dropZones]);

  const handleDragEnd = useCallback(async (_: any, info: PanInfo) => {
    setIsDragging(false);
    setDragPosition({ x: 0, y: 0 });

    if (hoveredZone) {
      try {
        await onDrop(hoveredZone, defaultAmount);
      } catch (error) {
        console.error('Drop failed:', error);
      }
    }

    setHoveredZone(null);
  }, [hoveredZone, onDrop, defaultAmount]);

  const getDragHandlers = () => ({
    drag: true,
    dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
    dragElastic: 0.2,
    onDragStart: handleDragStart,
    onDrag: handleDrag,
    onDragEnd: handleDragEnd
  });

  return {
    isDragging,
    dragPosition,
    hoveredZone,
    dropZones,
    registerDropZone,
    unregisterDropZone,
    getDragHandlers
  };
};
