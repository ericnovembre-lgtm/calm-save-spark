# $ave+ Analytics Guide

Privacy-first analytics system for tracking user behavior and app performance.

## Overview

The analytics module provides:
- **PostHog integration** (optional) for advanced analytics
- **Fallback REST endpoint** via Supabase edge function for reliable event storage
- **Privacy-first design**: User IDs are hashed, amounts are bucketed, PII is stripped
- **Drop-in API**: Preserves existing `saveplus_audit_event()` function signature

## Quick Start

### Basic Usage

```typescript
import { saveplus_audit_event } from '@/lib/analytics';

// Track any event
saveplus_audit_event('button_clicked', {
  button_name: 'save_goal',
  amount: 250, // Automatically bucketed to "100-250"
});

// Track page views
import { trackPageView } from '@/lib/analytics';
trackPageView('/dashboard');

// Identify user (after login)
import { identifyUser } from '@/lib/analytics';
identifyUser({ plan: 'premium' });

// Reset on logout
import { resetAnalytics } from '@/lib/analytics';
resetAnalytics();
```

## PostHog Setup (Optional)

PostHog provides advanced features like session recording, feature flags, and A/B testing.

### 1. Sign up for PostHog
- Visit [posthog.com](https://posthog.com)
- Create a free account (1M events/month free)
- Get your **Project API Key** from Settings → Project

### 2. Add Environment Variables

Add to your `.env` file (not tracked in git):

```env
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com
```

> **Note**: If PostHog is not configured, events will only be sent to the fallback endpoint.

### 3. Verify Setup

Open your browser console and trigger an event. You should see:
```
[Analytics] PostHog initialized
[Analytics] button_clicked { ... }
```

Check PostHog dashboard after ~1 minute to see events.

## Privacy Features

### 1. User ID Hashing
User IDs are hashed using SHA-256 before sending to any analytics service:
```typescript
// Original: "user-123-abc-456"
// Hashed:   "a1b2c3d4e5f6g7h8"
```

### 2. Amount Bucketing
Monetary amounts are automatically bucketed into ranges:
```typescript
saveplus_audit_event('goal_created', {
  amount: 1250, // Becomes "1000-2500"
  goal_type: 'vacation'
});
```

### 3. PII Stripping
Fields like `email`, `phone`, `password`, `address` are automatically removed:
```typescript
saveplus_audit_event('form_submitted', {
  email: 'user@example.com', // Removed
  goal: 'buy_car' // Kept
});
// Only 'goal' is sent
```

## Analytics Database

All events are stored in the `analytics_events` table via Supabase:

### Schema
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  event TEXT NOT NULL,
  properties JSONB,
  user_hashed TEXT,
  route TEXT,
  timestamp TIMESTAMPTZ
);
```

### Querying Events

Only admin users can view analytics data:

```typescript
// Set user role to 'admin' in auth metadata
const { data } = await supabase
  .from('analytics_events')
  .select('*')
  .eq('event', 'goal_created')
  .order('timestamp', { ascending: false })
  .limit(100);
```

### Edge Function

The `analytics` edge function handles event storage:
- **Endpoint**: `/functions/v1/analytics`
- **Method**: POST
- **Auth**: Public (no JWT required)
- **Body**:
  ```json
  {
    "event": "button_clicked",
    "properties": { "button_name": "save_goal" },
    "userId": "hashed_user_id",
    "timestamp": "2025-11-01T12:00:00Z"
  }
  ```

## Common Events

Here are recommended event names for consistency:

### User Actions
- `user_signup` - New user registration
- `user_login` - User login
- `user_logout` - User logout
- `profile_updated` - Profile changes

### Goals
- `goal_created` - New goal created
- `goal_updated` - Goal modified
- `goal_deleted` - Goal removed
- `goal_completed` - Goal achieved

### Transactions
- `transaction_added` - New transaction
- `transaction_categorized` - Transaction category changed
- `transfer_initiated` - Money transfer started

### Navigation
- `page_view` - Page viewed
- `feature_viewed` - Specific feature accessed
- `modal_opened` - Modal/dialog opened

### Settings
- `theme_changed` - Theme switched
- `notification_toggled` - Notification settings changed
- `language_changed` - Language preference updated

## Troubleshooting

### Events Not Appearing in PostHog

1. Check browser console for PostHog initialization
2. Verify `VITE_POSTHOG_KEY` is set correctly
3. Check PostHog project settings → Allowed origins
4. Try disabling ad blockers (they may block PostHog)

### Events Not Saving to Database

1. Check edge function logs:
   ```bash
   # View in Lovable Cloud
   Project → Cloud → Functions → analytics → Logs
   ```

2. Verify RLS policies allow inserts
3. Check Supabase service role key is set

### Type Errors with Analytics

Make sure to import from the correct path:
```typescript
// ✅ Correct
import { saveplus_audit_event } from '@/lib/analytics';

// ❌ Wrong
import { saveplus_audit_event } from './analytics';
```

## Advanced Usage

### Custom Properties

Add any custom properties to events:
```typescript
saveplus_audit_event('feature_used', {
  feature_name: 'auto_save',
  frequency: 'daily',
  config: { threshold: 100 },
  // Automatically includes: route, timestamp, user_hashed
});
```

### Conditional Tracking

Track events only in specific conditions:
```typescript
if (import.meta.env.PROD) {
  // Only track in production
  saveplus_audit_event('beta_feature_used', { feature: 'ai_insights' });
}
```

### Error Tracking

Track errors with context:
```typescript
try {
  await createGoal(goalData);
} catch (error) {
  saveplus_audit_event('error_occurred', {
    error_type: 'goal_creation_failed',
    error_message: error.message,
    context: { goalType: goalData.type }
  });
  throw error;
}
```

## Performance

- Events are sent asynchronously (non-blocking)
- Failed events are logged but don't break the app
- PostHog batches events automatically
- Fallback endpoint has <100ms latency

## Security

- ✅ User IDs hashed before transmission
- ✅ PII automatically stripped
- ✅ Amounts bucketed (no exact values)
- ✅ CORS enabled for web app access
- ✅ RLS policies restrict database access
- ✅ Service role key secured in edge function env

## Credits

Built for $ave+ using:
- [PostHog](https://posthog.com) - Product analytics
- [Supabase](https://supabase.com) - Backend infrastructure
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - SHA-256 hashing
