import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type EventType = 'view' | 'click' | 'pin' | 'unpin' | 'hide' | 'drag' | 'action';

interface AnalyticsEvent {
  widget_id: string;
  event_type: EventType;
  action_name?: string;
  duration_ms?: number;
  metadata?: Record<string, any>;
}

// Queue for batching analytics events
const eventQueue: AnalyticsEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

export function useWidgetAnalytics() {
  const { user } = useAuth();
  const viewStartTimes = useRef<Map<string, number>>(new Map());

  // Flush queued events to database
  const flushEvents = useCallback(async () => {
    if (!user?.id || eventQueue.length === 0) return;
    
    const eventsToFlush = [...eventQueue];
    eventQueue.length = 0;
    
    try {
      const { error } = await supabase
        .from('widget_analytics')
        .insert(eventsToFlush.map(event => ({
          user_id: user.id,
          ...event
        })));
      
      if (error) console.error('Analytics flush error:', error);
    } catch (err) {
      console.error('Analytics error:', err);
    }
  }, [user?.id]);

  // Schedule flush with debounce
  const scheduleFlush = useCallback(() => {
    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = setTimeout(flushEvents, 2000);
  }, [flushEvents]);

  // Track widget view (intersection-based)
  const trackView = useCallback((widgetId: string) => {
    if (!user?.id) return;
    
    viewStartTimes.current.set(widgetId, Date.now());
    
    eventQueue.push({
      widget_id: widgetId,
      event_type: 'view',
      metadata: { viewport: { width: window.innerWidth, height: window.innerHeight } }
    });
    scheduleFlush();
  }, [user?.id, scheduleFlush]);

  // Track view duration when widget leaves viewport
  const trackViewEnd = useCallback((widgetId: string) => {
    if (!user?.id) return;
    
    const startTime = viewStartTimes.current.get(widgetId);
    if (startTime) {
      const duration = Date.now() - startTime;
      viewStartTimes.current.delete(widgetId);
      
      // Only log if viewed for at least 2 seconds
      if (duration >= 2000) {
        eventQueue.push({
          widget_id: widgetId,
          event_type: 'view',
          duration_ms: duration
        });
        scheduleFlush();
      }
    }
  }, [user?.id, scheduleFlush]);

  // Track widget click
  const trackClick = useCallback((widgetId: string, metadata?: Record<string, any>) => {
    if (!user?.id) return;
    
    eventQueue.push({
      widget_id: widgetId,
      event_type: 'click',
      metadata
    });
    scheduleFlush();
  }, [user?.id, scheduleFlush]);

  // Track pin/unpin
  const trackPin = useCallback((widgetId: string, isPinned: boolean) => {
    if (!user?.id) return;
    
    eventQueue.push({
      widget_id: widgetId,
      event_type: isPinned ? 'pin' : 'unpin'
    });
    scheduleFlush();
  }, [user?.id, scheduleFlush]);

  // Track hide
  const trackHide = useCallback((widgetId: string) => {
    if (!user?.id) return;
    
    eventQueue.push({
      widget_id: widgetId,
      event_type: 'hide'
    });
    scheduleFlush();
  }, [user?.id, scheduleFlush]);

  // Track drag/reorder
  const trackDrag = useCallback((widgetId: string, newPosition: number) => {
    if (!user?.id) return;
    
    eventQueue.push({
      widget_id: widgetId,
      event_type: 'drag',
      metadata: { newPosition }
    });
    scheduleFlush();
  }, [user?.id, scheduleFlush]);

  // Track quick action click
  const trackAction = useCallback((widgetId: string, actionName: string) => {
    if (!user?.id) return;
    
    eventQueue.push({
      widget_id: widgetId,
      event_type: 'action',
      action_name: actionName
    });
    scheduleFlush();
  }, [user?.id, scheduleFlush]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (flushTimeout) clearTimeout(flushTimeout);
      flushEvents();
    };
  }, [flushEvents]);

  return {
    trackView,
    trackViewEnd,
    trackClick,
    trackPin,
    trackHide,
    trackDrag,
    trackAction
  };
}
