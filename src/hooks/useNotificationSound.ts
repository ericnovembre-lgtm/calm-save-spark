import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { notificationSounds } from '@/lib/notification-sounds';
import { haptics } from '@/lib/haptics';
import { useReducedMotion } from './useReducedMotion';

export type NotificationType = 'alert' | 'message' | 'achievement' | 'insight' | 'reminder' | 'transaction';

interface NotificationPayload {
  new: {
    id: string;
    notification_type?: string;
    title?: string;
    message?: string;
    severity?: string;
    risk_level?: string;
  };
}

/**
 * Hook that integrates with wallet_notifications realtime subscription
 * Auto-plays appropriate sound based on notification type
 */
export function useNotificationSound(enabled: boolean = true) {
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const soundQueueRef = useRef<NotificationType[]>([]);
  const isPlayingRef = useRef(false);

  // Map notification types to sound types
  const mapNotificationType = useCallback((payload: NotificationPayload['new']): NotificationType => {
    const type = payload.notification_type?.toLowerCase() || '';
    const severity = payload.severity?.toLowerCase() || '';
    const riskLevel = payload.risk_level?.toLowerCase() || '';

    // High severity alerts
    if (severity === 'critical' || riskLevel === 'high') {
      return 'alert';
    }

    // Transaction alerts
    if (type.includes('transaction') || type.includes('spending')) {
      return 'transaction';
    }

    // Achievement/milestone notifications
    if (type.includes('achievement') || type.includes('milestone') || type.includes('goal')) {
      return 'achievement';
    }

    // AI insights
    if (type.includes('insight') || type.includes('ai') || type.includes('recommendation')) {
      return 'insight';
    }

    // Reminders
    if (type.includes('reminder') || type.includes('bill') || type.includes('due')) {
      return 'reminder';
    }

    // Default to message
    return 'message';
  }, []);

  // Play sound based on type
  const playSoundByType = useCallback((soundType: NotificationType) => {
    switch (soundType) {
      case 'alert':
        notificationSounds.alert();
        break;
      case 'achievement':
        notificationSounds.achievement();
        break;
      case 'insight':
        notificationSounds.insight();
        break;
      case 'reminder':
        notificationSounds.reminder();
        break;
      case 'transaction':
        notificationSounds.transaction();
        break;
      case 'message':
      default:
        notificationSounds.message();
    }
  }, []);

  // Process sound queue to prevent overlapping
  const processSoundQueue = useCallback(async () => {
    if (isPlayingRef.current || soundQueueRef.current.length === 0) return;

    isPlayingRef.current = true;
    const soundType = soundQueueRef.current.shift();

    if (soundType) {
      playSoundByType(soundType);
      
      // Add haptic feedback
      if (!prefersReducedMotion) {
        switch (soundType) {
          case 'alert':
            haptics.vibrate('heavy');
            break;
          case 'achievement':
            haptics.achievementUnlocked();
            break;
          case 'insight':
            haptics.notificationReceived();
            break;
          default:
            haptics.vibrate('light');
        }
      }

      // Wait before processing next sound
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    isPlayingRef.current = false;
    
    // Process next sound if queue has items
    if (soundQueueRef.current.length > 0) {
      processSoundQueue();
    }
  }, [prefersReducedMotion, playSoundByType]);

  // Queue a sound to play
  const queueSound = useCallback((type: NotificationType) => {
    // Limit queue size to prevent spam
    if (soundQueueRef.current.length < 5) {
      soundQueueRef.current.push(type);
      processSoundQueue();
    }
  }, [processSoundQueue]);

  // Manual trigger for specific notification types
  const playNotificationSound = useCallback((type: NotificationType) => {
    if (enabled) {
      queueSound(type);
    }
  }, [enabled, queueSound]);

  // Subscribe to wallet_notifications realtime updates
  useEffect(() => {
    if (!enabled || !user?.id) return;

    const channel = supabase
      .channel('notification-sounds')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: NotificationPayload) => {
          const soundType = mapNotificationType(payload.new);
          queueSound(soundType);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, user?.id, mapNotificationType, queueSound]);

  return {
    playNotificationSound,
    playAlert: () => playNotificationSound('alert'),
    playMessage: () => playNotificationSound('message'),
    playAchievement: () => playNotificationSound('achievement'),
    playInsight: () => playNotificationSound('insight'),
    playReminder: () => playNotificationSound('reminder'),
    playTransaction: () => playNotificationSound('transaction'),
  };
}
