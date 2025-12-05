import { useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { haptics } from '@/lib/haptics';

const NAVIGATION_ROUTES = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/budgets', label: 'Budgets' },
  { path: '/goals', label: 'Goals' },
  { path: '/investments', label: 'Investments' },
];

interface SwipeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isSwiping: boolean;
  direction: 'left' | 'right' | null;
}

export function useSwipeNavigation(options: { threshold?: number; edgeWidth?: number; velocityThreshold?: number } = {}) {
  const { threshold = 100, edgeWidth = 30, velocityThreshold = 0.5 } = options;
  const navigate = useNavigate();
  const location = useLocation();
  const [swipeState, setSwipeState] = useState<SwipeState>({ startX: 0, startY: 0, currentX: 0, currentY: 0, isSwiping: false, direction: null });
  const [swipeProgress, setSwipeProgress] = useState(0);
  const startTimeRef = useRef<number>(0);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const currentIndex = NAVIGATION_ROUTES.findIndex(r => r.path === location.pathname);
  const canSwipeLeft = currentIndex < NAVIGATION_ROUTES.length - 1;
  const canSwipeRight = currentIndex > 0;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch.clientX < edgeWidth || touch.clientX > window.innerWidth - edgeWidth) {
      startTimeRef.current = Date.now();
      setSwipeState({ startX: touch.clientX, startY: touch.clientY, currentX: touch.clientX, currentY: touch.clientY, isSwiping: true, direction: null });
    }
  }, [edgeWidth]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!swipeState.isSwiping) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeState.startX;
    const deltaY = touch.clientY - swipeState.startY;
    if (Math.abs(deltaX) < Math.abs(deltaY)) { setSwipeState(prev => ({ ...prev, isSwiping: false })); return; }
    const direction = deltaX > 0 ? 'right' : 'left';
    const progress = Math.min(Math.abs(deltaX) / threshold, 1);
    if ((direction === 'left' && !canSwipeLeft) || (direction === 'right' && !canSwipeRight)) { setSwipeProgress(progress * 0.3); return; }
    setSwipeState(prev => ({ ...prev, currentX: touch.clientX, currentY: touch.clientY, direction }));
    setSwipeProgress(progress);
    if (progress >= 1 && !reducedMotion) haptics.vibrate('light');
  }, [swipeState.isSwiping, swipeState.startX, swipeState.startY, threshold, canSwipeLeft, canSwipeRight, reducedMotion]);

  const handleTouchEnd = useCallback(() => {
    if (!swipeState.isSwiping || !swipeState.direction) { setSwipeState(prev => ({ ...prev, isSwiping: false })); setSwipeProgress(0); return; }
    const deltaX = swipeState.currentX - swipeState.startX;
    const velocity = Math.abs(deltaX) / (Date.now() - startTimeRef.current);
    if (Math.abs(deltaX) >= threshold || velocity >= velocityThreshold) {
if (swipeState.direction === 'left' && canSwipeLeft) { haptics.swipe(); navigate(NAVIGATION_ROUTES[currentIndex + 1].path); }
      else if (swipeState.direction === 'right' && canSwipeRight) { haptics.swipe(); navigate(NAVIGATION_ROUTES[currentIndex - 1].path); }
    }
    setSwipeState({ startX: 0, startY: 0, currentX: 0, currentY: 0, isSwiping: false, direction: null });
    setSwipeProgress(0);
  }, [swipeState, threshold, velocityThreshold, canSwipeLeft, canSwipeRight, currentIndex, navigate]);

  const navigateToIndex = useCallback((index: number) => { if (index >= 0 && index < NAVIGATION_ROUTES.length) { haptics.vibrate('light'); navigate(NAVIGATION_ROUTES[index].path); } }, [navigate]);

  return { swipeState, swipeProgress, currentIndex, routes: NAVIGATION_ROUTES, canSwipeLeft, canSwipeRight, navigateToIndex, handlers: { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd } };
}
