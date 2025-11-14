# $ave+ Testing Guide

## PWA Installation Testing

### iOS (Safari) - iPhone/iPad

**Prerequisites:**
- iOS 16.4+ or macOS 13+
- Safari browser

**Steps:**
1. Open Safari and navigate to your $ave+ URL
2. Tap the Share button (box with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Verify the icon preview shows the $ave+ logo (not generic)
5. Tap "Add" in the top right
6. Return to home screen and find the $ave+ icon
7. Tap icon to launch app
8. Verify app opens without browser UI (no address bar)

**Offline Test:**
1. Enable Airplane Mode
2. Launch $ave+ from home screen
3. Navigate between cached pages
4. Verify pages load (may see cached data)

**Troubleshooting:**
- Icon not showing? Clear cache: Settings → Safari → Clear History and Website Data
- Can't install? Make sure you're on HTTPS and have visited the site before
- Check: Settings → Safari → Advanced → Website Data (should see $ave+ cached)

---

### Android (Chrome)

**Prerequisites:**
- Android 5.0+
- Chrome browser

**Steps:**
1. Open Chrome and navigate to your $ave+ URL
2. Look for install banner at bottom OR
3. Tap menu (⋮) → "Install app" or "Add to Home screen"
4. Verify icon preview shows $ave+ logo
5. Tap "Install" or "Add"
6. App icon appears on home screen
7. Launch app from home screen
8. Verify standalone mode (no browser UI)

**Offline Test:**
1. Enable Airplane Mode
2. Launch $ave+ from home screen
3. Navigate app and verify cached content works

**Troubleshooting:**
- No install option? Visit chrome://flags and enable "App Banners"
- Check service worker: chrome://serviceworker-internals
- Clear data: Settings → Apps → $ave+ → Storage → Clear Cache

---

### Desktop (Chrome/Edge)

**Prerequisites:**
- Chrome 70+ or Edge 79+

**Steps:**
1. Open browser and navigate to $ave+ URL
2. Look for install icon (⊕) in address bar
3. Click install icon
4. Click "Install" in popup dialog
5. App opens in standalone window
6. Find app in Start Menu (Windows) or Applications (Mac)
7. Launch from desktop shortcut

**Offline Test:**
1. Disconnect from internet
2. Launch $ave+ app
3. Verify cached pages load
4. Check service worker: chrome://serviceworker-internals

---

## Bundle Size Analysis

### View Bundle Analysis

**After building:**
1. Run `npm run build`
2. Open `dist/stats.html` in browser
3. Analyze the visualization:
   - **Large blocks** = big dependencies
   - **Hover** to see exact sizes
   - **Click** to see what's inside each bundle

### Common Large Dependencies to Check

**Expected Large Deps:**
- `react` + `react-dom` (~150KB)
- `framer-motion` (~100KB)
- `recharts` (if used) (~200KB)
- `lottie-react` (if used) (~300KB)

**Optimization Strategies:**
1. **Already Implemented:**
   - ✅ Lazy loading (Welcome page components)
   - ✅ Code splitting (React.lazy)
   - ✅ Progressive loading (ProgressiveLoader)
   - ✅ Tree shaking (Vite automatic)

2. **Further Optimizations:**
   - Replace heavy libraries with lighter alternatives
   - Remove unused imports
   - Use dynamic imports for rarely-used features
   - Consider CDN for very large libraries

### Target Metrics
- **Main bundle**: < 500KB (currently 3.3MB needs optimization)
- **Initial load**: < 1MB
- **LCP**: < 2.5s
- **FCP**: < 1.8s

---

## Push Notification Testing

### 1. Enable Notifications

**In App:**
1. Navigate to Settings → Notifications
2. Look for "Push Notifications" card
3. Click "Enable Notifications"
4. Grant permission in browser dialog
5. Verify status shows "Active"

### 2. Test with Browser Console

**Open browser console** (F12) and run:

```javascript
// Test if notifications work
window.testPushNotification()
```

This will:
- ✅ Check if notifications are supported
- ✅ Verify permission is granted
- ✅ Confirm service worker is active
- ✅ Check subscription status
- ✅ Show a test notification

**Expected Output:**
```
✅ Everything ready! Showing test notification...
✅ Test notification shown!
💡 Click the notification to navigate to dashboard
```

### 3. Test Database Integration

**Check subscription stored:**
1. Open Backend (Cloud tab)
2. Navigate to Database → Tables
3. Select `push_subscriptions` table
4. Verify your user_id has a row
5. Check endpoint, p256dh, and auth fields are populated

**Queue a test notification:**
```sql
-- Run this in Backend → Database → SQL Editor
INSERT INTO notification_queue (
  user_id,
  notification_type,
  title,
  body,
  status
) VALUES (
  'YOUR_USER_ID_HERE',
  'test',
  'Test Notification',
  'This is a test from the database',
  'pending'
);
```

### 4. Test Edge Function

**Manually trigger send:**
1. Open Backend → Edge Functions
2. Find `send-push-notification`
3. Click "Invoke"
4. Should process pending notifications

---

## VAPID Keys Setup

### 1. Generate Keys Locally

**You need to run this on your local machine:**

```bash
# Install web-push CLI globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

**Output will look like:**
```
=======================================

Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8-fTt3UUIYq7lKQWxP_3hFt0B9R4X5HCmFgxN1vXnB9h4bQV4lJBSI

Private Key:
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW...

=======================================
```

**⚠️ IMPORTANT:** 
- Keep the private key SECRET
- The public key is safe to commit to code
- NEVER share or commit the private key

### 2. Add Keys to Lovable

**I'll prepare the secrets for you:**

[I'll invoke the add secrets tool]

### 3. Update Code with Public Key

**After adding secrets, update:**
`src/components/notifications/PushNotificationSetup.tsx`

Change line ~74:
```typescript
const vapidPublicKey = "YOUR_PUBLIC_KEY_HERE";
```

### 4. Update Edge Function

**Install web-push in edge function:**
Add to `supabase/functions/send-push-notification/index.ts`:

```typescript
import webpush from "npm:web-push@3.6.6";

// Setup VAPID
webpush.setVapidDetails(
  'mailto:support@saveplus.app',
  Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
  Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
);

// In sendPushNotification function:
await webpush.sendNotification(subscription, JSON.stringify(payload));
```

---

## Complete Testing Checklist

### PWA Installation
- [ ] iOS Safari install and offline test
- [ ] Android Chrome install and offline test
- [ ] Desktop Chrome install and offline test
- [ ] Icons display correctly on all platforms
- [ ] Standalone mode works (no browser UI)
- [ ] Offline caching works for main pages
- [ ] Service worker registered successfully

### Bundle Size
- [ ] Build project and check dist/stats.html
- [ ] Identify dependencies > 100KB
- [ ] Verify lazy loading is working
- [ ] Check LCP < 2.5s (Lighthouse)
- [ ] Check FCP < 1.8s (Lighthouse)

### Push Notifications
- [ ] Enable notifications in settings
- [ ] Verify subscription saved to database
- [ ] Run `testPushNotification()` in console
- [ ] Test notification appears
- [ ] Click notification navigates correctly
- [ ] Queue notification via SQL
- [ ] Trigger send-push-notification function
- [ ] Verify notification delivered

### VAPID Keys (Production)
- [ ] Generate VAPID keys locally
- [ ] Add keys to Lovable secrets
- [ ] Update public key in PushNotificationSetup
- [ ] Update edge function with web-push
- [ ] Test end-to-end notification delivery
- [ ] Verify encryption works

---

## Debugging Tips

### PWA Issues
**"Can't install app"**
- Must be HTTPS (or localhost)
- Manifest must be valid
- Service worker must register successfully
- Check browser console for errors

**"Icons not showing"**
- Verify files exist: `/public/icon-192.png`, `/public/icon-512.png`
- Check manifest references correct paths
- Clear browser cache and retry

**"Offline doesn't work"**
- Check service worker registered: chrome://serviceworker-internals
- Verify workbox caching in Network tab (look for "(from ServiceWorker)")
- Check cache storage: DevTools → Application → Cache Storage

### Bundle Size Issues
**"Bundle too large"**
- Run bundle analyzer
- Look for duplicate dependencies
- Check for unused imports
- Consider lazy loading more components
- Use lighter alternatives for heavy libraries

### Push Notification Issues
**"Permission denied"**
- User must grant permission manually
- Can't be programmatically changed
- User must enable in browser settings

**"No subscription"**
- Check push_subscriptions table has row
- Verify service worker supports push
- Check browser compatibility

**"Notification not received"**
- Verify VAPID keys are set
- Check edge function logs for errors
- Ensure web-push library is installed
- Verify subscription is still valid

---

## Performance Metrics

### Target Metrics
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s
- **Bundle Size**: < 500KB (gzipped)

### How to Measure
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Performance" category
4. Click "Analyze page load"
5. Review metrics and suggestions

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Review edge function logs in Backend
3. Verify database tables have data
4. Check service worker status
5. Test in different browsers

For production issues:
- Monitor edge function logs
- Track notification delivery rates
- Set up error alerts
- Review user feedback
