/**
 * PreloadHint - Preload route chunks on hover/focus
 * Improves perceived navigation speed
 */
import { useRef, useCallback, ReactNode, useState } from 'react';
import { Link, LinkProps, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PreloadHintProps extends Omit<LinkProps, 'to'> {
  /** Route to preload */
  to: string;
  /** Delay before preloading (ms) */
  delay?: number;
  /** Also preload on focus */
  preloadOnFocus?: boolean;
  /** Disable preloading */
  disabled?: boolean;
  children: ReactNode;
}

// Cache of already preloaded routes
const preloadedRoutes = new Set<string>();

// Route to chunk mapping for dynamic imports
const ROUTE_CHUNKS: Record<string, () => Promise<any>> = {
  '/dashboard': () => import('@/pages/Dashboard'),
  '/transactions': () => import('@/pages/Transactions'),
  '/budget': () => import('@/pages/Budget'),
  '/goals': () => import('@/pages/Goals'),
  '/analytics': () => import('@/pages/Analytics'),
  '/coach': () => import('@/pages/Coach'),
  '/digital-twin': () => import('@/pages/DigitalTwin'),
  '/investments': () => import('@/pages/Investments'),
  '/settings': () => import('@/pages/Settings'),
  '/guardian': () => import('@/pages/GuardianSecurityCenter'),
  '/wallet': () => import('@/pages/Wallet'),
  '/pots': () => import('@/pages/Pots'),
  '/debts': () => import('@/pages/Debts'),
  '/credit': () => import('@/pages/Credit'),
  '/automations': () => import('@/pages/Automations'),
  '/achievements': () => import('@/pages/Achievements'),
  '/help': () => import('@/pages/Help'),
};

/**
 * Preload a route's chunk
 */
const preloadRoute = (route: string): void => {
  // Normalize route
  const normalizedRoute = route.split('?')[0].split('#')[0];
  
  // Skip if already preloaded
  if (preloadedRoutes.has(normalizedRoute)) return;
  
  // Find matching chunk loader
  const loader = ROUTE_CHUNKS[normalizedRoute];
  
  if (loader) {
    // Mark as preloaded immediately to prevent duplicate requests
    preloadedRoutes.add(normalizedRoute);
    
    // Preload the chunk
    loader().catch(() => {
      // Remove from cache if preload fails
      preloadedRoutes.delete(normalizedRoute);
    });
  }
};

/**
 * PreloadLink - Link component with hover preloading
 */
export function PreloadLink({
  to,
  delay = 150,
  preloadOnFocus = true,
  disabled = false,
  children,
  className,
  ...props
}: PreloadHintProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);

  const startPreload = useCallback(() => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsPreloading(true);
      preloadRoute(to);
      setIsPreloading(false);
    }, delay);
  }, [to, delay, disabled]);

  const cancelPreload = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return (
    <Link
      to={to}
      className={cn(className)}
      onMouseEnter={startPreload}
      onMouseLeave={cancelPreload}
      onFocus={preloadOnFocus ? startPreload : undefined}
      onBlur={preloadOnFocus ? cancelPreload : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * usePreload - Hook for programmatic preloading
 */
export function usePreload() {
  const navigate = useNavigate();

  const preload = useCallback((route: string) => {
    preloadRoute(route);
  }, []);

  const preloadAndNavigate = useCallback((route: string) => {
    preloadRoute(route);
    navigate(route);
  }, [navigate]);

  const preloadMultiple = useCallback((routes: string[]) => {
    routes.forEach(preloadRoute);
  }, []);

  return {
    preload,
    preloadAndNavigate,
    preloadMultiple,
    isPreloaded: (route: string) => preloadedRoutes.has(route),
  };
}

/**
 * PreloadOnHover - Wrapper for any element to trigger preload
 */
interface PreloadOnHoverProps {
  route: string;
  delay?: number;
  children: ReactNode;
  className?: string;
}

export function PreloadOnHover({
  route,
  delay = 150,
  children,
  className,
}: PreloadOnHoverProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      preloadRoute(route);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

/**
 * PreloadOnVisible - Preload when element becomes visible
 */
interface PreloadOnVisibleProps {
  route: string;
  children: ReactNode;
  className?: string;
  threshold?: number;
}

export function PreloadOnVisible({
  route,
  children,
  className,
  threshold = 0.1,
}: PreloadOnVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Use IntersectionObserver to preload when visible
  useCallback(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          preloadRoute(route);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [route, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
