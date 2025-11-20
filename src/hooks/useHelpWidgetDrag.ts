import { useState, useCallback } from 'react';
import { PanInfo } from 'framer-motion';

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

interface DragPosition {
  x: number;
  y: number;
}

export function useHelpWidgetDrag() {
  const [position, setPosition] = useState<Position>('bottom-right');
  const [dragPosition, setDragPosition] = useState<DragPosition>({ x: 0, y: 0 });

  const snapToCorner = useCallback((x: number, y: number) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const isLeft = x < windowWidth / 2;
    const isTop = y < windowHeight / 2;
    
    let newPosition: Position;
    if (isTop && isLeft) newPosition = 'top-left';
    else if (isTop && !isLeft) newPosition = 'top-right';
    else if (!isTop && isLeft) newPosition = 'bottom-left';
    else newPosition = 'bottom-right';
    
    setPosition(newPosition);
    setDragPosition({ x: 0, y: 0 });
  }, []);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const element = event.target as HTMLElement;
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      snapToCorner(centerX, centerY);
    },
    [snapToCorner]
  );

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 50,
    };

    const positionMap: Record<Position, React.CSSProperties> = {
      'bottom-right': { ...baseStyles, bottom: '1.5rem', right: '1.5rem' },
      'bottom-left': { ...baseStyles, bottom: '1.5rem', left: '1.5rem' },
      'top-right': { ...baseStyles, top: '1.5rem', right: '1.5rem' },
      'top-left': { ...baseStyles, top: '1.5rem', left: '1.5rem' },
    };

    return positionMap[position];
  };

  return {
    position,
    dragPosition,
    handleDragEnd,
    getPositionStyles,
  };
}
