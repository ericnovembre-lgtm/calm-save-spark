import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route patterns and their likely next destinations
 * Based on common user navigation patterns
 */
const ROUTE_PATTERNS: Record<string, string[]> = {
  '/': ['/auth', '/onboarding'],
  '/auth': ['/onboarding', '/dashboard'],
  '/onboarding': ['/dashboard'],
  '/dashboard': ['/hubs/manage-money', '/hubs/grow-wealth', '/goals'],
  '/hubs/manage-money': ['/budget', '/transactions', '/automations'],
  '/hubs/grow-wealth': ['/goals', '/investments', '/credit'],
  '/hubs/ai-insights': ['/coach', '/ai-agents', '/analytics'],
  '/hubs/lifestyle': ['/family', '/student', '/business-os'],
  '/hubs/premium': ['/alternatives-portal', '/investments', '/lifesim'],
  '/goals': ['/dashboard', '/hubs/grow-wealth', '/pots'],
  '/transactions': ['/dashboard', '/budget', '/hubs/manage-money'],
  '/budget': ['/transactions', '/analytics', '/automations'],
  '/analytics': ['/dashboard', '/budget'],
  '/coach': ['/ai-agents', '/analytics', '/hubs/ai-insights'],
  '/pots': ['/goals', '/dashboard', '/transactions'],
};

/**
 * Get connection speed category
 */
const getConnectionSpeed = (): 'fast' | 'slow' | 'offline' => {
  const connection = (navigator as any).connection;
  
  if (!navigator.onLine) return 'offline';
  
  if (!connection) return 'fast'; // Assume fast if API not available
  
  // Check effective connection type
  const effectiveType = connection.effectiveType;
  if (effectiveType === '4g') return 'fast';
  if (effectiveType === '3g') return 'slow';
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
  
  // Check downlink speed (Mbps)
  if (connection.downlink > 5) return 'fast';
  if (connection.downlink > 1.5) return 'slow';
  
  return 'slow';
};

/**
 * Prefetch a route's chunk
 */
const prefetchRoute = (route: string) => {
  // Create a link element to prefetch the route
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'script';
  
  // Map route to potential chunk name
  const chunkName = route.slice(1) || 'index';
  link.href = `/src/pages/${chunkName.charAt(0).toUpperCase() + chunkName.slice(1)}.tsx`;
  
  document.head.appendChild(link);
};

/**
 * Intelligent prefetching hook
 * Preloads likely-needed chunks based on:
 * - Current route and navigation patterns
 * - Connection speed
 * - User behavior history
 */
export const useIntelligentPrefetch = () => {
  const location = useLocation();
  const navigationHistory = useRef<string[]>([]);
  const prefetchedRoutes = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Add to navigation history
    if (navigationHistory.current[navigationHistory.current.length - 1] !== currentPath) {
      navigationHistory.current.push(currentPath);
      
      // Keep only last 10 routes
      if (navigationHistory.current.length > 10) {
        navigationHistory.current.shift();
      }
    }

    // Get connection speed
    const speed = getConnectionSpeed();
    
    // Don't prefetch on slow or offline connections
    if (speed === 'slow' || speed === 'offline') {
      return;
    }

    // Get likely next routes based on patterns
    const likelyRoutes = ROUTE_PATTERNS[currentPath] || [];
    
    // Prefetch routes with a slight delay (idle time)
    const timeoutId = setTimeout(() => {
      likelyRoutes.forEach((route) => {
        if (!prefetchedRoutes.current.has(route)) {
          prefetchRoute(route);
          prefetchedRoutes.current.add(route);
        }
      });
    }, 1000); // Wait 1s for idle

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return {
    connectionSpeed: getConnectionSpeed(),
    navigationHistory: navigationHistory.current,
  };
};
