/**
 * Lazy-loaded analytics wrapper
 * Defers PostHog initialization until first analytics event
 */

let analyticsModule: typeof import('./analytics') | null = null;

async function loadAnalytics() {
  if (!analyticsModule) {
    analyticsModule = await import('./analytics');
  }
  return analyticsModule;
}

export async function trackPageView(pageName: string) {
  const analytics = await loadAnalytics();
  return analytics.trackPageView(pageName);
}

export async function saveplus_audit_event(
  eventName: string,
  properties?: Record<string, any>
) {
  const analytics = await loadAnalytics();
  return analytics.saveplus_audit_event(eventName, properties);
}

export async function trackEvent(
  eventType: string,
  metadata?: Record<string, any>
) {
  const analytics = await loadAnalytics();
  return analytics.trackEvent(eventType, metadata);
}

export async function identifyUser(traits?: Record<string, any>) {
  const analytics = await loadAnalytics();
  return analytics.identifyUser(traits);
}

export async function resetAnalytics() {
  if (analyticsModule) {
    return analyticsModule.resetAnalytics();
  }
}

