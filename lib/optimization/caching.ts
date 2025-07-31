/**
 * Simple Caching Utility for Mystic Tours
 * Provides in-memory caching for frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Delete a value from the cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired
    };
  }
}

// Create a singleton instance
export const cache = new SimpleCache();

/**
 * Cache decorator for functions
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = 300000
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);
    
    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result, ttl);
    return result;
  }) as T;
}

/**
 * Predefined cache keys
 */
export const CACHE_KEYS = {
  TOURS_LIST: 'tours:list',
  TOUR_DETAILS: (slug: string) => `tour:${slug}`,
  DRIVERS_AVAILABLE: 'drivers:available',
  BOOKINGS_STATS: 'bookings:stats',
  AIRPORT_PICKUP_STATS: 'airport_pickup:stats',
  TESTIMONIALS: 'testimonials:approved',
} as const;

/**
 * Cache invalidation utilities
 */
export const cacheUtils = {
  /**
   * Invalidate tour-related cache
   */
  invalidateTours: () => {
    cache.delete(CACHE_KEYS.TOURS_LIST);
    // Note: Individual tour cache invalidation would need to be done per tour
  },

  /**
   * Invalidate driver-related cache
   */
  invalidateDrivers: () => {
    cache.delete(CACHE_KEYS.DRIVERS_AVAILABLE);
  },

  /**
   * Invalidate booking-related cache
   */
  invalidateBookings: () => {
    cache.delete(CACHE_KEYS.BOOKINGS_STATS);
    cache.delete(CACHE_KEYS.AIRPORT_PICKUP_STATS);
  },

  /**
   * Invalidate testimonials cache
   */
  invalidateTestimonials: () => {
    cache.delete(CACHE_KEYS.TESTIMONIALS);
  }
}; 