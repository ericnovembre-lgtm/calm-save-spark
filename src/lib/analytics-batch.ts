/**
 * Analytics Event Batching System
 * Buffers events and sends them in batches to improve performance
 */

import { supabase } from '@/integrations/supabase/client';
import posthog from 'posthog-js';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  timestamp: string;
}

class AnalyticsBatcher {
  private queue: AnalyticsEvent[] = [];
  private readonly batchSize = 10;
  private readonly flushInterval = 5000; // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;

  constructor() {
    // Start flush timer
    this.startFlushTimer();
    
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush(true));
      
      // Flush when page becomes hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.flush(true);
        }
      });
    }
  }

  /**
   * Add event to batch queue
   */
  addEvent(event: AnalyticsEvent): void {
    this.queue.push(event);
    
    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics Batch] Queued:', event.event, `(${this.queue.length}/${this.batchSize})`);
    }
    
    // Flush if batch is full
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  /**
   * Flush all queued events
   */
  async flush(sync = false): Promise<void> {
    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;
    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      if (import.meta.env.DEV) {
        console.log('[Analytics Batch] Flushing', eventsToSend.length, 'events');
      }

      // Send to PostHog if initialized
      if (typeof posthog !== 'undefined' && posthog.isFeatureEnabled) {
        eventsToSend.forEach(event => {
          posthog.capture(event.event, event.properties);
          if (event.userId) {
            posthog.identify(event.userId);
          }
        });
        
        if (import.meta.env.DEV) {
          console.log('[Analytics Batch] Sent to PostHog');
        }
        return;
      }

      // Fallback: Send batch to Supabase edge function
      const sendBatch = async () => {
        const { error } = await supabase.functions.invoke('analytics', {
          body: {
            events: eventsToSend,
            batch: true
          }
        });

        if (error && import.meta.env.DEV) {
          console.warn('[Analytics Batch] Edge function error:', error);
        } else if (import.meta.env.DEV) {
          console.log('[Analytics Batch] Sent to edge function');
        }
      };

      if (sync && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        // Use sendBeacon for synchronous sends (page unload)
        const blob = new Blob(
          [JSON.stringify({ events: eventsToSend, batch: true })],
          { type: 'application/json' }
        );
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics`;
        navigator.sendBeacon(url, blob);
        
        if (import.meta.env.DEV) {
          console.log('[Analytics Batch] Sent via sendBeacon');
        }
      } else {
        // Regular async send
        await sendBatch();
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[Analytics Batch] Flush error (non-blocking):', error);
      }
      // Re-queue failed events
      this.queue.unshift(...eventsToSend);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear all queued events
   */
  clearQueue(): void {
    this.queue = [];
  }
}

// Export singleton instance
export const analyticsBatcher = new AnalyticsBatcher();
