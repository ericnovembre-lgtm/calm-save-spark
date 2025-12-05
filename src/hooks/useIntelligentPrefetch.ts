/**
 * Enhanced Intelligent Prefetch Hook
 * Phase 8: Performance Optimizations
 * 
 * Features:
 * - User behavior learning (actual navigation patterns)
 * - Time-of-day patterns
 * - Data query prefetching
 * - requestIdleCallback integration
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// ============================================================
// Route Patterns (Static + Learned)
// ============================================================

const STATIC_ROUTE_PATTERNS: Record<string, string[]> = {
  '/': ['/auth', '/onboarding'],
  '/auth': ['/onboarding', '/dashboard'],
  '/onboarding': ['/dashboard'],
  '/dashboard': ['/hubs/manage-money', '/hubs/grow-wealth', '/goals', '/transactions'],
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
  '/settings': ['/dashboard', '/security-settings'],
  '/guardian': ['/security-settings', '/dashboard'],
};

// Time-of-day route predictions
const TIME_BASED_PATTERNS: Record<string, string[]> = {
  morning: ['/dashboard', '/transactions', '/budget'], // 6am-12pm
  afternoon: ['/transactions', '/goals', '/investments'], // 12pm-6pm
  evening: ['/goals', '/analytics', '/coach'], // 6pm-10pm
  night: ['/settings', '/dashboard'], // 10pm-6am
};

// Query keys to prefetch per route
const ROUTE_QUERY_PREFETCH: Record<string, string[]> = {
  '/dashboard': ['dashboard-layout', 'goals', 'budgets', 'balance'],
  '/transactions': ['transactions', 'budgets'],
  '/goals': ['goals', 'balance'],
  '/budget': ['budgets', 'transactions', 'budget-spending'],
  '/analytics': ['analytics', 'transactions'],
  '/coach': ['ai-conversations'],
  '/investments': ['investments', 'portfolio'],
};

// ============================================================
// Storage Keys
// ============================================================

const BEHAVIOR_STORAGE_KEY = 'prefetch-behavior-data';
const MAX_HISTORY_LENGTH = 100;
const LEARNING_THRESHOLD = 3; // Min occurrences to learn pattern

// ============================================================
// Types
// ============================================================

interface NavigationRecord {
  from: string;
  to: string;
  timestamp: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface BehaviorData {
  history: NavigationRecord[];
  learnedPatterns: Record<string, Record<string, number>>;
  lastUpdated: number;
}

// ============================================================
// Utility Functions
// ============================================================

const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

const getConnectionSpeed = (): 'fast' | 'slow' | 'offline' => {
  const connection = (navigator as any).connection;
  
  if (!navigator.onLine) return 'offline';
  if (!connection) return 'fast';
  
  const effectiveType = connection.effectiveType;
  if (effectiveType === '4g') return 'fast';
  if (effectiveType === '3g') return 'slow';
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
  
  if (connection.downlink > 5) return 'fast';
  if (connection.downlink > 1.5) return 'slow';
  
  return 'slow';
};

const loadBehaviorData = (): BehaviorData => {
  try {
    const stored = localStorage.getItem(BEHAVIOR_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }
  return {
    history: [],
    learnedPatterns: {},
    lastUpdated: Date.now(),
  };
};

const saveBehaviorData = (data: BehaviorData): void => {
  try {
    localStorage.setItem(BEHAVIOR_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore errors
  }
};

// ============================================================
// requestIdleCallback Polyfill
// ============================================================

const requestIdleCallbackPolyfill = (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number => {
  if ('requestIdleCallback' in window) {
    return (window as Window).requestIdleCallback(callback, options);
  }
  // Fallback to setTimeout
  const timeoutId = setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50,
    });
  }, options?.timeout || 1);
  return timeoutId as unknown as number;
};

const cancelIdleCallbackPolyfill = (id: number): void => {
  if ('cancelIdleCallback' in window) {
    (window as Window).cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

// ============================================================
// Hook Implementation
// ============================================================

export const useIntelligentPrefetch = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const previousPath = useRef<string | null>(null);
  const prefetchedRoutes = useRef<Set<string>>(new Set());
  const prefetchedQueries = useRef<Set<string>>(new Set());
  const idleCallbackId = useRef<number | null>(null);
  const behaviorData = useRef<BehaviorData>(loadBehaviorData());

  /**
   * Record navigation and learn patterns
   */
  const recordNavigation = useCallback((from: string, to: string) => {
    const data = behaviorData.current;
    const timeOfDay = getTimeOfDay();

    // Add to history
    data.history.push({
      from,
      to,
      timestamp: Date.now(),
      timeOfDay,
    });

    // Trim history if too long
    if (data.history.length > MAX_HISTORY_LENGTH) {
      data.history = data.history.slice(-MAX_HISTORY_LENGTH);
    }

    // Update learned patterns
    if (!data.learnedPatterns[from]) {
      data.learnedPatterns[from] = {};
    }
    data.learnedPatterns[from][to] = (data.learnedPatterns[from][to] || 0) + 1;

    data.lastUpdated = Date.now();
    behaviorData.current = data;
    saveBehaviorData(data);
  }, []);

  /**
   * Get predicted routes based on all signals
   */
  const getPredictedRoutes = useCallback((currentPath: string): string[] => {
    const predictions = new Map<string, number>();
    const timeOfDay = getTimeOfDay();

    // 1. Static patterns (weight: 1)
    const staticRoutes = STATIC_ROUTE_PATTERNS[currentPath] || [];
    staticRoutes.forEach((route, index) => {
      const score = (staticRoutes.length - index) / staticRoutes.length;
      predictions.set(route, (predictions.get(route) || 0) + score);
    });

    // 2. Learned patterns (weight: 2 - more important)
    const learned = behaviorData.current.learnedPatterns[currentPath] || {};
    Object.entries(learned).forEach(([route, count]) => {
      if (count >= LEARNING_THRESHOLD) {
        const score = Math.min(count / 10, 2); // Cap at 2
        predictions.set(route, (predictions.get(route) || 0) + score * 2);
      }
    });

    // 3. Time-of-day patterns (weight: 0.5)
    const timeRoutes = TIME_BASED_PATTERNS[timeOfDay] || [];
    timeRoutes.forEach((route) => {
      predictions.set(route, (predictions.get(route) || 0) + 0.5);
    });

    // Sort by score and return top 5
    return Array.from(predictions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([route]) => route);
  }, []);

  /**
   * Prefetch a route's code chunk
   */
  const prefetchRoute = useCallback((route: string) => {
    if (prefetchedRoutes.current.has(route)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'script';
    
    // Map route to chunk name
    const chunkName = route.slice(1).replace(/\//g, '-') || 'index';
    const capitalizedChunk = chunkName
      .split('-')
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
    
    link.href = `/src/pages/${capitalizedChunk}.tsx`;
    document.head.appendChild(link);
    
    prefetchedRoutes.current.add(route);
  }, []);

  /**
   * Prefetch data queries for a route
   */
  const prefetchQueries = useCallback((route: string) => {
    const queryKeys = ROUTE_QUERY_PREFETCH[route] || [];
    
    queryKeys.forEach((key) => {
      if (prefetchedQueries.current.has(key)) return;
      
      // Mark as prefetched to avoid duplicates
      prefetchedQueries.current.add(key);
      
      // Trigger query prefetch (data will be fetched when queryFn is available)
      queryClient.prefetchQuery({
        queryKey: [key],
        staleTime: 5 * 60 * 1000, // 5 minutes
      }).catch(() => {
        // Ignore prefetch errors
      });
    });
  }, [queryClient]);

  /**
   * Execute prefetching during idle time
   */
  const schedulePrefetch = useCallback((routes: string[]) => {
    // Cancel any pending idle callback
    if (idleCallbackId.current !== null) {
      cancelIdleCallbackPolyfill(idleCallbackId.current);
    }

    idleCallbackId.current = requestIdleCallbackPolyfill(
      (deadline) => {
        let index = 0;
        
        // Prefetch as many routes as we can in idle time
        while (index < routes.length && deadline.timeRemaining() > 10) {
          const route = routes[index];
          prefetchRoute(route);
          prefetchQueries(route);
          index++;
        }

        // If we didn't finish, schedule another idle callback
        if (index < routes.length) {
          schedulePrefetch(routes.slice(index));
        }
      },
      { timeout: 2000 } // Max wait 2 seconds
    );
  }, [prefetchRoute, prefetchQueries]);

  // Track navigation and trigger prefetching
  useEffect(() => {
    const currentPath = location.pathname;

    // Record navigation if we have a previous path
    if (previousPath.current && previousPath.current !== currentPath) {
      recordNavigation(previousPath.current, currentPath);
    }
    previousPath.current = currentPath;

    // Check connection speed
    const speed = getConnectionSpeed();
    if (speed === 'slow' || speed === 'offline') {
      return;
    }

    // Get predicted routes and schedule prefetching
    const predictedRoutes = getPredictedRoutes(currentPath);
    
    // Wait a bit before prefetching (let current page settle)
    const timeoutId = setTimeout(() => {
      schedulePrefetch(predictedRoutes);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (idleCallbackId.current !== null) {
        cancelIdleCallbackPolyfill(idleCallbackId.current);
      }
    };
  }, [location.pathname, recordNavigation, getPredictedRoutes, schedulePrefetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (idleCallbackId.current !== null) {
        cancelIdleCallbackPolyfill(idleCallbackId.current);
      }
    };
  }, []);

  return {
    connectionSpeed: getConnectionSpeed(),
    timeOfDay: getTimeOfDay(),
    learnedPatterns: behaviorData.current.learnedPatterns,
    navigationHistory: behaviorData.current.history.slice(-10),
  };
};

/**
 * Clear learned behavior data
 */
export const clearPrefetchBehaviorData = (): void => {
  localStorage.removeItem(BEHAVIOR_STORAGE_KEY);
};

/**
 * Get prefetch statistics
 */
export const getPrefetchStats = (): {
  learnedRoutes: number;
  totalNavigations: number;
  topPatterns: Array<{ from: string; to: string; count: number }>;
} => {
  const data = loadBehaviorData();
  
  const topPatterns: Array<{ from: string; to: string; count: number }> = [];
  Object.entries(data.learnedPatterns).forEach(([from, destinations]) => {
    Object.entries(destinations).forEach(([to, count]) => {
      topPatterns.push({ from, to, count });
    });
  });
  
  topPatterns.sort((a, b) => b.count - a.count);

  return {
    learnedRoutes: Object.keys(data.learnedPatterns).length,
    totalNavigations: data.history.length,
    topPatterns: topPatterns.slice(0, 10),
  };
};
