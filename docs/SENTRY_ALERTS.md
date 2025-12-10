# Sentry Alert Configuration Guide

This document provides recommended alert configurations for $ave+ production monitoring.

## Prerequisites

1. Access to Sentry dashboard at https://sentry.io
2. Navigate to your project → Settings → Alerts

## Recommended Alert Rules

### 1. Critical Error Spike (High Priority)

**Purpose:** Alert when error rate increases significantly, indicating a potential incident.

**Configuration:**
- **Alert Type:** Issue Alert
- **Trigger:** When unique issues in 5 minutes > 10
- **Filter:** `level:error OR level:fatal`
- **Action:** Send notification to Slack #alerts channel + Email

```
IF: An issue is seen more than 10 times in 5 minutes
THEN: Send a notification to Slack and Email
```

### 2. New Error Alert (Medium Priority)

**Purpose:** Get notified immediately when a new, unseen error occurs.

**Configuration:**
- **Alert Type:** Issue Alert
- **Trigger:** A new issue is created
- **Filter:** `is:unresolved firstSeen:-1h`
- **Action:** Send notification to Slack #dev-alerts

```
IF: A new issue is created
THEN: Send a notification to Slack
```

### 3. Performance Degradation - LCP (High Priority)

**Purpose:** Alert when Largest Contentful Paint exceeds poor threshold (4+ seconds).

**Configuration:**
- **Alert Type:** Metric Alert
- **Metric:** `measurements.lcp`
- **Threshold:** p75 > 4000ms for 10 minutes
- **Action:** Send notification to Slack + Email

```
IF: p75(measurements.lcp) > 4000ms for 10 minutes
THEN: Send a critical notification
```

### 4. API Latency Alert (Medium Priority)

**Purpose:** Alert when API response times are degraded.

**Configuration:**
- **Alert Type:** Metric Alert
- **Metric:** `api.response_time`
- **Threshold:** p95 > 5000ms for 5 minutes
- **Action:** Send notification to Slack

```
IF: p95(api.response_time) > 5000ms for 5 minutes
THEN: Send a warning notification
```

### 5. Edge Function Errors (High Priority)

**Purpose:** Alert on any errors in critical edge functions.

**Configuration:**
- **Alert Type:** Issue Alert
- **Trigger:** Issue seen with tag `runtime:deno`
- **Filter:** `tags.function:* level:error`
- **Action:** Send notification to Slack + Email

```
IF: Error in edge function
THEN: Send immediate notification
```

### 6. Web Vitals CLS Regression (Medium Priority)

**Purpose:** Alert when Cumulative Layout Shift indicates poor UX.

**Configuration:**
- **Alert Type:** Metric Alert
- **Metric:** `web_vitals.cls`
- **Threshold:** p75 > 0.25 for 15 minutes
- **Action:** Send notification to Slack

```
IF: p75(web_vitals.cls) > 0.25 for 15 minutes
THEN: Send a warning notification
```

### 7. Dashboard Generation Failures (Critical)

**Purpose:** Alert when Claude dashboard generation fails repeatedly.

**Configuration:**
- **Alert Type:** Issue Alert
- **Trigger:** Error in `generate-dashboard-layout` function
- **Filter:** `tags.function:generate-dashboard-layout`
- **Threshold:** > 5 occurrences in 10 minutes
- **Action:** Send notification to Slack + Email + PagerDuty

## Alert Channels Setup

### Email Configuration

1. Go to Settings → Integrations → Email
2. Add team member emails for critical alerts
3. Configure digest frequency (immediate for critical, daily for low priority)

### Slack Integration

1. Go to Settings → Integrations → Slack
2. Install Sentry Slack app
3. Configure channels:
   - `#sentry-alerts` - All critical alerts
   - `#sentry-performance` - Performance degradation alerts
   - `#sentry-errors` - Error tracking alerts

### PagerDuty (Optional)

For on-call rotation and incident management:

1. Go to Settings → Integrations → PagerDuty
2. Connect your PagerDuty account
3. Map critical alerts to PagerDuty services

## Alert Routing Matrix

| Alert Type | Slack Channel | Email | PagerDuty |
|------------|---------------|-------|-----------|
| Critical Error Spike | #sentry-alerts | Yes | Yes |
| New Errors | #sentry-errors | No | No |
| LCP Degradation | #sentry-performance | Yes | No |
| API Latency | #sentry-performance | No | No |
| Edge Function Errors | #sentry-alerts | Yes | Yes |
| CLS Regression | #sentry-performance | No | No |
| Dashboard Failures | #sentry-alerts | Yes | Yes |

## Testing Alerts

To test your alert configuration:

1. Go to Settings page in $ave+
2. Click "Test Error" button (dev mode only)
3. Verify alert is received in configured channels

## Maintenance Windows

To prevent alert fatigue during deployments:

1. Go to Alerts → Mute Alerts
2. Set maintenance window (max 1 hour recommended)
3. Add deployment notes for context

## Metrics Tracked

The following custom metrics are sent to Sentry:

- `web_vitals.lcp` - Largest Contentful Paint
- `web_vitals.fid` - First Input Delay
- `web_vitals.cls` - Cumulative Layout Shift
- `web_vitals.fcp` - First Contentful Paint
- `web_vitals.ttfb` - Time to First Byte
- `web_vitals.inp` - Interaction to Next Paint
- `api.response_time` - API call durations
- `page.load_time` - Page load durations
- `navigation.count` - Navigation events

## Troubleshooting

### Alerts not firing

1. Check if SENTRY_DSN is configured
2. Verify sample rate isn't too low (production: 0.2)
3. Check alert conditions match actual error patterns

### Too many alerts

1. Increase thresholds
2. Add more specific filters
3. Configure alert digests instead of immediate notifications

### Missing metrics

1. Ensure `reportWebVitalsToSentry()` is called in main.tsx
2. Check browser console for Web Vitals errors
3. Verify Sentry SDK is properly initialized
