# $ave+ PWA & Offline Capabilities

## Overview

$ave+ is a fully-featured Progressive Web App (PWA) with comprehensive offline support, enabling users to manage their finances even without network connectivity.

---

## 🚀 PWA Features

### App Installation

- **Add to Home Screen**: Available on iOS, Android, and desktop browsers
- **Standalone Mode**: Runs as a native-feeling app without browser chrome
- **App Shortcuts**: Quick access to Dashboard and Goals from home screen icon
- **Maskable Icons**: Adaptive icons that look great on all platforms

### Web App Manifest

```json
{
  "name": "$ave+ | Effortless Automated Savings",
  "short_name": "$ave+",
  "theme_color": "#faf8f2",
  "background_color": "#faf8f2",
  "display": "standalone",
  "orientation": "portrait"
}
```

### Installation Page

Navigate to `/install` for detailed installation instructions for:
- iOS (Safari → Share → Add to Home Screen)
- Android (Chrome → Menu → Install App)
- Desktop (Chrome/Edge → Install button in address bar)

---

## 📦 Service Worker & Caching

### Caching Strategies

| Resource Type | Strategy | TTL | Max Entries |
|--------------|----------|-----|-------------|
| Google Fonts | CacheFirst | 1 year | 10 |
| Static Fonts | CacheFirst | 1 year | 10 |
| Images | CacheFirst | 30 days | 100 |
| Lottie Animations | CacheFirst | 90 days | 20 |
| API Responses | NetworkFirst | 5 min | 50 |
| JS Chunks | StaleWhileRevalidate | 7 days | 50 |
| CSS Chunks | StaleWhileRevalidate | 7 days | 30 |

### Configuration (vite.config.ts)

```typescript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
    runtimeCaching: [
      {
        urlPattern: /\/api\/.*/i,
        handler: 'NetworkFirst',
        options: {
          networkTimeoutSeconds: 10,
          cacheName: 'api-cache',
        }
      }
    ]
  }
})
```

---

## 🔄 Background Sync

### Overview

Background Sync ensures mutations (creates, updates, deletes) are never lost when offline. When connectivity is restored, the service worker automatically processes queued mutations.

### Architecture

```
User Action → Online? → Yes → Execute API Call
                ↓ No
           IndexedDB Queue
                ↓
           Register Sync Tag
                ↓
           [Connectivity Restored]
                ↓
           Service Worker Sync Event
                ↓
           Process Queue → API Calls
                ↓
           Notify Main Thread
```

### Supported Mutation Types

- `goal-sync`: Goal creation, updates, contributions
- `transaction-sync`: Manual transaction entries
- `budget-sync`: Budget modifications
- `pot-sync`: Pot transfers and updates

### Usage

```typescript
import { useOfflineMutation } from '@/hooks/useOfflineMutation';

const { mutate, isOffline, isPending } = useOfflineMutation({
  mutationFn: createGoal,
  type: 'goal',
  action: 'create',
  endpoint: '/rest/v1/goals',
  invalidateKeys: [['goals']],
});

// Works seamlessly online or offline
mutate({ name: 'Vacation Fund', target: 5000 });
```

### Retry Strategy

- **Max Retries**: 5 attempts
- **Backoff**: Exponential (1s, 2s, 4s, 8s, 16s max 30s)
- **Deduplication**: Signature-based to prevent duplicate mutations

---

## 💾 IndexedDB Dashboard Cache

### Overview

The dashboard layout and widget data are cached in IndexedDB for instant offline access. Users see their personalized dashboard immediately, even without network.

### Cache Structure

```typescript
interface DashboardCacheEntry {
  userId: string;
  cachedAt: number;
  layout: GenerativeDashboardLayout;
  widgets: Record<string, WidgetData>;
  theme: DashboardTheme;
  briefing: GenerativeBriefing;
}
```

### Staleness Detection

- **Fresh**: < 6 hours (no indicator)
- **Stale**: > 6 hours (shows "Last updated X ago")
- **TTL**: 24 hours (auto-cleared after)

### Usage

```typescript
import { useOfflineDashboard } from '@/hooks/useOfflineDashboard';

const {
  cachedData,
  isOffline,
  isStale,
  formatCacheAge,
  saveToCache,
  clearCache,
} = useOfflineDashboard();

// Display offline indicator
{isOffline && <OfflineSyncIndicator />}

// Show cache age
{isStale && <span>Data from {formatCacheAge()}</span>}
```

---

## 🔔 Push Notifications

### Setup

Push notifications require VAPID keys configured in Supabase secrets:

1. Generate VAPID keys: `npx web-push generate-vapid-keys`
2. Add `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` to secrets
3. Service worker handles subscription in `sw-push.js`

### Notification Types

- **Goal Milestones**: Progress updates (25%, 50%, 75%, 100%)
- **Bill Reminders**: Upcoming due dates
- **Streak Alerts**: At-risk streaks
- **Budget Warnings**: Approaching/exceeding limits
- **Security Alerts**: Login from new device

### Permission Request

```typescript
import { requestPushPermission } from '@/lib/push-notifications';

// Call on user action, not page load
const handleEnableNotifications = async () => {
  const granted = await requestPushPermission();
  if (granted) {
    toast({ title: 'Notifications enabled!' });
  }
};
```

---

## 📊 Offline UI Components

### OfflineSyncIndicator

Shows pending mutation count and sync status:

```tsx
<OfflineSyncIndicator showLabel compact={false} />
```

States:
- **Online**: Hidden (no indicator)
- **Offline**: CloudOff icon + pending count
- **Syncing**: Spinning refresh icon
- **Synced**: Checkmark (temporary, 2s)
- **Error**: Alert icon (temporary, 3s)

### FloatingOfflineIndicator

Mobile-optimized indicator fixed at bottom:

```tsx
<FloatingOfflineIndicator />
```

---

## 🧪 Testing Offline Scenarios

### Chrome DevTools

1. Open DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Interact with app (create goal, update budget)
4. Go back online
5. Verify mutations sync automatically

### Manual Testing Checklist

- [ ] Dashboard loads from cache when offline
- [ ] Mutations queue when offline
- [ ] Sync indicator shows pending count
- [ ] Mutations process when back online
- [ ] Toast confirms sync completion
- [ ] Queries invalidate after sync

### Automated Tests

```typescript
// Mock offline state
beforeEach(() => {
  jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
});

// Verify mutation queued
const { result } = renderHook(() => useOfflineMutation({...}));
await result.current.mutate({ name: 'Test' });
expect(await getPendingMutations()).toHaveLength(1);
```

---

## 🌐 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ✅* | ✅ |
| Add to Home Screen | ✅ | ✅ | ✅ | ✅ |

*Safari requires user to manually enable in Settings

### Fallbacks

- **No Background Sync**: Manual "Sync Now" button enabled
- **No Push**: In-app notifications only
- **No IndexedDB**: Falls back to localStorage (limited)

---

## 🔧 Troubleshooting

### "App not installing"

1. Check HTTPS is enabled
2. Verify manifest is valid: DevTools → Application → Manifest
3. Ensure service worker is registered

### "Sync not working"

1. Check Background Sync support in browser
2. Verify IndexedDB has queued mutations
3. Check service worker logs in DevTools

### "Cache not updating"

1. Force refresh: Ctrl+Shift+R
2. Clear site data in DevTools
3. Unregister service worker and reload

### "Push notifications not received"

1. Verify push permission is granted
2. Check VAPID keys are configured
3. Verify subscription is stored in database

---

## 📈 Metrics

Monitor PWA health in analytics:

- `pwa_install`: App installed to home screen
- `offline_mutation_queued`: Mutation added to offline queue
- `background_sync_success`: Sync completed successfully
- `cache_hit_rate`: Dashboard cache effectiveness

---

## 🔜 Roadmap

- [ ] Periodic Background Sync (for non-critical updates)
- [ ] Offline Maps (for merchant location features)
- [ ] Conflict Resolution UI (for sync conflicts)
- [ ] Incremental Cache Updates (partial dashboard refresh)

---

**Last Updated:** January 2025
**Status:** Phase 11 Complete ✅
