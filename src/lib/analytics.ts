/**
 * Analytics utilities for $ave+
 * Privacy-first event tracking with PostHog + fallback Supabase edge function
 */

'use client'

import posthog from 'posthog-js';
import { supabase } from '@/integrations/supabase/client';
import { getClientUser } from './user';
import { hashUserId } from './hash';

// PostHog configuration
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

/**
 * Get or create session ID for analytics
 */
const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'ssr_session';
  let sid = sessionStorage.getItem('analytics_session');
  if (!sid) {
    sid = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem('analytics_session', sid);
  }
  return sid;
};

/**
 * Bucket monetary amounts into ranges for privacy
 */
const getAmountRange = (amount: number): string => {
  if (amount < 50) return '0-50';
  if (amount < 100) return '50-100';
  if (amount < 250) return '100-250';
  if (amount < 500) return '250-500';
  if (amount < 1000) return '500-1000';
  return '1000+';
};

// Initialize PostHog lazily
let phInit = false;

function ensurePostHog() {
  if (phInit || typeof window === 'undefined') return;
  if (POSTHOG_KEY && POSTHOG_HOST) {
    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false,
        capture_pageview: false,
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            posthog.debug(); // Enable debug mode in development
          }
        },
      });
      phInit = true;
      console.log('[Analytics] PostHog initialized');
    } catch (error) {
      console.warn('[Analytics] PostHog initialization failed:', error);
    }
  }
}

/**
 * Core event tracking function
 */
export const trackEvent = async (eventType: string, metadata: Record<string, any> = {}) => {
  try {
    const user = await getClientUser();
    const userIdHash = await hashUserId(user?.id);

    const payload = {
      event_type: eventType,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 120) : '',
        page_url: typeof window !== 'undefined' ? window.location.pathname : ''
      },
      session_id: getSessionId(),
      user_id_hash: userIdHash
    };

    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', eventType, payload.metadata);
    }

    // Prefer PostHog
    ensurePostHog();
    if (phInit) {
      posthog.capture(eventType, { 
        ...payload.metadata, 
        session_id: payload.session_id, 
        user_id_hash: payload.user_id_hash 
      });
      if (userIdHash) posthog.identify(userIdHash);
      return;
    }

    // Fallback to Supabase edge function
    const { data, error: invokeError } = await supabase.functions.invoke('analytics', {
      body: {
        event: eventType,
        properties: payload.metadata,
        userId: userIdHash,
        timestamp: payload.metadata.timestamp,
      },
    });
    
    // Log invoke errors but don't throw - analytics should never break the app
    if (invokeError) {
      console.warn('[Analytics] Edge function error (non-blocking):', invokeError);
    }
    if (data?.error) {
      console.warn('[Analytics] Edge function returned error (non-blocking):', data.error);
    }
  } catch (error) {
    // Analytics errors should never crash the app - log and continue
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Tracking error (non-blocking):', error);
    }
    // Silent in production to avoid console spam
  }
};

/**
 * Audit event logging (console + optional PostHog)
 * Preserves existing API: saveplus_audit_event(event, details)
 */
export const saveplus_audit_event = async (event: string, details: Record<string, any> = {}) => {
  try {
    const route = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // Console audit for quick inspection
    console.log('AUDIT_EVENT:', { 
      event, 
      details, 
      route, 
      timestamp: new Date().toISOString() 
    });
    
    // Also capture to PostHog (as audit event)
    ensurePostHog();
    if (phInit) {
      posthog.capture(`audit_${event}`, { ...details, route });
    }
  } catch (e) {
    console.error('[Analytics] Audit event error:', e);
  }
};

/**
 * Track page view
 */
export const trackPageView = (pageName: string) => 
  trackEvent('page_viewed', { page_name: pageName });

/**
 * Identify user (for PostHog)
 */
export const identifyUser = async (traits?: Record<string, any>) => {
  if (typeof window === 'undefined') return;

  const user = await getClientUser();
  if (!user) return;

  const userIdHash = await hashUserId(user.id);
  if (!userIdHash) return;

  ensurePostHog();
  if (phInit) {
    try {
      posthog.identify(userIdHash, {
        ...traits,
        email_domain: user.email?.split('@')[1], // Only domain, not full email
      });
    } catch (error) {
      console.warn('[Analytics] PostHog identify failed:', error);
    }
  }
};

/**
 * Reset user identity (on logout)
 */
export const resetAnalytics = () => {
  if (typeof window === 'undefined') return;

  if (phInit) {
    try {
      posthog.reset();
    } catch (error) {
      console.warn('[Analytics] PostHog reset failed:', error);
    }
  }
};

// ============================================================================
// ONBOARDING TRACKING
// ============================================================================

export const trackOnboardingStepStarted = (stepName: string) => 
  trackEvent('onboarding_step_started', { step_name: stepName });

export const trackOnboardingStepCompleted = (stepName: string, duration_ms: number) => 
  trackEvent('onboarding_step_completed', { step_name: stepName, duration_ms });

export const trackOnboardingSubmitted = (total_duration_ms: number) => 
  trackEvent('onboarding_submitted', { total_duration_ms });

// ============================================================================
// USER ACTIONS
// ============================================================================

export const trackSignup = () => trackEvent('signup');
export const trackLogin = () => trackEvent('login');

// ============================================================================
// GOALS
// ============================================================================

export const trackGoalCreated = (goalType: string) => 
  trackEvent('goal_created', { goal_type: goalType });

export const trackGoalFunded = (amount: number) => 
  trackEvent('goal_funded', { amount_range: getAmountRange(amount) });

// ============================================================================
// POTS
// ============================================================================

export const trackPotCreated = (potType: string) => 
  trackEvent('pot_created', { pot_type: potType });

// ============================================================================
// AUTOMATIONS
// ============================================================================

export const trackAutomationToggled = (automationType: string, enabled: boolean) => 
  trackEvent('automation_toggled', { automation_type: automationType, enabled });

export const trackScheduleCreated = (frequency: string) => 
  trackEvent('schedule_created', { frequency });

export const trackDepositRun = (amount: number) => 
  trackEvent('deposit_run', { amount_range: getAmountRange(amount) });
