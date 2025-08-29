/**
 * Unified Data Service for Golf X
 * Facade for all domain-specific data services
 */

import { CacheService, cacheService } from '../cache/CacheService';
import { CourseDataService } from './CourseDataService';
import { ProfileDataService } from './ProfileDataService';
import { GameDataService } from './GameDataService';
import { StatsDataService } from './StatsDataService';

/**
 * Main DataService class
 * Provides unified API for all data operations
 */
export class DataService {
  public readonly cache: CacheService;
  public readonly courses: CourseDataService;
  public readonly profiles: ProfileDataService;
  public readonly games: GameDataService;
  public readonly stats: StatsDataService;

  constructor(cache: CacheService) {
    this.cache = cache;
    
    // Initialize domain services
    this.courses = new CourseDataService(cache);
    this.profiles = new ProfileDataService(cache);
    this.games = new GameDataService(cache);
    this.stats = new StatsDataService(cache);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.cache.clear();
    console.log('[DataService] All caches cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Run cache cleanup
   */
  cleanupCache(): void {
    this.cache.cleanup();
  }
}

// Create and export singleton instance
export const dataService = new DataService(cacheService);

// Set up periodic cleanup
setInterval(() => {
  dataService.cleanupCache();
}, 5 * 60 * 1000); // Every 5 minutes