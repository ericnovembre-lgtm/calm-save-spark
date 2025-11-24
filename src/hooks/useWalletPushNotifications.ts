import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useWalletPushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSupport();
    checkSubscriptionStatus();
  }, []);

  const checkSupport = () => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
  };

  const checkSubscriptionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('wallet_push_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('enabled', true)
        .single();

      setIsSubscribed(!!data);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Push notifications not supported in this browser');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const subscribe = async () => {
    try {
      setIsLoading(true);

      const hasPermission = await requestPermission();
      if (!hasPermission) {
        toast.error('Notification permission denied');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
        ),
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('wallet_push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription_data: subscription.toJSON() as any,
          enabled: true,
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('Push notifications enabled for wallet');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to enable push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('wallet_push_subscriptions')
        .update({ enabled: false })
        .eq('user_id', user.id);

      if (error) throw error;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Failed to disable push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}