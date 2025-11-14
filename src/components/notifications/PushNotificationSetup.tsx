import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, BellOff, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const PushNotificationSetup = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Check if push notifications are supported
    if (!("Notification" in window)) {
      return;
    }

    // Check current permission
    setPermission(Notification.permission);

    // Check if already subscribed
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === "granted") {
        await subscribeToPushNotifications();
        toast.success("Push notifications enabled!");
      } else {
        toast.error("Push notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast.error("Failed to request permission");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from environment (you'll need to generate this)
      const vapidPublicKey = "BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8-fTt3UUIYq7lKQWxP_3hFt0B9R4X5HCmFgxN1vXnB9h4bQV4lJBSI";
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // Send subscription to backend
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("push_subscriptions")
        .insert({
          user_id: session.user.id,
          endpoint: subscription.endpoint,
          p256dh: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh") || new ArrayBuffer(0)))
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth") || new ArrayBuffer(0)))
          ),
          user_agent: navigator.userAgent,
        });

      if (error) throw error;

      setIsSubscribed(true);
    } catch (error) {
      console.error("Error subscribing to push:", error);
      throw error;
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from backend
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", session.user.id)
            .eq("endpoint", subscription.endpoint);
        }

        setIsSubscribed(false);
        toast.success("Push notifications disabled");
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to unsubscribe");
    } finally {
      setIsLoading(false);
    }
  };

  const variants = prefersReducedMotion ? {} : {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  // Don't show if push notifications not supported
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isSubscribed ? "bg-primary/10" : "bg-muted"
          }`}>
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-primary" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Push Notifications
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Get notified about savings milestones, goal achievements, and important alerts
          </p>

          <AnimatePresence mode="wait">
            {permission === "default" && (
              <motion.div {...variants} key="request">
                <Button
                  size="sm"
                  onClick={requestPermission}
                  disabled={isLoading}
                  className="w-full"
                >
                  Enable Notifications
                </Button>
              </motion.div>
            )}

            {permission === "granted" && !isSubscribed && (
              <motion.div {...variants} key="subscribe">
                <Button
                  size="sm"
                  onClick={subscribeToPushNotifications}
                  disabled={isLoading}
                  className="w-full"
                >
                  Subscribe to Notifications
                </Button>
              </motion.div>
            )}

            {permission === "granted" && isSubscribed && (
              <motion.div {...variants} key="subscribed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={unsubscribeFromPush}
                    disabled={isLoading}
                  >
                    Disable
                  </Button>
                </div>
              </motion.div>
            )}

            {permission === "denied" && (
              <motion.div {...variants} key="denied">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <X className="w-4 h-4" />
                  <span>Permission denied. Enable in browser settings.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};
