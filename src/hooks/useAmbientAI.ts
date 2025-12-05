/**
 * @fileoverview Ambient AI Hook with User Attention Detection & Preference Persistence
 * Implements full state machine: IDLE → OBSERVING → INSIGHT_READY → SPEAKING → DISMISSED
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useUserActivity } from '@/hooks/useUserActivity';
import { useAmbientAIPreferences } from '@/hooks/useAmbientAIPreferences';

export type AmbientState = 'idle' | 'observing' | 'insight_ready' | 'speaking' | 'dismissed';

export interface AmbientInsight {
  id: string;
  message: string;
  type: 'tip' | 'alert' | 'celebration' | 'nudge';
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  timestamp: Date;
}

interface UseAmbientAIOptions {
  enabled?: boolean;
  maxQueueSize?: number;
}

export function useAmbientAI(options: UseAmbientAIOptions = {}) {
  const { enabled = true, maxQueueSize = 5 } = options;
  const { user } = useAuth();
  
  // Activity detection - prevents interrupting user
  const { isUserBusy, isIdle } = useUserActivity({
    scrollDebounceMs: 500,
    typingDebounceMs: 1000,
    idleThresholdMs: 30000,
  });

  // Preferences persistence
  const {
    preferences,
    isLoading: preferencesLoading,
    updatePreferences,
    isInQuietHours,
    trackFeedback,
    getDeliveryIntervalMs,
  } = useAmbientAIPreferences();
  
  const [state, setState] = useState<AmbientState>('idle');
  const [currentInsight, setCurrentInsight] = useState<AmbientInsight | null>(null);
  const [insightQueue, setInsightQueue] = useState<AmbientInsight[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [pendingDelivery, setPendingDelivery] = useState(false);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const deliveryCheckRef = useRef<NodeJS.Timeout | null>(null);

  // State machine transitions
  const transitionTo = useCallback((newState: AmbientState) => {
    setState(prev => {
      console.log(`[AmbientAI] State: ${prev} → ${newState}`);
      return newState;
    });
  }, []);

  // Process next insight from queue
  const processNextInsight = useCallback(() => {
    if (insightQueue.length === 0) {
      transitionTo('idle');
      setPendingDelivery(false);
      return;
    }

    const [next, ...rest] = insightQueue;
    setInsightQueue(rest);
    setCurrentInsight(next);
    transitionTo('insight_ready');
  }, [insightQueue, transitionTo]);

  // Dismiss current insight with feedback tracking
  const dismissInsight = useCallback((wasActedOn: boolean = false) => {
    if (currentInsight) {
      trackFeedback(currentInsight.type, wasActedOn ? 'acted' : 'dismissed');
    }
    
    setCurrentInsight(null);
    transitionTo('dismissed');
    
    // After a short delay, process next or go idle
    idleTimerRef.current = setTimeout(() => {
      processNextInsight();
    }, 1000);
  }, [currentInsight, processNextInsight, transitionTo, trackFeedback]);

  // Start speaking (show insight)
  const speak = useCallback(() => {
    if (state !== 'insight_ready') return;
    transitionTo('speaking');
    
    // Auto-dismiss after 8 seconds if not interacted
    speakingTimerRef.current = setTimeout(() => {
      dismissInsight(false);
    }, 8000);
  }, [state, transitionTo, dismissInsight]);

  // Check if we can deliver an insight (respects user attention + quiet hours)
  const canDeliverInsight = useCallback((): boolean => {
    // Don't deliver if muted
    if (preferences.isMuted) return false;
    
    // Don't deliver during quiet hours
    if (isInQuietHours()) return false;
    
    // Don't interrupt busy users
    if (isUserBusy) return false;
    
    return true;
  }, [preferences.isMuted, isInQuietHours, isUserBusy]);

  // Add insight to queue
  const addInsight = useCallback((insight: Omit<AmbientInsight, 'id' | 'timestamp'>) => {
    const newInsight: AmbientInsight = {
      ...insight,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    setInsightQueue(prev => {
      // Sort by priority and limit queue size
      const updated = [...prev, newInsight]
        .sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .slice(0, maxQueueSize);
      return updated;
    });

    // Mark that we have pending delivery
    if (state === 'idle') {
      transitionTo('observing');
      setPendingDelivery(true);
    }
  }, [state, maxQueueSize, transitionTo]);

  // Toggle mute with persistence
  const toggleMute = useCallback(() => {
    const newMuted = !preferences.isMuted;
    updatePreferences({ isMuted: newMuted });
    
    if (newMuted && currentInsight) {
      trackFeedback(currentInsight.type, 'muted');
    }
  }, [preferences.isMuted, updatePreferences, currentInsight, trackFeedback]);

  // Toggle voice with persistence
  const toggleVoice = useCallback(() => {
    updatePreferences({ voiceEnabled: !preferences.voiceEnabled });
  }, [preferences.voiceEnabled, updatePreferences]);

  // Set delivery frequency
  const setDeliveryFrequency = useCallback((frequency: typeof preferences.deliveryFrequency) => {
    updatePreferences({ deliveryFrequency: frequency });
  }, [updatePreferences]);

  // Periodic check for delivering queued insights when user becomes idle
  useEffect(() => {
    if (!pendingDelivery || insightQueue.length === 0) return;

    const checkAndDeliver = () => {
      if (canDeliverInsight() && state === 'observing') {
        processNextInsight();
        setPendingDelivery(false);
      }
    };

    // Check immediately
    checkAndDeliver();

    // Also check periodically
    deliveryCheckRef.current = setInterval(checkAndDeliver, 2000);

    return () => {
      if (deliveryCheckRef.current) clearInterval(deliveryCheckRef.current);
    };
  }, [pendingDelivery, insightQueue.length, canDeliverInsight, state, processNextInsight]);

  // Connect to SSE stream
  useEffect(() => {
    if (!enabled || !user?.id || preferencesLoading) return;

    const connectSSE = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ambient-ai-stream`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id })
        });

        if (!response.ok || !response.body) {
          console.error('[AmbientAI] Failed to connect:', response.status);
          return;
        }

        setIsConnected(true);
        transitionTo('observing');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const processStream = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim();
                if (jsonStr === '[DONE]') continue;

                try {
                  const data = JSON.parse(jsonStr);
                  if (data.insight) {
                    addInsight({
                      message: data.insight.message,
                      type: data.insight.type || 'tip',
                      priority: data.insight.priority || 'medium',
                      actionUrl: data.insight.actionUrl,
                      actionLabel: data.insight.actionLabel
                    });
                  }
                } catch (e) {
                  console.error('[AmbientAI] Parse error:', e);
                }
              }
            }
          }
        };

        processStream().catch(console.error);

      } catch (error) {
        console.error('[AmbientAI] Connection error:', error);
        setIsConnected(false);
      }
    };

    connectSSE();

    // Also listen to Supabase Realtime for instant updates
    const channel = supabase
      .channel('ambient-insights')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_nudges',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            const nudge = payload.new as any;
            addInsight({
              message: nudge.message,
              type: nudge.nudge_type as AmbientInsight['type'] || 'nudge',
              priority: nudge.priority >= 80 ? 'high' : nudge.priority >= 50 ? 'medium' : 'low',
              actionUrl: nudge.action_url,
              actionLabel: 'Take Action'
            });
          }
        }
      )
      .subscribe();

    return () => {
      eventSourceRef.current?.close();
      supabase.removeChannel(channel);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
      if (deliveryCheckRef.current) clearInterval(deliveryCheckRef.current);
      setIsConnected(false);
    };
  }, [enabled, user?.id, preferencesLoading, addInsight, transitionTo]);

  // Auto-speak when insight is ready and conditions are met
  useEffect(() => {
    if (state === 'insight_ready' && currentInsight && canDeliverInsight()) {
      const timer = setTimeout(speak, 500);
      return () => clearTimeout(timer);
    }
  }, [state, currentInsight, speak, canDeliverInsight]);

  return {
    // State
    state,
    currentInsight,
    insightQueue,
    queueLength: insightQueue.length,
    isConnected,
    
    // Preferences (from persistence)
    isMuted: preferences.isMuted,
    voiceEnabled: preferences.voiceEnabled,
    deliveryFrequency: preferences.deliveryFrequency,
    quietHoursEnabled: preferences.quietHoursEnabled,
    
    // Activity awareness
    isUserBusy,
    isIdle,
    isInQuietHours: isInQuietHours(),
    canDeliver: canDeliverInsight(),
    
    // Actions
    dismissInsight,
    toggleMute,
    toggleVoice,
    setDeliveryFrequency,
    addInsight,
  };
}
