/**
 * Analytics utilities for $ave+
 * Privacy-first event tracking with PostHog + fallback REST endpoint
 */

import posthog from 'posthog-js';
import { getClientUser } from './user';
import { hashUserId, bucketAmount } from './hash';
import { supabase } from '@/integrations/supabase/client';

// PostHog configuration
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

let isPostHogInitialized = false;

/**
 * Initialize PostHog (called automatically on first event)
 */
function initializePostHog() {
  if (isPostHogInitialized || typeof window === 'undefined') return;
  
  if (POSTHOG_KEY) {
    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            posthog.debug(); // Enable debug mode in development
          }
        },
        capture_pageview: false, // Manual pageview tracking
        capture_pageleave: true,
        autocapture: false, // Manual event tracking only
      });
      isPostHogInitialized = true;
      console.log('[Analytics] PostHog initialized');
    } catch (error) {
      console.warn('[Analytics] PostHog initialization failed:', error);
    }
  }
}

/**
 * Send event to fallback analytics endpoint (Supabase edge function)
 */
async function sendToFallbackEndpoint(
  eventName: string,
  properties: Record<string, any>,
  userId?: string
) {
  try {
    const { error } = await supabase.functions.invoke('analytics', {
      body: {
        event: eventName,
        properties,
        userId,
        timestamp: new Date().toISOString(),
      },
    });

    if (error) {
      console.warn('[Analytics] Fallback endpoint error:', error);
    }
  } catch (error) {
    console.warn('[Analytics] Failed to send to fallback:', error);
  }
}

/**
 * Main analytics event function
 * Preserves existing API: saveplus_audit_event(eventName, properties)
 */
export async function saveplus_audit_event(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window === 'undefined') return;

  // Get user (if authenticated)
  const user = await getClientUser();
  const hashedUserId = user ? await hashUserId(user.id) : undefined;

  // Sanitize properties (bucket amounts, remove PII)
  const sanitizedProps = sanitizeProperties(properties || {});

  // Add default properties
  const enrichedProps = {
    ...sanitizedProps,
    route: window.location.pathname,
    timestamp: new Date().toISOString(),
    user_hashed: hashedUserId,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', eventName, enrichedProps);
  }

  // Send to PostHog (if configured)
  if (POSTHOG_KEY) {
    initializePostHog();
    try {
      posthog.capture(eventName, enrichedProps);
    } catch (error) {
      console.warn('[Analytics] PostHog capture failed:', error);
    }
  }

  // Send to fallback endpoint (always, for backup)
  await sendToFallbackEndpoint(eventName, enrichedProps, hashedUserId);
}

/**
 * Sanitize properties to remove PII and bucket amounts
 */
function sanitizeProperties(props: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    // Skip PII fields
    if (['email', 'phone', 'password', 'ssn', 'address'].includes(key.toLowerCase())) {
      continue;
    }

    // Bucket amount fields
    if (
      (key.toLowerCase().includes('amount') || 
       key.toLowerCase().includes('price') ||
       key.toLowerCase().includes('value')) &&
      typeof value === 'number'
    ) {
      sanitized[`${key}_bucket`] = bucketAmount(value);
      continue;
    }

    // Pass through other values
    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Track page view
 */
export async function trackPageView(pageName?: string) {
  const page = pageName || window.location.pathname;
  await saveplus_audit_event('page_view', { page });
}

/**
 * Identify user (for PostHog)
 */
export async function identifyUser(traits?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  const user = await getClientUser();
  if (!user) return;

  const hashedUserId = await hashUserId(user.id);

  if (POSTHOG_KEY) {
    initializePostHog();
    try {
      posthog.identify(hashedUserId, {
        ...traits,
        email_domain: user.email?.split('@')[1], // Only domain, not full email
      });
    } catch (error) {
      console.warn('[Analytics] PostHog identify failed:', error);
    }
  }
}

/**
 * Reset user identity (on logout)
 */
export function resetAnalytics() {
  if (typeof window === 'undefined') return;

  if (POSTHOG_KEY && isPostHogInitialized) {
    try {
      posthog.reset();
    } catch (error) {
      console.warn('[Analytics] PostHog reset failed:', error);
    }
  }
}
