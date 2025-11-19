/**
 * Request Coalescing System
 * Phase 6: Advanced Performance Features
 * 
 * Deduplicates identical concurrent requests to reduce server load
 * and improve response times
 */

class RequestCoalescer {
  private pending = new Map<string, Promise<any>>();
  private hitCount = 0;
  private missCount = 0;

  /**
   * Execute a request with deduplication
   * If an identical request is already in-flight, return that promise instead
   */
  async fetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check if request is already pending
    if (this.pending.has(key)) {
      this.hitCount++;
      console.debug(`[RequestCoalescer] Cache HIT for key: ${key} (${this.hitCount} hits total)`);
      return this.pending.get(key) as Promise<T>;
    }

    this.missCount++;
    console.debug(`[RequestCoalescer] Cache MISS for key: ${key} (${this.missCount} misses total)`);

    // Create new request and store in pending map
    const promise = fetcher().finally(() => {
      // Clean up after request completes
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }

  /**
   * Get coalescing statistics for monitoring
   */
  getStats() {
    return {
      hits: this.hitCount,
      misses: this.missCount,
      pending: this.pending.size,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
    };
  }

  /**
   * Clear all pending requests
   */
  clear() {
    this.pending.clear();
  }
}

// Global instance
export const coalescer = new RequestCoalescer();

/**
 * Helper to create a cache key from a request configuration
 */
export function createCacheKey(
  method: string,
  url: string,
  body?: any,
  params?: Record<string, any>
): string {
  const parts = [method, url];
  
  if (params) {
    parts.push(JSON.stringify(params));
  }
  
  if (body) {
    parts.push(JSON.stringify(body));
  }
  
  return parts.join('|');
}
