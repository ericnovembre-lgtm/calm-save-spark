/**
 * Test utility for push notifications
 * Use this in browser console to test push notifications manually
 */

export const testPushNotification = async () => {
  try {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.error("❌ Push notifications not supported in this browser");
      return;
    }

    // Check permission
    if (Notification.permission !== "granted") {
      console.error("❌ Notification permission not granted");
      console.log("💡 Enable notifications in Settings → Notifications");
      return;
    }

    // Check if service worker is registered
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      console.error("❌ Service worker not registered");
      return;
    }

    // Check if subscribed
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      console.error("❌ Not subscribed to push notifications");
      console.log("💡 Subscribe in Settings → Notifications");
      return;
    }

    console.log("✅ Everything ready! Showing test notification...");

    // Show a test notification
    await registration.showNotification("$ave+ Test Notification", {
      body: "This is a test notification from $ave+",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "test-notification",
      data: {
        url: "/dashboard",
      },
    } as any);

    console.log("✅ Test notification shown!");
    console.log("💡 Click the notification to navigate to dashboard");
  } catch (error) {
    console.error("❌ Error testing push notification:", error);
  }
};

// Make it available globally for console testing
if (typeof window !== "undefined") {
  (window as any).testPushNotification = testPushNotification;
}
