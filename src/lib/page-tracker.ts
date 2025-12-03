/**
 * Page View Tracker - Database persistence for page analytics
 */

import { supabase } from '@/integrations/supabase/client';

// Session ID for tracking
const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'ssr_session';
  let sid = sessionStorage.getItem('page_tracker_session');
  if (!sid) {
    sid = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem('page_tracker_session', sid);
  }
  return sid;
};

// Device type detection
const getDeviceType = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

// Debounce to prevent rapid duplicate tracking
let lastTrackedRoute = '';
let lastTrackedTime = 0;
const DEBOUNCE_MS = 500;

/**
 * Track a page view to the database
 */
export async function trackPageViewToDb(route: string, title: string): Promise<void> {
  try {
    // Debounce rapid navigation
    const now = Date.now();
    if (route === lastTrackedRoute && now - lastTrackedTime < DEBOUNCE_MS) {
      return;
    }
    lastTrackedRoute = route;
    lastTrackedTime = now;

    // Don't track certain routes
    const excludedPrefixes = ['/auth', '/preview/', '/shared/'];
    if (excludedPrefixes.some(prefix => route.startsWith(prefix))) {
      return;
    }

    // Get current user (may be null for public pages)
    const { data: { user } } = await supabase.auth.getUser();

    // Parse query params
    const url = new URL(window.location.href);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    // Insert page view - using any type to bypass RLS type checking
    const { error } = await supabase
      .from('page_views' as any)
      .insert({
        route,
        title,
        user_id: user?.id || null,
        session_id: getSessionId(),
        referrer: document.referrer || null,
        device_type: getDeviceType(),
        query_params: Object.keys(queryParams).length > 0 ? queryParams : null,
      });

    if (error) {
      // Log error but don't throw - analytics should never break the app
      if (import.meta.env.DEV) {
        console.warn('[PageTracker] Insert error:', error.message);
      }
    }
  } catch (error) {
    // Silent fail in production
    if (import.meta.env.DEV) {
      console.warn('[PageTracker] Error:', error);
    }
  }
}
