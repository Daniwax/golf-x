/**
 * Simple, efficient cache service with request deduplication
 * Prevents duplicate API calls and provides memory caching with TTL
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface PendingRequest<T = unknown> {
  promise: Promise<T>;
  timestamp: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pending = new Map<string, PendingRequest<unknown>>();
  private maxEntries = 200; // Reasonable for mobile devices
  private maxPendingAge = 30000; // 30 seconds max for pending requests

  /**
   * Get data from cache or fetch it
   * Includes automatic request deduplication
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 min default
  ): Promise<T> {
    // 1. Check if we have valid cached data
    const cached = this.cache.get(key);
    if (cached && !this.isExpired(cached)) {
      console.log(`[Cache HIT] ${key}`);
      return cached.data as T;
    }

    // 2. Check if request is already pending (deduplication)
    const pending = this.pending.get(key);
    if (pending && !this.isPendingExpired(pending)) {
      console.log(`[Cache DEDUPE] ${key} - reusing pending request`);
      return pending.promise;
    }

    // 3. Fetch new data
    console.log(`[Cache MISS] ${key} - fetching new data`);
    
    const promise = fetcher()
      .then(data => {
        // Cache the successful result
        this.set(key, data, ttl);
        this.pending.delete(key);
        return data;
      })
      .catch(error => {
        // Clean up on error
        this.pending.delete(key);
        throw error;
      });

    // Store pending request for deduplication
    this.pending.set(key, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  /**
   * Set data in cache with TTL
   */
  private set<T>(key: string, data: T, ttl: number): void {
    // Enforce cache size limit
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Invalidate cache entries by key or pattern
   */
  invalidate(pattern: string): void {
    if (pattern.includes('*')) {
      // Pattern-based invalidation
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      const keysToDelete: string[] = [];
      
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => {
        this.cache.delete(key);
        console.log(`[Cache INVALIDATE] ${key}`);
      });
    } else {
      // Direct key invalidation
      this.cache.delete(pattern);
      console.log(`[Cache INVALIDATE] ${pattern}`);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.pending.clear();
    console.log('[Cache CLEAR] All entries removed');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    entries: number;
    pending: number;
    sizeEstimate: string;
  } {
    const sizeEstimate = this.estimateCacheSize();
    return {
      entries: this.cache.size,
      pending: this.pending.size,
      sizeEstimate
    };
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Check if pending request is too old
   */
  private isPendingExpired(pending: PendingRequest): boolean {
    return Date.now() - pending.timestamp > this.maxPendingAge;
  }

  /**
   * Evict oldest cache entry (simple LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`[Cache EVICT] ${oldestKey} (oldest entry)`);
    }
  }

  /**
   * Estimate cache memory usage
   */
  private estimateCacheSize(): string {
    let totalSize = 0;
    
    for (const entry of this.cache.values()) {
      // Rough estimate: stringify and count characters
      try {
        const dataStr = JSON.stringify(entry.data);
        totalSize += dataStr.length * 2; // 2 bytes per character (UTF-16)
      } catch {
        totalSize += 1000; // Default estimate for non-serializable
      }
    }

    if (totalSize < 1024) return `${totalSize} bytes`;
    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(1)} KB`;
    return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Clean up expired entries (can be called periodically)
   */
  cleanup(): void {
    const keysToDelete: string[] = [];

    // Clean expired cache entries
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      console.log(`[Cache CLEANUP] ${key} (expired)`);
    });

    // Clean old pending requests
    const pendingToDelete: string[] = [];
    for (const [key, pending] of this.pending.entries()) {
      if (this.isPendingExpired(pending)) {
        pendingToDelete.push(key);
      }
    }

    pendingToDelete.forEach(key => {
      this.pending.delete(key);
      console.log(`[Cache CLEANUP] ${key} (pending expired)`);
    });
  }
}

// Export singleton instance
export const cacheService = new CacheService();