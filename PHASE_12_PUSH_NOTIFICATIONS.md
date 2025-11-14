# Phase 12: Push Notifications System

## Overview
Phase 12 implements a comprehensive push notification system for $ave+, enabling users to receive real-time alerts about savings milestones, goal achievements, and important financial events directly in their browser.

## Implementation Date
November 14, 2025

---

## 1. Database Schema

### push_subscriptions Table
Stores user push notification subscriptions with Web Push API credentials.

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, endpoint)
);
```

**Fields:**
- `endpoint`: Push service URL from browser
- `p256dh`: Public key for encryption
- `auth`: Authentication secret
- `user_agent`: Browser information for debugging

**RLS Policies:**
- Users can view their own subscriptions
- Users can create their own subscriptions
- Users can delete their own subscriptions

### notification_queue Table
Queues notifications for delivery to users.

```sql
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  badge TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP
);
```

**Status Values:**
- `pending`: Waiting to be sent
- `sent`: Successfully delivered
- `failed`: Delivery failed

**RLS Policies:**
- Users can view their own notifications

---

## 2. Push Notification Setup Component

### Location
`src/components/notifications/PushNotificationSetup.tsx`

### Features

#### Permission Flow
1. **Check Support**: Detects if browser supports push notifications
2. **Check Permission**: Reads current notification permission state
3. **Request Permission**: Prompts user for notification permission
4. **Subscribe**: Registers push subscription with service worker

#### Subscription Management
```typescript
const subscribeToPushNotifications = async () => {
  // Get service worker registration
  const registration = await navigator.serviceWorker.ready;
  
  // Subscribe with VAPID key
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedVapidKey,
  });
  
  // Save to database
  await supabase.from("push_subscriptions").insert({
    endpoint: subscription.endpoint,
    p256dh: btoa(subscription.getKey("p256dh")),
    auth: btoa(subscription.getKey("auth")),
  });
};
```

#### States Handled
- **Default**: Show "Enable Notifications" button
- **Granted**: Show "Subscribe" button or "Active" status
- **Denied**: Show message to enable in browser settings
- **Subscribed**: Show "Active" with disable option

#### Visual Design
- Compact card layout
- Icon indication of status (Bell/BellOff)
- Clear action buttons
- Loading states
- Smooth animations

---

## 3. Service Worker Push Handler

### Location
`public/sw-push.js`

### Push Event Handler
Listens for incoming push notifications from the push service:

```javascript
self.addEventListener('push', (event) => {
  const payload = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      data: payload.data,
      vibrate: [200, 100, 200],
    })
  );
});
```

### Notification Click Handler
Opens app when user clicks notification:

```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
```

### Features
- **Custom Payload**: Parses JSON data from push service
- **Vibration**: Provides haptic feedback on mobile
- **Deep Links**: Opens specific app pages via data.url
- **Tag System**: Groups related notifications
- **Close Tracking**: Logs when users dismiss notifications

---

## 4. Backend Edge Functions

### send-push-notification
**Location**: `supabase/functions/send-push-notification/index.ts`

**Purpose**: Processes notification queue and sends push notifications

**Flow:**
1. Fetch pending notifications from queue
2. Join with user push subscriptions
3. Send notification to each subscription endpoint
4. Mark notifications as sent/failed
5. Log results

**Implementation Status:**
- ✅ Database queries
- ✅ Queue processing
- ✅ Status updates
- ⚠️ Actual push sending (requires web-push library and VAPID keys)

**TODO for Production:**
```typescript
// Install web-push library
import webpush from "npm:web-push";

// Set VAPID keys
webpush.setVapidDetails(
  'mailto:support@saveplus.app',
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

// Send notification
await webpush.sendNotification(subscription, JSON.stringify(payload));
```

### queue-milestone-notification
**Location**: `supabase/functions/queue-milestone-notification/index.ts`

**Purpose**: Queues notifications for user milestones and achievements

**Usage:**
```typescript
await supabase.functions.invoke('queue-milestone-notification', {
  body: {
    userId: 'user-uuid',
    milestoneType: 'goal_completed',
    title: 'Goal Achieved! 🎉',
    body: 'You completed your Emergency Fund goal!',
    data: { goalId: 'goal-uuid', url: '/goals' }
  }
});
```

**Features:**
- Checks if user has push subscriptions
- Queues notification with all metadata
- Triggers send-push-notification function
- Returns queued notification details

---

## 5. Integration Points

### Settings Page
Added to notification preferences section:
- Shows push notification setup card
- Placed above email/push toggles
- Provides clear enable/disable flow

### Dashboard
Can be triggered for:
- **Transfer Complete**: "Transfer of $50 completed successfully"
- **Goal Milestone**: "You're 50% of the way to your goal!"
- **Streak Achievement**: "5 day streak! Keep it up!"

### Achievements System
Integration point for:
- Badge unlocked notifications
- Level up notifications
- Special milestone notifications

---

## 6. Notification Types

### Savings Milestones
- First $100 saved
- First $1,000 saved
- Goal 25% complete
- Goal 50% complete
- Goal 75% complete
- Goal 100% complete

### Goal Events
- New goal created
- Goal deadline approaching
- Goal completed
- Goal archived

### Transfer Events
- Scheduled transfer executing
- Transfer completed
- Transfer failed
- Large transfer detected

### Achievement Events
- New badge earned
- New level reached
- Streak milestone
- Challenge completed

### Alerts
- Budget exceeded
- Low balance warning
- Unusual spending detected
- Bill due soon

---

## 7. User Experience Flow

### First Time Setup
1. User visits Settings → Notifications
2. Sees "Push Notifications" card
3. Clicks "Enable Notifications"
4. Browser shows permission prompt
5. User grants permission
6. App subscribes to push service
7. Subscription saved to database
8. User sees "Active" status

### Receiving Notifications
1. Milestone event occurs (e.g., goal completed)
2. Backend calls `queue-milestone-notification`
3. Notification added to queue
4. `send-push-notification` processes queue
5. Push service delivers to browser
6. Service worker displays notification
7. User sees notification on device
8. User clicks → opens app to relevant page

### Disabling Notifications
1. User clicks "Disable" in settings
2. App unsubscribes from push service
3. Subscription removed from database
4. User sees inactive state

---

## 8. Security & Privacy

### Data Encryption
- Push endpoint URLs are public
- Payload is encrypted using p256dh key
- Only intended browser can decrypt

### Permission Model
- Explicit user consent required
- Can be revoked at any time
- Respects browser permission state

### Data Storage
- Only stores subscription credentials
- No message content stored long-term
- Failed notifications logged for debugging

### RLS Protection
- Users can only see own subscriptions
- Service role key used for sending
- No cross-user data access

---

## 9. Browser Compatibility

### Supported
- ✅ Chrome 50+ (Desktop & Mobile)
- ✅ Firefox 44+ (Desktop & Mobile)
- ✅ Edge 17+
- ✅ Opera 37+
- ✅ Safari 16+ (macOS 13+, iOS 16.4+)

### Not Supported
- ❌ Internet Explorer
- ❌ Older Safari versions
- ❌ Some mobile browsers

### Graceful Degradation
- Component doesn't render if unsupported
- Falls back to email notifications
- No errors for unsupported browsers

---

## 10. Production Setup Requirements

### VAPID Keys
**Generate keys:**
```bash
npx web-push generate-vapid-keys
```

**Add to Supabase Secrets:**
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (mailto:email)

### Web Push Library
**Add to edge function:**
```typescript
import webpush from "npm:web-push@3.6.6";
```

### Service Worker Registration
Already configured in `vite.config.ts` via VitePWA plugin.

### Testing
1. Enable notifications in settings
2. Manually queue notification via function
3. Check browser receives notification
4. Verify click opens correct page

---

## 11. Monitoring & Analytics

### Metrics to Track
- **Subscription Rate**: % of users who enable push
- **Delivery Rate**: % of notifications delivered
- **Click-Through Rate**: % of notifications clicked
- **Unsubscribe Rate**: % of users who disable
- **Error Rate**: % of failed deliveries

### Logging
- All send attempts logged in edge function
- Failed deliveries stored with error message
- Subscription changes tracked

### Debugging
- Check notification_queue table for pending
- Review edge function logs for errors
- Verify push_subscriptions table has entries
- Test with browser dev tools

---

## 12. Future Enhancements

### Phase 12.1: Rich Notifications
- Action buttons ("View Goal", "Dismiss")
- Inline images for milestones
- Progress bars in notifications
- Custom sounds per notification type

### Phase 12.2: Smart Delivery
- Time-based delivery (don't send at night)
- Frequency capping (max N per day)
- Priority levels (urgent vs info)
- User preference per notification type

### Phase 12.3: Advanced Features
- Notification grouping (stack related notifications)
- Silent notifications (background sync)
- Geofencing (location-based triggers)
- Device targeting (desktop vs mobile)

### Phase 12.4: Analytics Dashboard
- Real-time delivery status
- Engagement metrics
- A/B testing notification content
- Unsubscribe reasons

---

## Known Limitations

1. **iOS Safari**: Requires iOS 16.4+ and macOS 13+
2. **VAPID Keys**: Need to be generated and configured
3. **Web Push Library**: Not yet integrated in send function
4. **No Batch Sending**: Sends one-by-one (can be optimized)
5. **No Retry Logic**: Failed sends not automatically retried

---

## Testing Checklist

- [ ] Enable notifications in settings
- [ ] Verify subscription saved to database
- [ ] Queue test notification via edge function
- [ ] Confirm notification appears in browser
- [ ] Click notification and verify navigation
- [ ] Disable notifications and verify unsubscribe
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Verify RLS policies work correctly
- [ ] Check edge function logs for errors

---

## Files Created/Modified

### Created
- `src/components/notifications/PushNotificationSetup.tsx`
- `supabase/functions/send-push-notification/index.ts`
- `supabase/functions/queue-milestone-notification/index.ts`
- `public/sw-push.js`
- `PHASE_12_PUSH_NOTIFICATIONS.md`

### Modified
- `src/components/settings/NotificationPreferences.tsx`
- `vite.config.ts`
- Database: Added push_subscriptions and notification_queue tables

---

## Conclusion

Phase 12 establishes the foundation for real-time push notifications in $ave+. The system is ready for testing and can be put into production once VAPID keys are configured and the web-push library is integrated into the send-push-notification function.

The architecture supports:
- Scalable notification delivery
- Multiple notification types
- User preference management
- Cross-browser compatibility
- Secure subscription handling

Next phase (Phase 13) will add contextual help system with floating tooltips and enhanced help center.
