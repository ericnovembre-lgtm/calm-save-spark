/**
 * Analytics utilities for $ave+
 */

export function saveplus_audit_event(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', eventName, properties)
  }

  // TODO: Send to analytics service (PostHog, Mixpanel, etc.)
  // Example: posthog.capture(eventName, properties)
}
