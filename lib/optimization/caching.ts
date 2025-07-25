// Caching utilities for better performance
import { useState, useEffect, useCallback } from 'react';

// Cache interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// In-memory cache
class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const globalCache = new MemoryCache();

// Cache keys for different data types
export const CACHE_KEYS = {
  TOURS: 'tours',
  TOUR_DETAIL: (slug: string) => `tour:${slug}`,
  BOOKINGS: 'bookings',
  BOOKING_DETAIL: (id: string) => `booking:${id}`,
  AIRPORT_PICKUP_BOOKINGS: 'airport-pickup-bookings',
  DRIVERS: 'drivers',
  CUSTOMERS: 'customers',
  CONTENT: 'content',
  IMAGES: 'images',
  SETTINGS: 'settings',
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 1 * 60 * 1000,    // 1 minute
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 15 * 60 * 1000,    // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;

// Cache utility functions
export const cacheUtils = {
  // Set cache item
  set<T>(key: string, data: T, ttl: number = CACHE_TTL.MEDIUM): void {
    globalCache.set(key, data, ttl);
  },

  // Get cache item
  get<T>(key: string): T | null {
    return globalCache.get<T>(key);
  },

  // Check if cache has item
  has(key: string): boolean {
    return globalCache.has(key);
  },

  // Delete cache item
  delete(key: string): boolean {
    return globalCache.delete(key);
  },

  // Clear all cache
  clear(): void {
    globalCache.clear();
  },

  // Get cache size
  size(): number {
    return globalCache.size();
  },

  // Cache with async function
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  },
};

// React hook for cached data
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await cacheUtils.getOrSet(key, fetchFn, ttl);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key, ttl, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    cacheUtils.delete(key);
    fetchData();
  }, [key, fetchData]);

  return { data, loading, error, refetch };
}

// Cache invalidation utilities
export const cacheInvalidation = {
  // Invalidate tours cache
  invalidateTours(): void {
    cacheUtils.delete(CACHE_KEYS.TOURS);
    // Also invalidate individual tour details
    // This is a simplified approach - in a real app you might want more granular control
  },

  // Invalidate bookings cache
  invalidateBookings(): void {
    cacheUtils.delete(CACHE_KEYS.BOOKINGS);
    cacheUtils.delete(CACHE_KEYS.AIRPORT_PICKUP_BOOKINGS);
  },

  // Invalidate specific tour
  invalidateTour(slug: string): void {
    cacheUtils.delete(CACHE_KEYS.TOUR_DETAIL(slug));
    cacheUtils.delete(CACHE_KEYS.TOURS); // Also invalidate list
  },

  // Invalidate specific booking
  invalidateBooking(id: string): void {
    cacheUtils.delete(CACHE_KEYS.BOOKING_DETAIL(id));
    cacheUtils.delete(CACHE_KEYS.BOOKINGS); // Also invalidate list
  },

  // Invalidate all cache
  invalidateAll(): void {
    cacheUtils.clear();
  },
};

// Local storage cache for persistent data
export const localStorageCache = {
  set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  },

  delete(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  },
};

// Session storage cache for session-specific data
export const sessionStorageCache = {
  set<T>(key: string, data: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
    }
  },

  get<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to read from sessionStorage:', error);
      return null;
    }
  },

  delete(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to delete from sessionStorage:', error);
    }
  },

  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  },
};

// Cache performance monitoring
export const cacheMetrics = {
  hits: 0,
  misses: 0,
  sets: 0,

  recordHit(): void {
    this.hits++;
  },

  recordMiss(): void {
    this.misses++;
  },

  recordSet(): void {
    this.sets++;
  },

  getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  },

  reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
  },

  getStats(): { hits: number; misses: number; sets: number; hitRate: number } {
    return {
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      hitRate: this.getHitRate(),
    };
  },
}; 